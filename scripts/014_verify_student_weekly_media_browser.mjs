import fs from 'node:fs'
import path from 'node:path'

import { chromium } from 'playwright'

import {
  LOCAL_RUNTIME_ACCOUNTS,
  RUNTIME_QA_CLASS_ID,
  RUNTIME_QA_YEAR_MONTH,
  getRuntimePassword,
  readJson,
} from './lib/runtime-auth.mjs'
import { loginAs, request, resolveBaseUrl } from './lib/runtime-http.mjs'

const baseUrl = resolveBaseUrl()
const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')
const studentAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'STUDENT')

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

async function createBrowserSmokeMedia(adminJar) {
  const videoResponse = await request(
    baseUrl,
    '/api/admin/weekly-media',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId: RUNTIME_QA_CLASS_ID,
        yearMonth: RUNTIME_QA_YEAR_MONTH,
        weekNumber: 1,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    },
    adminJar,
  )
  const videoPayload = await readJson(videoResponse, 'Failed to create browser smoke video')

  const imageForm = new FormData()
  imageForm.set('classId', RUNTIME_QA_CLASS_ID)
  imageForm.set('yearMonth', RUNTIME_QA_YEAR_MONTH)
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
    videoId: videoPayload.data.id,
    imageId: imagePayload.data.id,
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
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('이메일').fill(account.email)
  await page.getByLabel('비밀번호').fill(getRuntimePassword())
  await page.getByRole('button', { name: '이메일로 로그인' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), { timeout: 15000 })
}

async function verifyStudentDom(page, results) {
  await page.goto(`${baseUrl}/student/class/${RUNTIME_QA_CLASS_ID}?yearMonth=${RUNTIME_QA_YEAR_MONTH}`, {
    waitUntil: 'domcontentloaded',
  })

  const weekTab = page.getByRole('tab').filter({ hasText: '1주차' }).first()
  await weekTab.click()

  const videoFrame = page.locator('iframe[title*="1주차 영상"]').first()
  await videoFrame.waitFor({ state: 'visible', timeout: 15000 })

  const image = page.locator('img[alt="1주차 이미지"]').first()
  await image.waitFor({ state: 'visible', timeout: 15000 })
  const imageHandle = await image.elementHandle()
  expect(imageHandle, 'Student image handle not found')
  await page.waitForFunction((element) => element.complete && element.naturalWidth > 0, imageHandle)

  results.student = {
    detailPath: `/student/class/${RUNTIME_QA_CLASS_ID}?yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    frameVisible: await videoFrame.isVisible(),
    imageVisible: await image.isVisible(),
    imageLoaded: await image.evaluate((element) => element.complete && element.naturalWidth > 0),
  }

  await page.reload({ waitUntil: 'domcontentloaded' })
  const weekTabAfterReload = page.getByRole('tab').filter({ hasText: '1주차' }).first()
  await weekTabAfterReload.click()

  const reloadedFrame = page.locator('iframe[title*="1주차 영상"]').first()
  const reloadedImage = page.locator('img[alt="1주차 이미지"]').first()
  await reloadedFrame.waitFor({ state: 'visible', timeout: 15000 })
  await reloadedImage.waitFor({ state: 'visible', timeout: 15000 })

  const deniedAdminFetch = await page.evaluate(async ({ classId, yearMonth }) => {
    const response = await fetch(`/api/admin/weekly-media?classId=${classId}&yearMonth=${yearMonth}`)
    const body = await response.json().catch(() => null)
    return {
      status: response.status,
      body,
    }
  }, { classId: RUNTIME_QA_CLASS_ID, yearMonth: RUNTIME_QA_YEAR_MONTH })

  results.student.afterReload = {
    frameVisible: await reloadedFrame.isVisible(),
    imageVisible: await reloadedImage.isVisible(),
    deniedAdminFetch,
  }

  expect(results.student.frameVisible, 'Student video iframe should be visible')
  expect(results.student.imageVisible, 'Student image should be visible')
  expect(results.student.imageLoaded, 'Student image should load successfully')
  expect(results.student.afterReload.frameVisible, 'Student iframe should remain visible after reload')
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
  const created = await createBrowserSmokeMedia(adminJar)
  results.admin = {
    seededVideoId: created.videoId,
    seededImageId: created.imageId,
  }

  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({
      viewport: results.browser.viewport,
    })
    const page = await context.newPage()

    await loginWithUi(page, studentAccount)
    await verifyStudentDom(page, results)

    await context.close()
  } finally {
    await browser.close()
    await deleteMedia(adminJar, created.imageId)
    await deleteMedia(adminJar, created.videoId)
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
