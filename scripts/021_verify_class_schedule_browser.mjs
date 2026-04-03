import fs from 'node:fs'
import path from 'node:path'

import { chromium } from 'playwright'

import {
  LOCAL_RUNTIME_ACCOUNTS,
  readJson,
} from './lib/runtime-auth.mjs'
import { loginAs, readJsonOrNull, request, resolveBaseUrl } from './lib/runtime-http.mjs'

const baseUrl = resolveBaseUrl()
const ownerAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'OWNER')
const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')
const mobileViewport = { width: 390, height: 844 }

if (!ownerAccount || !adminAccount) {
  throw new Error('Missing runtime QA accounts')
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

function getCurrentYearMonth() {
  const currentDate = new Date()
  return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
}

async function sleep(durationMs) {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
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

async function selectOption(page, trigger, optionName) {
  await trigger.click()
  const option = page.getByRole('option', { name: optionName }).first()
  await option.waitFor({ state: 'visible', timeout: 15000 })
  await option.click()
}

async function readTriggerText(trigger) {
  return ((await trigger.textContent()) ?? '').replace(/\s+/g, ' ').trim()
}

async function expectTriggerText(trigger, expected) {
  const actual = await readTriggerText(trigger)
  expect(actual.includes(expected), `Expected "${expected}" but received "${actual}"`)
}

async function expectMinuteOptions(page, trigger) {
  await trigger.click()
  const options = page.getByRole('option')
  const optionTexts = (await options.allTextContents()).map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean)
  expect(optionTexts.length === 2, `Minute options should have exactly 2 values: ${JSON.stringify(optionTexts)}`)
  expect(optionTexts[0] === '00분', `First minute option should be 00분: ${JSON.stringify(optionTexts)}`)
  expect(optionTexts[1] === '30분', `Second minute option should be 30분: ${JSON.stringify(optionTexts)}`)
  await page.keyboard.press('Escape')
}

async function openAdminMenu(page) {
  const menuButton = page.getByLabel('관리자 메뉴 열기').first()
  await menuButton.waitFor({ state: 'visible', timeout: 15000 })
  await menuButton.click()
}

async function waitForCreatedClass(ownerJar, className) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await request(baseUrl, '/api/admin/classes?includeInactive=1', {}, ownerJar)
    const payload = await readJson(response, 'Failed to read created class list')
    const createdClass = payload?.data?.find((item) => item?.name === className)

    if (createdClass?.id) {
      return createdClass
    }

    await sleep(400)
  }

  throw new Error(`Could not resolve created class: ${className}`)
}

async function cleanupCreatedClass(ownerJar, classId) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await request(
      baseUrl,
      '/api/admin/classes',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId }),
      },
      ownerJar,
    )

    if (response.status === 404) {
      return
    }

    await readJson(response, 'Failed to delete runtime class')
  }
}

async function verifyOwnerCreateFlow(page, className, results) {
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' })
  await openAdminMenu(page)
  await page.getByRole('menuitem', { name: '새 수업 만들기' }).click()

  const dialog = page.getByRole('dialog', { name: '새 수업 만들기' })
  await dialog.waitFor({ state: 'visible', timeout: 15000 })
  await dialog.locator('#className').fill(className)

  const startHour = dialog.locator('[id^="new-rule-start-"][id$="-hour"]').first()
  const startMinute = dialog.locator('[id^="new-rule-start-"][id$="-minute"]').first()
  const endHour = dialog.locator('[id^="new-rule-end-"][id$="-hour"]').first()
  const endMinute = dialog.locator('[id^="new-rule-end-"][id$="-minute"]').first()

  await expectMinuteOptions(page, startMinute)
  await expectMinuteOptions(page, endMinute)

  await selectOption(page, startHour, '18시')
  await selectOption(page, startMinute, '30분')
  await expectTriggerText(endHour, '20시')
  await expectTriggerText(endMinute, '30분')

  await selectOption(page, endHour, '21시')
  await selectOption(page, endMinute, '00분')
  await selectOption(page, startHour, '17시')
  await expectTriggerText(endHour, '21시')
  await expectTriggerText(endMinute, '00분')

  await selectOption(page, endHour, '미정')
  await selectOption(page, startHour, '16시')
  await expectTriggerText(endHour, '18시')
  await expectTriggerText(endMinute, '30분')

  results.owner.createDialog = {
    minuteOptions: ['00분', '30분'],
    autoFilledEnd: '20:30',
    preservedManualEnd: '21:00',
    restoredAutoEnd: '18:30',
  }

  await dialog.getByRole('button', { name: '생성' }).click()
  await dialog.waitFor({ state: 'hidden', timeout: 15000 })
  await page.getByText(`${className} 수업을 만들고 바로 선택했습니다.`).waitFor({ state: 'visible', timeout: 15000 })
}

