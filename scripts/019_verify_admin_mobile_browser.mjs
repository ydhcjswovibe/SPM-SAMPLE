import fs from 'node:fs'
import path from 'node:path'

import { chromium } from 'playwright'

import {
  LOCAL_RUNTIME_ACCOUNTS,
  getRuntimePassword,
} from './lib/runtime-auth.mjs'
import { resolveBaseUrl } from './lib/runtime-http.mjs'

const baseUrl = resolveBaseUrl()
const ownerAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'OWNER')
const mobileViewport = { width: 390, height: 844 }
const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

if (!ownerAccount) {
  throw new Error('Missing runtime QA owner account')
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function configureLocalBrowserLibs() {
  const candidateDirs = [
    path.join(process.cwd(), 'tmp/playwright-libs/libnspr4_2%3a4.35-1.1build1_amd64/usr/lib/x86_64-linux-gnu'),
    path.join(process.cwd(), 'tmp/playwright-libs/libnss3_2%3a3.98-1ubuntu0.1_amd64/usr/lib/x86_64-linux-gnu'),
    path.join(process.cwd(), 'tmp/playwright-libs/libasound2t64_1.2.11-1ubuntu0.2_amd64/usr/lib/x86_64-linux-gnu'),
  ].filter((entry) => fs.existsSync(entry))

  if (candidateDirs.length === 0) {
    return null
  }

  const current = process.env.LD_LIBRARY_PATH?.trim()
  const merged = current ? [...candidateDirs, current] : candidateDirs
  process.env.LD_LIBRARY_PATH = merged.join(':')
  return candidateDirs
}

function alphaFromCssColor(value) {
  if (!value || value === 'transparent') {
    return 0
  }

  const rgbaMatch = value.match(/^rgba\((.+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim())
    return Number(parts[3] ?? 1)
  }

  if (value.startsWith('rgb(')) {
    return 1
  }

  return 1
}

async function readSurface(locator) {
  return await locator.evaluate((node) => {
    const style = window.getComputedStyle(node)
    const rect = node.getBoundingClientRect()

    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    }
  })
}

function assertOpaqueSurface(surface, label) {
  const alpha = alphaFromCssColor(surface.backgroundColor)
  const hasVisibleBackground = alpha > 0.15 || surface.backgroundImage !== 'none'
  const opacity = Number(surface.opacity)

  expect(hasVisibleBackground, `${label} background should not be transparent`)
  expect(Number.isFinite(opacity) && opacity >= 0.85, `${label} opacity should stay opaque enough`)
}

async function loginWithUi(page, account) {
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('이메일').fill(account.email)
  await page.getByLabel('비밀번호').fill(getRuntimePassword())
  await page.getByLabel('비밀번호').press('Enter')
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
    timeout: 15000,
    waitUntil: 'commit',
  })
}

async function verifyMonthPopover(page, results) {
  const monthSelect = page.getByLabel('운영 월 선택').first()
  const beforeLabel = (await monthSelect.textContent())?.trim() ?? ''
  const selectedMonthMatch = beforeLabel.match(/(\d{1,2})월/)
  const selectedMonthLabel = selectedMonthMatch ? `${selectedMonthMatch[1]}월` : '1월'

  await monthSelect.click()
  await page.getByRole('button', { name: '이전 연도' }).waitFor({ state: 'visible', timeout: 15000 })

  const openSurface = await readSurface(monthSelect)
  assertOpaqueSurface(openSurface, '운영 월 선택 open state')

  for (const label of monthLabels) {
    await page.getByRole('button', { name: label }).first().waitFor({ state: 'visible', timeout: 15000 })
  }

  const yearChip = page.getByText(/^\d{4}년$/).first()
  const initialYear = (await yearChip.textContent())?.trim() ?? null

  const prevYearButton = page.getByRole('button', { name: '이전 연도' })
  if (!(await prevYearButton.isDisabled())) {
    await prevYearButton.click()
    await page.waitForTimeout(150)
    const movedYear = (await yearChip.textContent())?.trim() ?? null
    expect(movedYear && movedYear !== initialYear, 'Month popover year header should change after previous year click')

    const nextYearButton = page.getByRole('button', { name: '다음 연도' })
    await nextYearButton.click()
    await page.waitForTimeout(150)
  }

  await page.getByRole('button', { name: selectedMonthLabel }).first().click()
  await expectLocatorHidden(page.getByRole('button', { name: '이전 연도' }).first(), '운영 월 선택 popover')

  const afterLabel = (await monthSelect.textContent())?.trim() ?? ''
  expect(afterLabel === beforeLabel, 'Month selector should keep the same label after closing with the selected month')

  results.admin.monthSelector = {
    beforeLabel,
    afterLabel,
    surface: openSurface,
    monthButtonCount: monthLabels.length,
    initialYear,
  }
}

