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

async function verifyStudentDom(page, results, target) {
  await page.goto(`${baseUrl}/student/class/${target.classId}?yearMonth=${target.yearMonth}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForURL((url) => url.pathname === '/student/lessons', {
    timeout: 15000,
    waitUntil: 'domcontentloaded',
  })

  const classSelect = page.locator('[aria-label="수업 선택"]').first()
  const monthSelect = page.locator('[aria-label="월 선택"]').first()
  const homeTabLink = page.locator('[aria-label="학생 홈"]').first()
  const lessonsTabLink = page.locator('[aria-label="학생 수업"]').first()
  const profileTabLink = page.locator('[aria-label="학생 내상태"]').first()

  await classSelect.waitFor({ state: 'visible', timeout: 15000 })
  await monthSelect.waitFor({ state: 'visible', timeout: 15000 })
  await homeTabLink.waitFor({ state: 'visible', timeout: 15000 })
  await lessonsTabLink.waitFor({ state: 'visible', timeout: 15000 })
  await profileTabLink.waitFor({ state: 'visible', timeout: 15000 })

  const weekTab = page.getByRole('tab').filter({ hasText: '1주차' }).first()
  await weekTab.click()

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

  const image = page.locator('img[alt*="1주차 이미지"]').first()
  await image.waitFor({ state: 'visible', timeout: 15000 })
  const imageHandle = await image.elementHandle()
  expect(imageHandle, 'Student image handle not found')
  await page.waitForFunction((element) => element.complete && element.naturalWidth > 0, imageHandle)

  const noteHeading = page.getByText('이번 주 기록').first()
  const progressNote = page.getByText(browserSmokeNotes.progress).first()
  const sharedNote = page.getByText(browserSmokeNotes.shared).first()
  const privateNote = page.getByText(browserSmokeNotes.private).first()

  await noteHeading.waitFor({ state: 'visible', timeout: 15000 })
  await progressNote.waitFor({ state: 'visible', timeout: 15000 })
  await sharedNote.waitFor({ state: 'visible', timeout: 15000 })
  await privateNote.waitFor({ state: 'visible', timeout: 15000 })
  const adminNoteVisible = await page.getByText(browserSmokeNotes.admin).first().isVisible().catch(() => false)

  await image.click()
  const imageDialog = page.getByRole('dialog', { name: '이미지 크게 보기' })
  await imageDialog.waitFor({ state: 'visible', timeout: 15000 })
  const dialogImage = imageDialog.locator('img[alt*="1주차 이미지"]').first()
  await dialogImage.waitFor({ state: 'visible', timeout: 15000 })

  results.student = {
    detailPath: page.url(),
    headerControlsVisible: {
      classSelect: await classSelect.isVisible(),
      monthSelect: await monthSelect.isVisible(),
    },
    bottomTabsVisible: {
      home: await homeTabLink.isVisible(),
      lessons: await lessonsTabLink.isVisible(),
      profile: await profileTabLink.isVisible(),
    },
    frameVisible: await videoFrame.isVisible(),
    initialFrameSrc,
    afterNextSrc,
    afterPreviousSrc,
    imageVisible: await image.isVisible(),
    imageLoaded: await image.evaluate((element) => element.complete && element.naturalWidth > 0),
    imageDialogVisible: await imageDialog.isVisible(),
    noteHeadingVisible: await noteHeading.isVisible(),
    progressNoteVisible: await progressNote.isVisible(),
    sharedNoteVisible: await sharedNote.isVisible(),
    privateNoteVisible: await privateNote.isVisible(),
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

  results.student.afterReload = {
    detailPath: page.url(),
    frameVisible: await reloadedFrame.isVisible(),
    frameSrc: await reloadedFrame.getAttribute('src'),
    imageVisible: await reloadedImage.isVisible(),
    deniedAdminFetch,
  }

  expect(results.student.frameVisible, 'Student video iframe should be visible')
  expect(results.student.headerControlsVisible.classSelect, 'Student class selector should be visible')
  expect(results.student.headerControlsVisible.monthSelect, 'Student month selector should be visible')
  expect(results.student.bottomTabsVisible.home, 'Student home tab should be visible')
  expect(results.student.bottomTabsVisible.lessons, 'Student lessons tab should be visible')
  expect(results.student.bottomTabsVisible.profile, 'Student profile tab should be visible')
  expect(results.student.imageVisible, 'Student image should be visible')
  expect(results.student.imageLoaded, 'Student image should load successfully')
  expect(results.student.imageDialogVisible, 'Student image zoom dialog should be visible after click')
  expect(results.student.noteHeadingVisible, 'Student note heading should be visible')
  expect(results.student.progressNoteVisible, 'Student progress note should be visible')
  expect(results.student.sharedNoteVisible, 'Student shared feedback should be visible')
  expect(results.student.privateNoteVisible, 'Student private feedback should be visible')
  expect(!results.student.adminNoteVisible, 'Student DOM should not expose admin-only note text')
  expect(results.student.afterReload.frameVisible, 'Student iframe should remain visible after reload')
  expect(results.student.afterReload.frameSrc === initialFrameSrc, 'Student iframe should return to the first video after reload')
  expect(results.student.afterReload.imageVisible, 'Student image should remain visible after reload')
  expect(deniedAdminFetch.status === 403, 'Student admin weekly-media fetch should return 403')
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
    await verifyStudentDom(page, results, target)

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