async function verifyOwnerScheduleFlow(page, classId, yearMonth, results) {
  await openAdminMenu(page)
  await page.getByRole('menuitem', { name: '일정 관리' }).click()

  const dialog = page.getByRole('dialog', { name: '일정 관리' })
  await dialog.waitFor({ state: 'visible', timeout: 15000 })

  const sessionStartHour = dialog.locator('[id^="session-start-"][id$="-hour"]').first()
  const sessionStartMinute = dialog.locator('[id^="session-start-"][id$="-minute"]').first()
  const sessionEndHour = dialog.locator('[id^="session-end-"][id$="-hour"]').first()
  const sessionEndMinute = dialog.locator('[id^="session-end-"][id$="-minute"]').first()

  await sessionStartHour.waitFor({ state: 'visible', timeout: 15000 })
  await expectMinuteOptions(page, sessionStartMinute)
  await expectMinuteOptions(page, sessionEndMinute)

  await selectOption(page, sessionStartHour, '19시')
  await selectOption(page, sessionStartMinute, '00분')
  await expectTriggerText(sessionEndHour, '21시')
  await expectTriggerText(sessionEndMinute, '00분')

  await selectOption(page, sessionEndHour, '22시')
  await selectOption(page, sessionEndMinute, '30분')
  await selectOption(page, sessionStartHour, '18시')
  await expectTriggerText(sessionEndHour, '22시')
  await expectTriggerText(sessionEndMinute, '30분')

  await selectOption(page, sessionEndHour, '미정')
  await selectOption(page, sessionStartHour, '17시')
  await expectTriggerText(sessionEndHour, '19시')
  await expectTriggerText(sessionEndMinute, '00분')

  await dialog.getByRole('button', { name: '저장' }).click()
  await dialog.getByText('이번 달 실제 수업 날짜를 저장했습니다.').waitFor({ state: 'visible', timeout: 15000 })
  await dialog.getByRole('button', { name: '닫기' }).click()
  await dialog.waitFor({ state: 'hidden', timeout: 15000 })

  results.owner.scheduleDialog = {
    autoFilledEnd: '21:00',
    preservedManualEnd: '22:30',
    restoredAutoEnd: '19:00',
    yearMonth,
  }
}

