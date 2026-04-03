import {
  LOCAL_RUNTIME_ACCOUNTS,
  RUNTIME_QA_CLASS_ID,
  RUNTIME_QA_YEAR_MONTH,
  readJson,
} from './lib/runtime-auth.mjs'
import { loginAs, request, resolveBaseUrl } from './lib/runtime-http.mjs'

const baseUrl = resolveBaseUrl()
const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')
const studentAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'STUDENT')

if (!adminAccount || !studentAccount) {
  throw new Error('Missing runtime QA accounts')
}

function createFile(name, content, type = 'text/plain') {
  return new File([content], name, { type })
}

async function main() {
  const results = {
    baseUrl,
    admin: {},
    student: {},
  }

  const { jar: adminJar, payload: adminLogin } = await loginAs(baseUrl, adminAccount)
  results.admin.login = adminLogin

  const sessionResponse = await request(baseUrl, '/api/dev/runtime-session', {}, adminJar)
  results.admin.session = await readJson(sessionResponse, 'Failed to read admin runtime session')

  const stateResponse = await request(
    baseUrl,
    `/api/admin/weekly-media?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    adminJar,
  )
  const statePayload = await readJson(stateResponse, 'Failed to read weekly media state')
  results.admin.read = {
    weekCount: statePayload.data?.weeks?.length ?? 0,
  }

  const notesStateResponse = await request(
    baseUrl,
    `/api/admin/weekly-notes?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    adminJar,
  )
  const notesStatePayload = await readJson(notesStateResponse, 'Failed to read weekly notes state')
  results.admin.notesRead = {
    weekCount: notesStatePayload.data?.weeks?.length ?? 0,
    studentCount: notesStatePayload.data?.students?.length ?? 0,
  }

  const createVideoResponse = await request(
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
  const createdVideo = await readJson(createVideoResponse, 'Failed to create weekly video')
  results.admin.videoCreate = createdVideo

  const updateVideoResponse = await request(
    baseUrl,
    '/api/admin/weekly-media',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: createdVideo.data.id,
        url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      }),
    },
    adminJar,
  )
  results.admin.videoUpdate = await readJson(updateVideoResponse, 'Failed to update weekly video')

  const imageForm = new FormData()
  imageForm.set('classId', RUNTIME_QA_CLASS_ID)
  imageForm.set('yearMonth', RUNTIME_QA_YEAR_MONTH)
  imageForm.set('weekNumber', '1')
  imageForm.set('file', createFile('runtime-image-1.txt', 'runtime-image-1', 'image/png'))

  const createImageResponse = await request(
    baseUrl,
    '/api/admin/weekly-media/image',
    {
      method: 'POST',
      body: imageForm,
    },
    adminJar,
  )
  const createdImage = await readJson(createImageResponse, 'Failed to upload weekly image')
  results.admin.imageCreate = createdImage

  const replaceImageForm = new FormData()
  replaceImageForm.set('classId', RUNTIME_QA_CLASS_ID)
  replaceImageForm.set('yearMonth', RUNTIME_QA_YEAR_MONTH)
  replaceImageForm.set('weekNumber', '1')
  replaceImageForm.set('mediaId', createdImage.data.id)
  replaceImageForm.set('file', createFile('runtime-image-2.txt', 'runtime-image-2', 'image/png'))

  const replaceImageResponse = await request(
    baseUrl,
    '/api/admin/weekly-media/image',
    {
      method: 'POST',
      body: replaceImageForm,
    },
    adminJar,
  )
  results.admin.imageReplace = await readJson(replaceImageResponse, 'Failed to replace weekly image')

  const { jar: studentJar, payload: studentLogin } = await loginAs(baseUrl, studentAccount)
  results.student.login = studentLogin

  const studentSessionResponse = await request(baseUrl, '/api/dev/runtime-session', {}, studentJar)
  results.student.session = await readJson(studentSessionResponse, 'Failed to read student runtime session')
  const studentId = results.student.session?.data?.userId

  const studentPageResponse = await request(
    baseUrl,
    `/student/class/${RUNTIME_QA_CLASS_ID}?yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    studentJar,
  )
  const studentPageHtml = await studentPageResponse.text()
  results.student.detailPage = {
    status: studentPageResponse.status,
    containsRouteParams: studentPageHtml.includes(RUNTIME_QA_CLASS_ID) && studentPageHtml.includes(RUNTIME_QA_YEAR_MONTH),
    containsAccessGate: studentPageHtml.includes('학생 로그인이 필요합니다') || studentPageHtml.includes('관리자 로그인이 필요합니다'),
  }

  const deniedAdminRouteResponse = await request(
    baseUrl,
    `/api/admin/weekly-media?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    studentJar,
  )
  results.student.adminRouteDenied = {
    status: deniedAdminRouteResponse.status,
    body: await deniedAdminRouteResponse.json().catch(() => null),
  }

  if (typeof studentId === 'string' && studentId.length > 0) {
    const notesPatchResponse = await request(
      baseUrl,
      '/api/admin/weekly-notes',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: RUNTIME_QA_CLASS_ID,
          yearMonth: RUNTIME_QA_YEAR_MONTH,
          weekNumber: 1,
          progressText: 'runtime-progress-note',
          sharedFeedbackText: 'runtime-shared-feedback',
          adminNoteText: 'runtime-admin-note',
          memberFeedbackByStudentId: {
            [studentId]: 'runtime-private-feedback',
          },
        }),
      },
      adminJar,
    )
    results.admin.notesUpdate = await readJson(notesPatchResponse, 'Failed to update weekly notes')
  }

  const deniedNotesRouteResponse = await request(
    baseUrl,
    `/api/admin/weekly-notes?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    studentJar,
  )
  results.student.adminNotesDenied = {
    status: deniedNotesRouteResponse.status,
    body: await deniedNotesRouteResponse.json().catch(() => null),
  }

  const deleteImageResponse = await request(
    baseUrl,
    '/api/admin/weekly-media',
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: createdImage.data.id,
      }),
    },
    adminJar,
  )
  results.admin.imageDelete = await readJson(deleteImageResponse, 'Failed to delete weekly image')

  const deleteVideoResponse = await request(
    baseUrl,
    '/api/admin/weekly-media',
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: createdVideo.data.id,
      }),
    },
    adminJar,
  )
  results.admin.videoDelete = await readJson(deleteVideoResponse, 'Failed to delete weekly video')

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
