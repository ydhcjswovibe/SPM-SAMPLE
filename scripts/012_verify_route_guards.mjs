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

function toPathname(location) {
  if (!location) {
    return null
  }

  return new URL(location, baseUrl).pathname
}

async function readHtml(basePath, jar) {
  const response = await request(baseUrl, basePath, {}, jar)
  return {
    status: response.status,
    html: await response.text(),
  }
}

async function readRedirect(basePath, jar) {
  const response = await request(baseUrl, basePath, {}, jar)
  return {
    status: response.status,
    location: toPathname(response.headers.get('location')),
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

  const anonymousRootPage = await readHtml('/', null)
  expect(anonymousRootPage.status === 200, 'Anonymous / should render login entry')
  expect(anonymousRootPage.html.includes('Social Plus'), 'Anonymous / login entry copy mismatch')
  results.anonymous.rootPage = {
    status: anonymousRootPage.status,
    containsLoginEntry: anonymousRootPage.html.includes('Social Plus'),
  }

  const anonymousLoginAlias = await readRedirect('/auth/login', null)
  expect(anonymousLoginAlias.status === 307, 'Anonymous /auth/login should redirect')
  expect(anonymousLoginAlias.location === '/', 'Anonymous /auth/login should redirect to /')
  results.anonymous.loginAlias = anonymousLoginAlias

  const anonymousAdminPage = await readRedirect('/admin', null)
  expect(anonymousAdminPage.status === 307, 'Anonymous /admin should redirect to /')
  expect(anonymousAdminPage.location === '/', 'Anonymous /admin redirect location mismatch')
  results.anonymous.adminPage = anonymousAdminPage

  const anonymousStudentPage = await readRedirect('/student', null)
  expect(anonymousStudentPage.status === 307, 'Anonymous /student should redirect to /')
  expect(anonymousStudentPage.location === '/', 'Anonymous /student redirect location mismatch')
  results.anonymous.studentPage = anonymousStudentPage

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

  const ownerRootRedirect = await readRedirect('/', ownerJar)
  expect(ownerRootRedirect.status === 307, 'Owner / should redirect')
  expect(ownerRootRedirect.location === '/admin', 'Owner / should redirect to /admin')
  results.allowedRoutes.ownerRoot = ownerRootRedirect

  const adminRootRedirect = await readRedirect('/', adminJar)
  expect(adminRootRedirect.status === 307, 'Admin / should redirect')
  expect(adminRootRedirect.location === '/admin', 'Admin / should redirect to /admin')
  results.allowedRoutes.adminRoot = adminRootRedirect

  const studentRootRedirect = await readRedirect('/', studentJar)
  expect(studentRootRedirect.status === 307, 'Student / should redirect')
  expect(studentRootRedirect.location === '/student', 'Student / should redirect to /student')
  results.allowedRoutes.studentRoot = studentRootRedirect

  const ownerLoginAlias = await readRedirect('/auth/login', ownerJar)
  expect(ownerLoginAlias.status === 307, 'Owner /auth/login should redirect')
  expect(ownerLoginAlias.location === '/', 'Owner /auth/login should redirect to /')
  results.allowedRoutes.ownerLoginAlias = ownerLoginAlias

  const adminLoginAlias = await readRedirect('/auth/login', adminJar)
  expect(adminLoginAlias.status === 307, 'Admin /auth/login should redirect')
  expect(adminLoginAlias.location === '/', 'Admin /auth/login should redirect to /')
  results.allowedRoutes.adminLoginAlias = adminLoginAlias

  const studentLoginAlias = await readRedirect('/auth/login', studentJar)
  expect(studentLoginAlias.status === 307, 'Student /auth/login should redirect')
  expect(studentLoginAlias.location === '/', 'Student /auth/login should redirect to /')
  results.allowedRoutes.studentLoginAlias = studentLoginAlias

  const ownerAdminPage = await readHtml('/admin', ownerJar)
  expect(ownerAdminPage.status === 200, 'Owner /admin should render')
  results.allowedRoutes.ownerAdminPage = {
    status: ownerAdminPage.status,
  }

  const adminAdminPage = await readHtml('/admin', adminJar)
  expect(adminAdminPage.status === 200, 'Admin /admin should render')
  results.allowedRoutes.adminAdminPage = {
    status: adminAdminPage.status,
  }

  const studentStudentPage = await readHtml('/student', studentJar)
  expect(studentStudentPage.status === 200, 'Student /student should render')
  results.allowedRoutes.studentStudentPage = {
    status: studentStudentPage.status,
  }

  const adminWrongRolePage = await readRedirect('/student', adminJar)
  expect(adminWrongRolePage.status === 307, 'Admin -> /student should redirect')
  expect(adminWrongRolePage.location === '/admin', 'Admin -> /student should redirect to /admin')
  results.wrongRoleRoutes.adminToStudent = adminWrongRolePage

  const studentWrongRolePage = await readRedirect('/admin', studentJar)
  expect(studentWrongRolePage.status === 307, 'Student -> /admin should redirect')
  expect(studentWrongRolePage.location === '/student', 'Student -> /admin should redirect to /student')
  results.wrongRoleRoutes.studentToAdmin = studentWrongRolePage

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