async function verifyApiContracts(ownerJar, adminJar, className, classId, yearMonth, results) {
  const anonymousCreateResponse = await request(
    baseUrl,
    '/api/admin/classes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${className}-anonymous`,
        scheduleRules: [{ weekday: 1, startTime: '16:00', endTime: '18:00' }],
      }),
    },
  )
  results.anonymous.createDenied = {
    status: anonymousCreateResponse.status,
    body: await readJsonOrNull(anonymousCreateResponse),
  }
  expect(anonymousCreateResponse.status === 401, 'Anonymous class create should return 401')

  const adminCreateResponse = await request(
    baseUrl,
    '/api/admin/classes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${className}-admin`,
        scheduleRules: [{ weekday: 1, startTime: '16:00', endTime: '18:00' }],
      }),
    },
    adminJar,
  )
  results.admin.createDenied = {
    status: adminCreateResponse.status,
    body: await readJsonOrNull(adminCreateResponse),
  }
  expect(adminCreateResponse.status === 403, 'Admin class create should return 403')

  const ownerReadResponse = await request(
    baseUrl,
    `/api/admin/class-schedule?classId=${classId}&yearMonth=${yearMonth}`,
    {},
    ownerJar,
  )
  const ownerReadPayload = await readJson(ownerReadResponse, 'Owner failed to read class schedule')
  const ownerSessions = ownerReadPayload?.data?.sessions ?? []
  const ownerRules = ownerReadPayload?.data?.rules ?? []
  expect(ownerReadPayload?.data?.canEditRules === true, 'Owner should be able to edit schedule rules')
  expect(ownerRules.length >= 1, 'Owner schedule read should include at least one rule')
  expect(ownerSessions.length >= 1, 'Owner schedule read should include at least one session')
  expect(ownerSessions[0]?.startTime === '17:00', `Owner schedule first session start mismatch: ${ownerSessions[0]?.startTime}`)
  expect(ownerSessions[0]?.endTime === '19:00', `Owner schedule first session end mismatch: ${ownerSessions[0]?.endTime}`)

  const adminReadResponse = await request(
    baseUrl,
    `/api/admin/class-schedule?classId=${classId}&yearMonth=${yearMonth}`,
    {},
    adminJar,
  )
  const adminReadPayload = await readJson(adminReadResponse, 'Admin failed to read class schedule')
  expect(adminReadPayload?.data?.canEditRules === false, 'Admin should not be able to edit schedule rules')

  const adminRulePatchResponse = await request(
    baseUrl,
    '/api/admin/class-schedule',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        yearMonth,
        scheduleRules: [
          {
            weekday: 2,
            startTime: '15:00',
            endTime: '17:00',
          },
        ],
        sessions: ownerSessions.map((session) => ({
          sessionDate: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime,
          source: session.source,
        })),
      }),
    },
    adminJar,
  )
  results.admin.rulePatchDenied = {
    status: adminRulePatchResponse.status,
    body: await readJsonOrNull(adminRulePatchResponse),
  }
  expect(adminRulePatchResponse.status === 403, 'Admin schedule rule patch should return 403')

  const nextAdminSessions = ownerSessions.map((session, index) =>
    index === 0
      ? {
          sessionDate: session.sessionDate,
          startTime: '17:30',
          endTime: '19:30',
          source: session.source,
        }
      : {
          sessionDate: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime,
          source: session.source,
        },
  )

  const adminSessionPatchResponse = await request(
    baseUrl,
    '/api/admin/class-schedule',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        yearMonth,
        sessions: nextAdminSessions,
      }),
    },
    adminJar,
  )
  const adminSessionPayload = await readJson(adminSessionPatchResponse, 'Admin failed to update class sessions')
  expect(adminSessionPayload?.data?.sessions?.[0]?.startTime === '17:30', 'Admin session patch should update first session start time')
  expect(adminSessionPayload?.data?.sessions?.[0]?.endTime === '19:30', 'Admin session patch should update first session end time')

  results.owner.scheduleRead = {
    canEditRules: ownerReadPayload.data.canEditRules,
    ruleCount: ownerRules.length,
    sessionCount: ownerSessions.length,
    firstSession: ownerSessions[0],
  }
  results.admin.scheduleRead = {
    canEditRules: adminReadPayload.data.canEditRules,
  }
  results.admin.sessionPatch = {
    firstSession: adminSessionPayload.data.sessions[0],
  }
}

async function main() {
  const results = {
    baseUrl,
    yearMonth: getCurrentYearMonth(),
    anonymous: {},
    owner: {},
    admin: {},
  }

  const browserLibs = configureLocalBrowserLibs()
  if (browserLibs) {
    results.browserLibs = browserLibs
  }

  const { jar: ownerJar } = await loginAs(baseUrl, ownerAccount)
  const { jar: adminJar } = await loginAs(baseUrl, adminAccount)
  const className = `runtime-일정-${Date.now()}`
  let createdClassId = null

  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage({ viewport: mobileViewport })
    await loginWithUi(page, ownerAccount)
    await verifyOwnerCreateFlow(page, className, results)

    const createdClass = await waitForCreatedClass(ownerJar, className)
    createdClassId = createdClass.id
    results.owner.createdClass = createdClass

    await verifyOwnerScheduleFlow(page, createdClassId, results.yearMonth, results)
    await verifyApiContracts(ownerJar, adminJar, className, createdClassId, results.yearMonth, results)
  } finally {
    await browser.close()

    if (createdClassId) {
      await cleanupCreatedClass(ownerJar, createdClassId)
      results.owner.cleanup = {
        classId: createdClassId,
        deleted: true,
      }
    }
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
