import fs from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'

import {
  LOCAL_RUNTIME_ACCOUNTS,
  getRuntimePassword,
  readJson,
} from './lib/runtime-auth.mjs'
import { loginAs, request, resolveBaseUrl } from './lib/runtime-http.mjs'
import { expectOpaqueSurface } from './lib/surface-assert.mjs'

const baseUrl = resolveBaseUrl()
const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')
const studentAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'STUDENT')
const browserSmokeVideoUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=M7lc1UVf-VE',
]
const browserSmokeVideoIds = ['dQw4w9WgXcQ', 'M7lc1UVf-VE']
const browserSmokeNotes = {
  progress: '브라우저 연동 진행 메모',
  shared: '브라우저 공통 피드백',
  private: '브라우저 개인 피드백',
  admin: '브라우저 내부메모',
}

if (!adminAccount || !studentAccount) {
  throw new Error('Missing runtime QA accounts')
}

function createPngFile(name = 'browser-smoke.png') {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4e0AAAAASUVORK5CYII='

  return new File([Buffer.from(pngBase64, 'base64')], name, {
    type: 'image/png',
  })
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

async function createBrowserSmokeMedia(adminJar, target) {
  const videoIds = []

  for (const url of browserSmokeVideoUrls) {
    const videoResponse = await request(
      baseUrl,
      '/api/admin/weekly-media',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: target.classId,
          yearMonth: target.yearMonth,
          weekNumber: 1,
          url,
        }),
      },
      adminJar,
    )
    const videoPayload = await readJson(videoResponse, 'Failed to create browser smoke video')
    videoIds.push(videoPayload.data.id)
  }

  const imageForm = new FormData()
  imageForm.set('classId', target.classId)
  imageForm.set('yearMonth', target.yearMonth)
  imageForm.set('weekNumber', '1')
  imageForm.set('file', createPngFile())

  const imageResponse = await request(
    baseUrl,
    '/api/admin/weekly-media/image',
    {
      method: 'POST',
      body: imageForm,
    },
    adminJar,
  )
  const imagePayload = await readJson(imageResponse, 'Failed to create browser smoke image')

  return {
    videoIds,
    videoYoutubeIds: browserSmokeVideoIds,
    imageId: imagePayload.data.id,
  }
}

async function upsertBrowserSmokeNotes(adminJar, studentId, target) {
  const response = await request(
    baseUrl,
    '/api/admin/weekly-notes',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId: target.classId,
        yearMonth: target.yearMonth,
        weekNumber: 1,
        progressText: browserSmokeNotes.progress,
        sharedFeedbackText: browserSmokeNotes.shared,
        adminNoteText: browserSmokeNotes.admin,
        memberFeedbackByStudentId: {
          [studentId]: browserSmokeNotes.private,
        },
      }),
    },
    adminJar,
  )

  return await readJson(response, 'Failed to create browser smoke notes')
}

async function resolveStudentVisibleTarget() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: studentAccount.email,
    password: getRuntimePassword(),
  })

  if (signInError) {
    throw signInError
  }

  try {
    const { data: enrollmentRows, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('class_id, year_month, status, classes(name, is_active)')
      .eq('student_id', signInData.user.id)
      .in('status', ['ACTIVE', 'PENDING'])
      .order('year_month', { ascending: false })

    if (enrollmentError) {
      throw enrollmentError
    }

    const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const visibleEnrollments = (enrollmentRows ?? [])
      .filter((row) => {
        const relation = Array.isArray(row.classes) ? row.classes[0] ?? null : row.classes
        return relation?.is_active !== false
      })
      .sort((left, right) => {
        const leftYearMonth = left.year_month
        const rightYearMonth = right.year_month

        if (leftYearMonth === currentYearMonth && rightYearMonth !== currentYearMonth) return -1
        if (rightYearMonth === currentYearMonth && leftYearMonth !== currentYearMonth) return 1

        if (leftYearMonth !== rightYearMonth) {
          return rightYearMonth.localeCompare(leftYearMonth)
        }

        if (left.status !== right.status) {
          return left.status === 'ACTIVE' ? -1 : 1
        }

        const leftClass = Array.isArray(left.classes) ? left.classes[0] ?? null : left.classes
        const rightClass = Array.isArray(right.classes) ? right.classes[0] ?? null : right.classes

        return (leftClass?.name ?? '').localeCompare(rightClass?.name ?? '', 'ko')
      })
    const selectedSummary = visibleEnrollments[0]

    expect(selectedSummary, 'Could not resolve a visible student class summary for browser smoke')

    return {
      classId: selectedSummary.class_id,
      yearMonth: selectedSummary.year_month,
    }
  } finally {
    await supabase.auth.signOut()
  }
}

