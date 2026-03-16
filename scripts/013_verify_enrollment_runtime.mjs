import {
  LOCAL_RUNTIME_ACCOUNTS,
  RUNTIME_QA_CLASS_ID,
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

function buildYearMonthCandidates() {
  return Array.from({ length: 12 }, (_, index) => `2099-${String(index + 1).padStart(2, '0')}`)
}

async function main() {
  const results = {
    baseUrl,
    admin: {
      createAttempts: [],
    },
    student: {},
    owner: {},
  }

  const { jar: adminJar } = await loginAs(baseUrl, adminAccount)
  const { jar: ownerJar } = await loginAs(baseUrl, ownerAccount)
  const { jar: studentJar } = await loginAs(baseUrl, studentAccount)

  const studentSessionResponse = await request(baseUrl, '/api/dev/runtime-session', {}, studentJar)
  const studentSession = await readJson(studentSessionResponse, 'Failed to read student runtime session')
  const studentId = studentSession?.data?.userId

  expect(typeof studentId === 'string' && studentId.length > 0, 'Student runtime session is missing userId')

  let createdEnrollmentId = null
  let createdYearMonth = null
  let ownerDeleted = false

  try {
    for (const yearMonth of buildYearMonthCandidates()) {
      const response = await request(
        baseUrl,
        '/api/admin/enrollments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId: RUNTIME_QA_CLASS_ID,
            studentId,
            yearMonth,
            status: 'PENDING',
          }),
        },
        adminJar,
      )

      const payload = await readJsonOrNull(response)
      results.admin.createAttempts.push({
        yearMonth,
        status: response.status,
        body: payload,
      })

      if (response.ok && payload?.data?.id) {
        createdEnrollmentId = payload.data.id
        createdYearMonth = yearMonth
        results.admin.create = {
          status: response.status,
          body: payload,
        }
        break
      }

      if (response.status !== 409 || payload?.error !== 'ENROLLMENT_ALREADY_EXISTS') {
        throw new Error(`Unexpected enrollment create result: ${response.status} ${JSON.stringify(payload)}`)
      }
    }

    expect(createdEnrollmentId, 'Could not create runtime enrollment in any candidate month')
    expect(createdYearMonth, 'Runtime enrollment month was not captured')

    const duplicateCreateResponse = await request(
      baseUrl,
      '/api/admin/enrollments',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: RUNTIME_QA_CLASS_ID,
          studentId,
          yearMonth: createdYearMonth,
          status: 'PENDING',
        }),
      },
      adminJar,
    )
    results.admin.duplicateCreate = {
      status: duplicateCreateResponse.status,
      body: await readJsonOrNull(duplicateCreateResponse),
    }
    expect(duplicateCreateResponse.status === 409, 'Duplicate enrollment create should return 409')

    const statusUpdateResponse = await request(
      baseUrl,
      '/api/admin/enrollments',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: createdEnrollmentId,
          status: 'ACTIVE',
        }),
      },
      adminJar,
    )
    results.admin.statusUpdate = {
      status: statusUpdateResponse.status,
      body: await readJsonOrNull(statusUpdateResponse),
    }
    expect(statusUpdateResponse.status === 200, 'Enrollment status update should return 200')

    const studentDeniedCreate = await request(
      baseUrl,
      '/api/admin/enrollments',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: RUNTIME_QA_CLASS_ID,
          studentId,
          yearMonth: '2098-12',
          status: 'PENDING',
        }),
      },
      studentJar,
    )
    results.student.createDenied = {
      status: studentDeniedCreate.status,
      body: await readJsonOrNull(studentDeniedCreate),
    }
    expect(studentDeniedCreate.status === 403, 'Student create should return 403')

    const adminDeleteDenied = await request(
      baseUrl,
      '/api/admin/enrollments',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: createdEnrollmentId,
        }),
      },
      adminJar,
    )
    results.admin.deleteDenied = {
      status: adminDeleteDenied.status,
      body: await readJsonOrNull(adminDeleteDenied),
    }
    expect(adminDeleteDenied.status === 403, 'Admin delete should return 403')

    const ownerDeleteResponse = await request(
      baseUrl,
      '/api/admin/enrollments',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: createdEnrollmentId,
        }),
      },
      ownerJar,
    )
    results.owner.delete = {
      status: ownerDeleteResponse.status,
      body: await readJsonOrNull(ownerDeleteResponse),
    }
    expect(ownerDeleteResponse.status === 200, 'Owner delete should return 200')
    ownerDeleted = true

    const ownerDeleteAgainResponse = await request(
      baseUrl,
      '/api/admin/enrollments',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: createdEnrollmentId,
        }),
      },
      ownerJar,
    )
    results.owner.deleteAgain = {
      status: ownerDeleteAgainResponse.status,
      body: await readJsonOrNull(ownerDeleteAgainResponse),
    }
    expect(ownerDeleteAgainResponse.status === 404, 'Deleting the same enrollment twice should return 404')
  } finally {
    if (createdEnrollmentId && !ownerDeleted) {
      await request(
        baseUrl,
        '/api/admin/enrollments',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrollmentId: createdEnrollmentId,
          }),
        },
        ownerJar,
      )
    }
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
