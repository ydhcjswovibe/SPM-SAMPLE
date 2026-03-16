import {
  LOCAL_RUNTIME_ACCOUNTS,
  RUNTIME_QA_CLASS_ID,
  RUNTIME_QA_YEAR_MONTH,
  readJson,
} from './lib/runtime-auth.mjs'
import { loginAs, readJsonOrNull, request, resolveBaseUrl } from './lib/runtime-http.mjs'

const baseUrl = resolveBaseUrl()
const ownerAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'OWNER')
const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')
const studentAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'STUDENT')

if (!ownerAccount || !adminAccount || !studentAccount) {
  throw new Error('Missing runtime QA accounts')
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function readHtml(basePath, jar) {
  const response = await request(baseUrl, basePath, {}, jar)
  return {
    status: response.status,
    html: await response.text(),
  }
}

function buildPatchedName(originalName, suffix) {
  const fallback = suffix === 'admin' ? '매트릭스 관리자' : '학생1'
  const baseName = originalName?.trim() || fallback
  return `${baseName}-${suffix}-qa`
}

async function patchOwnProfile(jar, fullName) {
  const response = await request(
    baseUrl,
    '/api/profile',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName }),
    },
    jar,
  )

  return {
    status: response.status,
    body: await readJsonOrNull(response),
  }
}