async function deleteMedia(adminJar, mediaId) {
  const response = await request(
    baseUrl,
    '/api/admin/weekly-media',
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaId }),
    },
    adminJar,
  )

  return await readJson(response, `Failed to delete media: ${mediaId}`)
}

async function loginWithUi(page, account) {
  const roleLabel = account.role === 'OWNER' ? '오너' : account.role === 'ADMIN' ? '운영' : '학생'

  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  await page.locator('summary').filter({ hasText: '로컬 QA 원클릭 로그인' }).first().click()
  await page.getByRole('button', { name: new RegExp(roleLabel) }).first().click()
  await page.waitForURL((url) => url.pathname !== '/' && !url.pathname.startsWith('/auth/login'), {
    timeout: 15000,
    waitUntil: 'commit',
  })
}

function surfaceCardLocator(page, label) {
  return page
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::div[contains(@class,"overflow-hidden") and contains(@class,"border")][1]')
}

async function verifyStudentHome(page, results, target) {
  await page.goto(`${baseUrl}/student?classId=${target.classId}&yearMonth=${target.yearMonth}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForURL((url) => url.pathname === '/student', {
    timeout: 15000,
    waitUntil: 'domcontentloaded',
  })

  const classSelect = page.getByLabel('수업 선택').first()
  const monthSelect = page.getByLabel('월 선택').first()
  const menuButton = page.getByLabel('학생 메뉴').first()
  const homeTabLink = page.locator('[aria-label="학생 홈"]').first()
  const lessonsTabLink = page.locator('[aria-label="학생 수업"]').first()
  const profileTabLink = page.locator('[aria-label="학생 내상태"]').first()
  const progressCard = page.locator('[data-slot="student-home-progress"]').first()
  const progressRail = progressCard.locator('[data-slot="progress"]').first()
  const attendanceCard = surfaceCardLocator(page, '출석')
  const openCard = surfaceCardLocator(page, '공개')
  const feedbackCard = surfaceCardLocator(page, '피드백')

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })
  await menuButton.waitFor({ state: 'visible', timeout: 15000 })
  await homeTabLink.waitFor({ state: 'visible', timeout: 15000 })
  await lessonsTabLink.waitFor({ state: 'visible', timeout: 15000 })
  await profileTabLink.waitFor({ state: 'visible', timeout: 15000 })

  const classSurface = await expectOpaqueSurface(classSelect, '학생 수업 선택')
  const monthSurface = await expectOpaqueSurface(monthSelect, '학생 월 선택')
  const menuButtonSurface = await expectOpaqueSurface(menuButton, '학생 메뉴 button')
  const homeTabSurface = await expectOpaqueSurface(homeTabLink, '학생 하단탭 active state')
  const lessonsTabSurface = await expectOpaqueSurface(lessonsTabLink, '학생 하단탭 inactive state')
  const profileTabSurface = await expectOpaqueSurface(profileTabLink, '학생 하단탭 inactive profile state')
  const progressCardSurface = await expectOpaqueSurface(progressCard, '학생 홈 진척 카드')
  const progressRailSurface = await expectOpaqueSurface(progressRail, '학생 홈 progress rail')
  const attendanceCardSurface = await expectOpaqueSurface(attendanceCard, '학생 홈 출석 카드')
  const openCardSurface = await expectOpaqueSurface(openCard, '학생 홈 공개 카드')
  const feedbackCardSurface = await expectOpaqueSurface(feedbackCard, '학생 홈 피드백 카드')

  await menuButton.click()
  const menuSurface = await expectOpaqueSurface(
    page.locator('[data-slot="dropdown-menu-content"]').first(),
    '학생 메뉴 open state',
  )
  await page.keyboard.press('Escape')

  results.student.home = {
    detailPath: page.url(),
    classSurface,
    monthSurface,
    menuButtonSurface,
    menuSurface,
    bottomTabsVisible: {
      home: await homeTabLink.isVisible(),
      lessons: await lessonsTabLink.isVisible(),
      profile: await profileTabLink.isVisible(),
    },
    homeTabSurface,
    lessonsTabSurface,
    profileTabSurface,
    progressCardSurface,
    progressRailSurface,
    attendanceCardSurface,
    openCardSurface,
    feedbackCardSurface,
  }
}

async function verifyStudentLessons(page, results, target) {
  await page.goto(`${baseUrl}/student/class/${target.classId}?yearMonth=${target.yearMonth}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForURL((url) => url.pathname === '/student/lessons', {
    timeout: 15000,
    waitUntil: 'domcontentloaded',
  })

  const classSelect = page.getByLabel('수업 선택').first()
  const monthSelect = page.getByLabel('월 선택').first()
  const menuButton = page.getByLabel('학생 메뉴').first()
  const homeTabLink = page.locator('[aria-label="학생 홈"]').first()
  const lessonsTabLink = page.locator('[aria-label="학생 수업"]').first()
  const profileTabLink = page.locator('[aria-label="학생 내상태"]').first()
  const weekRail = page.locator('[data-slot="tabs-list"]').first()
  const activeWeekTab = page.locator('[data-slot="tabs-trigger"][data-state="active"]').first()
  const inactiveWeekTab = page.locator('[data-slot="tabs-trigger"][data-state="inactive"]').first()

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })
  await menuButton.waitFor({ state: 'visible', timeout: 15000 })
  await homeTabLink.waitFor({ state: 'visible', timeout: 15000 })
  await lessonsTabLink.waitFor({ state: 'visible', timeout: 15000 })
  await profileTabLink.waitFor({ state: 'visible', timeout: 15000 })
  const weekTab = page.getByRole('tab').filter({ hasText: '1주차' }).first()
  await weekTab.click()

  const classSurface = await expectOpaqueSurface(classSelect, '학생 수업 선택')
  const monthSurface = await expectOpaqueSurface(monthSelect, '학생 월 선택')
  const menuButtonSurface = await expectOpaqueSurface(menuButton, '학생 메뉴 button')
  const homeTabSurface = await expectOpaqueSurface(homeTabLink, '학생 하단탭 inactive home state')
  const lessonsTabSurface = await expectOpaqueSurface(lessonsTabLink, '학생 하단탭 active state')
  const profileTabSurface = await expectOpaqueSurface(profileTabLink, '학생 하단탭 inactive profile state')
  const weekRailSurface = await expectOpaqueSurface(weekRail, '학생 수업 주차 rail')
  const activeWeekTabSurface = await expectOpaqueSurface(activeWeekTab, '학생 수업 주차 active button')
  const inactiveWeekTabSurface = await expectOpaqueSurface(inactiveWeekTab, '학생 수업 주차 inactive button')

  const videoFrame = page.locator('iframe[title="1주차 선택 영상"]').first()
  await videoFrame.waitFor({ state: 'visible', timeout: 15000 })
  const initialFrameSrc = await videoFrame.getAttribute('src')
  expect(typeof initialFrameSrc === 'string' && initialFrameSrc.length > 0, 'Student initial video should expose an iframe src')

  const nextVideoButton = page.getByRole('button', { name: '다음 영상' })
  await nextVideoButton.click()
  await page.waitForFunction(
    ({ selector, previousSrc }) => {
      const frame = document.querySelector(selector)
      return frame instanceof HTMLIFrameElement && frame.src !== previousSrc
    },
    { selector: 'iframe[title="1주차 선택 영상"]', previousSrc: initialFrameSrc },
  )
  const afterNextSrc = await videoFrame.getAttribute('src')
  expect(afterNextSrc && afterNextSrc !== initialFrameSrc, 'Student next-video action should change the iframe src')

  const previousVideoButton = page.getByRole('button', { name: '이전 영상' })
  await previousVideoButton.click()
  await page.waitForFunction(
    ({ selector, expectedSrc }) => {
      const frame = document.querySelector(selector)
      return frame instanceof HTMLIFrameElement && frame.src === expectedSrc
    },
    { selector: 'iframe[title="1주차 선택 영상"]', expectedSrc: initialFrameSrc },
  )
  const afterPreviousSrc = await videoFrame.getAttribute('src')
  const overlayFullscreenButton = page.getByRole('button', { name: /전체화면$/ }).first()
  await overlayFullscreenButton.waitFor({ state: 'visible', timeout: 15000 })
  const overlayFullscreenSurface = await expectOpaqueSurface(overlayFullscreenButton, '학생 비디오 overlay control')

  const image = page.locator('img[alt*="1주차 이미지"]').first()
  await image.waitFor({ state: 'visible', timeout: 15000 })
  const imageHandle = await image.elementHandle()
  expect(imageHandle, 'Student image handle not found')
  await page.waitForFunction((element) => element.complete && element.naturalWidth > 0, imageHandle)

  const noteHeading = page.getByText('이번 주 기록').first()
  const progressNote = page.getByText(browserSmokeNotes.progress).first()
  const sharedNote = page.getByText(browserSmokeNotes.shared).first()
  const privateNote = page.getByText(browserSmokeNotes.private).first()
  const replyComposer = page.getByText('이번 주 답글', { exact: true }).first().locator('xpath=ancestor::*[contains(@class,"rounded-[1.45rem]")][1]')

  await noteHeading.waitFor({ state: 'visible', timeout: 15000 })
  await progressNote.waitFor({ state: 'visible', timeout: 15000 })
  await sharedNote.waitFor({ state: 'visible', timeout: 15000 })
  await privateNote.waitFor({ state: 'visible', timeout: 15000 })
  await replyComposer.waitFor({ state: 'visible', timeout: 15000 })
  const adminNoteVisible = await page.getByText(browserSmokeNotes.admin).first().isVisible().catch(() => false)
  const replyComposerSurface = await expectOpaqueSurface(replyComposer, '학생 reply composer')

  await image.click()
  const imageDialog = page.getByRole('dialog', { name: '이미지 크게 보기' })
  await imageDialog.waitFor({ state: 'visible', timeout: 15000 })
  const dialogImage = imageDialog.locator('img[alt*="1주차 이미지"]').first()
  await dialogImage.waitFor({ state: 'visible', timeout: 15000 })
  const imageFrameSurface = await expectOpaqueSurface(
    imageDialog.locator('div.overflow-auto').first(),
    '학생 이미지 확대 프레임',
  )

  results.student.lessons = {
    detailPath: page.url(),
    headerControlsVisible: {
      classSelect: await classSelect.isVisible(),
      monthSelect: await monthSelect.isVisible(),
      menuButton: await menuButton.isVisible(),
    },
    headerSurfaces: {
      classSurface,
      monthSurface,
      menuButtonSurface,
    },
    bottomTabsVisible: {
      home: await homeTabLink.isVisible(),
      lessons: await lessonsTabLink.isVisible(),
      profile: await profileTabLink.isVisible(),
    },
    bottomTabSurfaces: {
      homeTabSurface,
      lessonsTabSurface,
      profileTabSurface,
    },
    weekRailSurface,
    activeWeekTabSurface,
    inactiveWeekTabSurface,
    frameVisible: await videoFrame.isVisible(),
    initialFrameSrc,
    afterNextSrc,
    afterPreviousSrc,
    overlayFullscreenSurface,
    imageVisible: await image.isVisible(),
    imageLoaded: await image.evaluate((element) => element.complete && element.naturalWidth > 0),
    imageDialogVisible: await imageDialog.isVisible(),
    imageFrameSurface,
    noteHeadingVisible: await noteHeading.isVisible(),
    progressNoteVisible: await progressNote.isVisible(),
    sharedNoteVisible: await sharedNote.isVisible(),
    privateNoteVisible: await privateNote.isVisible(),
    replyComposerSurface,
    adminNoteVisible,
  }

  await page.keyboard.press('Escape')
  await imageDialog.waitFor({ state: 'hidden', timeout: 15000 })

  await page.reload({ waitUntil: 'domcontentloaded' })
  const weekTabAfterReload = page.getByRole('tab').filter({ hasText: '1주차' }).first()
  await weekTabAfterReload.click()

  const reloadedFrame = page.locator('iframe[title="1주차 선택 영상"]').first()
  const reloadedImage = page.locator('img[alt*="1주차 이미지"]').first()
  await reloadedFrame.waitFor({ state: 'visible', timeout: 15000 })
  await reloadedImage.waitFor({ state: 'visible', timeout: 15000 })

  const deniedAdminFetch = await page.evaluate(async ({ classId, yearMonth }) => {
    const response = await fetch(`/api/admin/weekly-media?classId=${classId}&yearMonth=${yearMonth}`)
    const body = await response.json().catch(() => null)
    return {
      status: response.status,
      body,
    }
  }, { classId: target.classId, yearMonth: target.yearMonth })

  results.student.lessons.afterReload = {
    detailPath: page.url(),
    frameVisible: await reloadedFrame.isVisible(),
    frameSrc: await reloadedFrame.getAttribute('src'),
    imageVisible: await reloadedImage.isVisible(),
    deniedAdminFetch,
  }

  expect(results.student.lessons.frameVisible, 'Student video iframe should be visible')
  expect(results.student.lessons.headerControlsVisible.classSelect, 'Student class selector should be visible')
  expect(results.student.lessons.headerControlsVisible.monthSelect, 'Student month selector should be visible')
  expect(results.student.lessons.bottomTabsVisible.home, 'Student home tab should be visible')
  expect(results.student.lessons.bottomTabsVisible.lessons, 'Student lessons tab should be visible')
  expect(results.student.lessons.bottomTabsVisible.profile, 'Student profile tab should be visible')
  expect(results.student.home.bottomTabsVisible.home, 'Student home bottom tab should be visible')
  expect(results.student.home.progressRailSurface.width >= 0, 'Student home progress rail should be readable')
  expect(results.student.lessons.bottomTabSurfaces.homeTabSurface.width >= 0, 'Student home tab surface should be readable')
  expect(results.student.lessons.weekRailSurface.width >= 0, 'Student week rail should be readable')
  expect(results.student.lessons.imageVisible, 'Student image should be visible')
  expect(results.student.lessons.imageLoaded, 'Student image should load successfully')
  expect(results.student.lessons.imageDialogVisible, 'Student image zoom dialog should be visible after click')
  expect(results.student.lessons.noteHeadingVisible, 'Student note heading should be visible')
  expect(results.student.lessons.progressNoteVisible, 'Student progress note should be visible')
  expect(results.student.lessons.sharedNoteVisible, 'Student shared feedback should be visible')
  expect(results.student.lessons.privateNoteVisible, 'Student private feedback should be visible')
  expect(!results.student.lessons.adminNoteVisible, 'Student DOM should not expose admin-only note text')
  expect(results.student.lessons.afterReload.frameVisible, 'Student iframe should remain visible after reload')
  expect(results.student.lessons.afterReload.frameSrc === initialFrameSrc, 'Student iframe should return to the first video after reload')
  expect(results.student.lessons.afterReload.imageVisible, 'Student image should remain visible after reload')
  expect(deniedAdminFetch.status === 403, 'Student admin weekly-media fetch should return 403')
}