async function expectLocatorHidden(locator, label) {
  try {
    await locator.waitFor({ state: 'hidden', timeout: 15000 })
  } catch {
    throw new Error(`${label} should close`)
  }
}

async function verifyAdminHome(page, results) {
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' })

  const classSelect = page.getByLabel('운영 수업 선택').first()
  const monthSelect = page.getByLabel('운영 월 선택').first()
  const menuButton = page.getByLabel('관리자 메뉴 열기').first()
  const filterButton = page.getByLabel('학생 출석부 필터 열기').first()
  const bottomNav = page.locator('nav').filter({ has: page.locator('a[aria-label="운영"]') }).first()

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })
  await menuButton.waitFor({ state: 'visible', timeout: 15000 })
  await filterButton.waitFor({ state: 'visible', timeout: 15000 })
  await bottomNav.waitFor({ state: 'visible', timeout: 15000 })

  const classSurface = await readSurface(classSelect)
  const monthSurface = await readSurface(monthSelect)
  const filterSurface = await readSurface(filterButton)
  const bottomNavSurface = await readSurface(bottomNav.locator('div').first())
  assertOpaqueSurface(classSurface, '운영 수업 선택')
  assertOpaqueSurface(monthSurface, '운영 월 선택')
  assertOpaqueSurface(filterSurface, '학생 출석부 필터 버튼')
  assertOpaqueSurface(bottomNavSurface, '운영 하단탭 바')

  expect(classSurface.left < monthSurface.left, '운영 수업 선택 should render before 운영 월 선택')
  const menuLeft = await menuButton.evaluate((node) => node.getBoundingClientRect().left)
  expect(monthSurface.right <= menuLeft, '운영 월 선택 should render before 메뉴')

  await verifyMonthPopover(page, results)

  await filterButton.click()
  const replyOnlyItem = page.getByRole('menuitemcheckbox', { name: '답글 도착만' }).first()
  await replyOnlyItem.waitFor({ state: 'visible', timeout: 15000 })
  await page.keyboard.press('Escape')
  await expectLocatorHidden(replyOnlyItem, '학생 출석부 필터 메뉴')

  await menuButton.click()
  await page.getByRole('menuitem', { name: '새 수업 만들기' }).waitFor({ state: 'visible', timeout: 15000 })
  const menuSurface = await readSurface(menuButton)
  assertOpaqueSurface(menuSurface, '관리자 메뉴 open state')

  await page.getByRole('menuitem', { name: '삭제 모드' }).click()
  await page.getByLabel('삭제할 운영 수업 선택').first().waitFor({ state: 'visible', timeout: 15000 })

  const attendanceTrigger = page.getByRole('button', { name: /출석 (체크|해제)/ }).first()
  const memoTrigger = page.getByRole('button', { name: /학생.*메모 열기/ }).first()
  await attendanceTrigger.waitFor({ state: 'visible', timeout: 15000 })
  await memoTrigger.waitFor({ state: 'visible', timeout: 15000 })
  const attendanceSurface = await readSurface(attendanceTrigger)
  const memoSurface = await readSurface(memoTrigger)
  expect(attendanceSurface.width >= 32, '운영 mobile 출석 trigger width should keep touch target')
  expect(attendanceSurface.height >= 32, '운영 mobile 출석 trigger height should keep touch target')
  expect(memoSurface.width >= 32, '운영 mobile 메모 trigger width should keep touch target')
  expect(memoSurface.height >= 32, '운영 mobile 메모 trigger height should keep touch target')

  results.admin.home = {
    classSurface,
    monthSurface,
    filterSurface,
    menuSurface,
    bottomNavSurface,
    attendanceSurface,
    memoSurface,
  }
}