async function main() {
  const results = {
    baseUrl,
    anonymous: {},
    allowedRoutes: {},
    wrongRoleRoutes: {},
    api: {},
    profile: {},
  }

  const anonymousAdminPage = await readHtml('/admin', null)
  expect(anonymousAdminPage.status === 200, 'Anonymous /admin should render access gate')
  expect(anonymousAdminPage.html.includes('관리자 로그인이 필요합니다'), 'Anonymous /admin gate copy mismatch')
  results.anonymous.adminPage = {
    status: anonymousAdminPage.status,
    containsGate: anonymousAdminPage.html.includes('관리자 로그인이 필요합니다'),
  }

  const anonymousStudentPage = await readHtml('/student', null)
  expect(anonymousStudentPage.status === 200, 'Anonymous /student should render access gate')
  expect(anonymousStudentPage.html.includes('학생 로그인이 필요합니다'), 'Anonymous /student gate copy mismatch')
  results.anonymous.studentPage = {
    status: anonymousStudentPage.status,
    containsGate: anonymousStudentPage.html.includes('학생 로그인이 필요합니다'),
  }

  const anonymousAdminApi = await request(
    baseUrl,
    `/api/admin/matrix?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
  )
  results.anonymous.adminMatrixApi = {
    status: anonymousAdminApi.status,
    body: await readJsonOrNull(anonymousAdminApi),
  }
  expect(anonymousAdminApi.status === 401, 'Anonymous admin matrix API should return 401')

  const anonymousProfilePatch = await request(
    baseUrl,
    '/api/profile',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName: 'anonymous-qa' }),
    },
  )
  results.anonymous.profilePatch = {
    status: anonymousProfilePatch.status,
    body: await readJsonOrNull(anonymousProfilePatch),
  }
  expect(anonymousProfilePatch.status === 401, 'Anonymous profile patch should return 401')

  const { jar: ownerJar } = await loginAs(baseUrl, ownerAccount)
  const { jar: adminJar } = await loginAs(baseUrl, adminAccount)
  const { jar: studentJar } = await loginAs(baseUrl, studentAccount)

  const ownerAdminPage = await readHtml('/admin', ownerJar)
  expect(ownerAdminPage.status === 200, 'Owner /admin should render')
  expect(!ownerAdminPage.html.includes('관리자 로그인이 필요합니다'), 'Owner /admin should not show login gate')
  results.allowedRoutes.ownerAdminPage = {
    status: ownerAdminPage.status,
    containsGate: ownerAdminPage.html.includes('관리자 로그인이 필요합니다'),
  }

  const adminAdminPage = await readHtml('/admin', adminJar)
  expect(adminAdminPage.status === 200, 'Admin /admin should render')
  expect(!adminAdminPage.html.includes('관리자 권한이 필요합니다'), 'Admin /admin should not show denied gate')
  results.allowedRoutes.adminAdminPage = {
    status: adminAdminPage.status,
    containsDeniedGate: adminAdminPage.html.includes('관리자 권한이 필요합니다'),
  }

  const studentStudentPage = await readHtml('/student', studentJar)
  expect(studentStudentPage.status === 200, 'Student /student should render')
  expect(!studentStudentPage.html.includes('학생 로그인이 필요합니다'), 'Student /student should not show login gate')
  results.allowedRoutes.studentStudentPage = {
    status: studentStudentPage.status,
    containsGate: studentStudentPage.html.includes('학생 로그인이 필요합니다'),
  }

  const adminWrongRolePage = await readHtml('/student', adminJar)
  expect(adminWrongRolePage.html.includes('학생 전용 화면입니다'), 'Admin -> /student wrong-role copy mismatch')
  expect(!adminWrongRolePage.html.includes('role:'), 'Admin -> /student should not expose raw role label')
  results.wrongRoleRoutes.adminToStudent = {
    status: adminWrongRolePage.status,
    containsWrongRole: adminWrongRolePage.html.includes('학생 전용 화면입니다'),
    exposesRawRole: adminWrongRolePage.html.includes('role:'),
  }

  const studentWrongRolePage = await readHtml('/admin', studentJar)
  expect(studentWrongRolePage.html.includes('관리자 권한이 필요합니다'), 'Student -> /admin wrong-role copy mismatch')
  expect(!studentWrongRolePage.html.includes('role:'), 'Student -> /admin should not expose raw role label')
  results.wrongRoleRoutes.studentToAdmin = {
    status: studentWrongRolePage.status,
    containsWrongRole: studentWrongRolePage.html.includes('관리자 권한이 필요합니다'),
    exposesRawRole: studentWrongRolePage.html.includes('role:'),
  }

  const studentAdminApi = await request(
    baseUrl,
    `/api/admin/matrix?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    studentJar,
  )
  results.api.studentAdminMatrix = {
    status: studentAdminApi.status,
    body: await readJsonOrNull(studentAdminApi),
  }
  expect(studentAdminApi.status === 403, 'Student admin matrix API should return 403')

  const adminMatrixApi = await request(
    baseUrl,
    `/api/admin/matrix?classId=${RUNTIME_QA_CLASS_ID}&yearMonth=${RUNTIME_QA_YEAR_MONTH}`,
    {},
    adminJar,
  )
  const adminMatrixPayload = await readJson(adminMatrixApi, 'Failed to read admin matrix route')
  results.api.adminMatrix = {
    status: adminMatrixApi.status,
    rowCount: Array.isArray(adminMatrixPayload?.data?.students) ? adminMatrixPayload.data.students.length : 0,
  }
  expect(adminMatrixApi.status === 200, 'Admin admin matrix API should return 200')

  const adminSessionResponse = await request(baseUrl, '/api/dev/runtime-session', {}, adminJar)
  const adminSession = await readJson(adminSessionResponse, 'Failed to read admin runtime session')
  const adminOriginalName = adminSession?.data?.fullName ?? null
  const adminPatchedName = buildPatchedName(adminOriginalName, 'admin')

  const studentSessionResponse = await request(baseUrl, '/api/dev/runtime-session', {}, studentJar)
  const studentSession = await readJson(studentSessionResponse, 'Failed to read student runtime session')
  const studentOriginalName = studentSession?.data?.fullName ?? null
  const studentPatchedName = buildPatchedName(studentOriginalName, 'student')

  try {
    const adminProfilePatch = await patchOwnProfile(adminJar, adminPatchedName)
    expect(adminProfilePatch.status === 200, 'Admin profile patch should return 200')
    expect(adminProfilePatch.body?.data?.full_name === adminPatchedName, 'Admin profile patch should persist full_name')
    results.profile.adminPatch = adminProfilePatch

    const studentProfilePatch = await patchOwnProfile(studentJar, studentPatchedName)
    expect(studentProfilePatch.status === 200, 'Student profile patch should return 200')
    expect(studentProfilePatch.body?.data?.full_name === studentPatchedName, 'Student profile patch should persist full_name')
    results.profile.studentPatch = studentProfilePatch
  } finally {
    const adminRestore = await patchOwnProfile(adminJar, adminOriginalName)
    const studentRestore = await patchOwnProfile(studentJar, studentOriginalName)
    results.profile.adminRestore = adminRestore
    results.profile.studentRestore = studentRestore
    expect(adminRestore.status === 200, 'Admin profile restore should return 200')
    expect(studentRestore.status === 200, 'Student profile restore should return 200')
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