async function verifyStudentProfile(page, results, target) {
  await page.goto(`${baseUrl}/student/profile?classId=${target.classId}&yearMonth=${target.yearMonth}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForURL((url) => url.pathname === '/student/profile', {
    timeout: 15000,
    waitUntil: 'domcontentloaded',
  })

  const classSelect = page.getByLabel('수업 선택').first()
  const monthSelect = page.getByLabel('월 선택').first()
  const menuButton = page.getByLabel('학생 메뉴').first()
  const homeTabLink = page.locator('[aria-label="학생 홈"]').first()
  const lessonsTabLink = page.locator('[aria-label="학생 수업"]').first()
  const profileTabLink = page.locator('[aria-label="학생 내상태"]').first()
  const heroSurface = page.getByText('내상태 카드', { exact: true }).first().locator('xpath=ancestor::section[1]')
  const summarySurface = page.getByText('수강 중', { exact: true }).first().locator('xpath=ancestor::*[contains(@class,"rounded-[1.6rem]")][1]')
  const accountSurface = page.getByText('계정 정보', { exact: true }).first().locator('xpath=ancestor::*[@data-slot="card"][1]')

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })
  await menuButton.waitFor({ state: 'visible', timeout: 15000 })
  await heroSurface.waitFor({ state: 'visible', timeout: 15000 })
  await summarySurface.waitFor({ state: 'visible', timeout: 15000 })
  await accountSurface.waitFor({ state: 'visible', timeout: 15000 })

  const classSurface = await expectOpaqueSurface(classSelect, '학생 프로필 수업 선택')
  const monthSurface = await expectOpaqueSurface(monthSelect, '학생 프로필 월 선택')
  const menuButtonSurface = await expectOpaqueSurface(menuButton, '학생 프로필 메뉴 button')
  const homeTabSurface = await expectOpaqueSurface(homeTabLink, '학생 프로필 하단탭 inactive home state')
  const lessonsTabSurface = await expectOpaqueSurface(lessonsTabLink, '학생 프로필 하단탭 inactive lessons state')
  const profileTabSurface = await expectOpaqueSurface(profileTabLink, '학생 프로필 하단탭 active state')
  const heroCardSurface = await expectOpaqueSurface(heroSurface, '학생 프로필 hero surface')
  const summaryCardSurface = await expectOpaqueSurface(summarySurface, '학생 프로필 요약 카드')
  const accountCardSurface = await expectOpaqueSurface(accountSurface, '학생 프로필 계정 카드')

  results.student.profile = {
    detailPath: page.url(),
    headerSurfaces: {
      classSurface,
      monthSurface,
      menuButtonSurface,
    },
    bottomTabSurfaces: {
      homeTabSurface,
      lessonsTabSurface,
      profileTabSurface,
    },
    heroCardSurface,
    summaryCardSurface,
    accountCardSurface,
  }

  expect(heroCardSurface.width >= 0, 'Student profile hero surface should be readable')
  expect(summaryCardSurface.width >= 0, 'Student profile summary card should be readable')
  expect(accountCardSurface.width >= 0, 'Student profile account card should be readable')
}

async function main() {
  const attachedLibDirs = configureLocalBrowserLibs()
  const results = {
    baseUrl,
    browser: {
      engine: 'chromium',
      viewport: {
        width: 390,
        height: 844,
      },
      attachedLibDirs,
    },
    student: {},
  }

  const { jar: adminJar } = await loginAs(baseUrl, adminAccount)
  const { jar: studentJar } = await loginAs(baseUrl, studentAccount)
  const studentSessionResponse = await request(baseUrl, '/api/dev/runtime-session', {}, studentJar)
  const studentSessionPayload = await readJson(studentSessionResponse, 'Failed to read browser smoke student session')
  const studentId = studentSessionPayload?.data?.userId
  expect(typeof studentId === 'string' && studentId.length > 0, 'Browser smoke student session is missing userId')
  const target = await resolveStudentVisibleTarget()

  const created = await createBrowserSmokeMedia(adminJar, target)
  results.target = target
  results.adminNotes = await upsertBrowserSmokeNotes(adminJar, studentId, target)
  results.admin = {
    seededVideoIds: created.videoIds,
    seededVideoYoutubeIds: created.videoYoutubeIds,
    seededImageId: created.imageId,
  }

  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({
      viewport: results.browser.viewport,
    })
    const page = await context.newPage()

    await loginWithUi(page, studentAccount)
    results.studentLogin = {
      finalUrl: page.url(),
      method: 'local-qa-quick-login',
    }
    await verifyStudentHome(page, results, target)
    await verifyStudentLessons(page, results, target)
    await verifyStudentProfile(page, results, target)

    await context.close()
  } finally {
    await browser.close()
    await deleteMedia(adminJar, created.imageId)
    for (const mediaId of created.videoIds) {
      await deleteMedia(adminJar, mediaId)
    }
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