async function verifyAdminStudents(page, results) {
  const bottomNav = page.locator('nav').filter({ has: page.locator('a[aria-label="운영"]') }).first()
  const studentNavLink = bottomNav.locator('a[aria-label="학생"]').first()
  await studentNavLink.waitFor({ state: 'visible', timeout: 15000 })
  expect(await studentNavLink.getAttribute('href') === '/admin/students', '학생 하단탭 href should point to /admin/students')
  await page.goto(`${baseUrl}/admin/students`, { waitUntil: 'domcontentloaded' })

  const classSelect = page.getByLabel('학생 배정 수업 선택').first()
  const monthSelect = page.getByLabel('등록 월 선택').first()
  const activeNav = page.locator('nav').filter({ has: page.locator('a[aria-label="운영"]') }).first().locator('a[aria-label="학생"]').first()
  const paymentButton = page.getByLabel(/결제 상태/).first()
  const statusButton = page.getByLabel(/등록 상태/).first()
  const feedbackLink = page.getByLabel(/피드백 입력 열기/).first()

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })
  await paymentButton.waitFor({ state: 'visible', timeout: 15000 })
  await statusButton.waitFor({ state: 'visible', timeout: 15000 })
  await feedbackLink.waitFor({ state: 'visible', timeout: 15000 })

  const classSurface = await readSurface(classSelect)
  const monthSurface = await readSurface(monthSelect)
  const activeNavSurface = await readSurface(activeNav)
  const paymentSurface = await readSurface(paymentButton)
  const statusSurface = await readSurface(statusButton)
  const feedbackSurface = await readSurface(feedbackLink)

  assertOpaqueSurface(classSurface, '학생 배정 수업 선택')
  assertOpaqueSurface(monthSurface, '등록 월 선택')
  assertOpaqueSurface(activeNavSurface, '학생 하단탭 active state')

  expect(classSurface.left < monthSurface.left, '학생 배정 수업 선택 should render before 등록 월 선택')
  expect(paymentSurface.width >= 64 && paymentSurface.height >= 30, '결제 상태 버튼 should keep mobile touch target')
  expect(statusSurface.width >= 64 && statusSurface.height >= 30, '등록 상태 버튼 should keep mobile touch target')
  expect(feedbackSurface.right <= mobileViewport.width, '학생 row action should stay inside mobile viewport')

  results.admin.students = {
    classSurface,
    monthSurface,
    activeNavSurface,
    paymentSurface,
    statusSurface,
    feedbackSurface,
  }
}

async function verifyAdminContent(page, results) {
  const bottomNav = page.locator('nav').filter({ has: page.locator('a[aria-label="운영"]') }).first()
  const contentNavLink = bottomNav.locator('a[aria-label="수업"]').first()
  await contentNavLink.waitFor({ state: 'visible', timeout: 15000 })
  expect(await contentNavLink.getAttribute('href') === '/admin/content', '수업 하단탭 href should point to /admin/content')
  await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'domcontentloaded' })

  const classSelect = page.getByLabel('콘텐츠 수업 선택').first()
  const monthSelect = page.getByLabel('콘텐츠 월 선택').first()
  const activeNav = page.locator('nav').filter({ has: page.locator('a[aria-label="운영"]') }).first().locator('a[aria-label="수업"]').first()

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })

  const classSurface = await readSurface(classSelect)
  const monthSurface = await readSurface(monthSelect)
  const activeNavSurface = await readSurface(activeNav)

  assertOpaqueSurface(classSurface, '콘텐츠 수업 선택')
  assertOpaqueSurface(monthSurface, '콘텐츠 월 선택')
  assertOpaqueSurface(activeNavSurface, '수업 하단탭 active state')
  expect(classSurface.left < monthSurface.left, '콘텐츠 수업 선택 should render before 콘텐츠 월 선택')

  results.admin.content = {
    classSurface,
    monthSurface,
    activeNavSurface,
  }
}

async function main() {
  configureLocalBrowserLibs()

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: mobileViewport,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  const results = {
    baseUrl,
    viewport: mobileViewport,
    role: ownerAccount.role,
    admin: {},
  }

  try {
    await loginWithUi(page, ownerAccount)
    await verifyAdminHome(page, results)
    await verifyAdminStudents(page, results)
    await verifyAdminContent(page, results)
  } finally {
    await context.close()
    await browser.close()
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
