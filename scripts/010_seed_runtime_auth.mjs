import {
  LOCAL_RUNTIME_ACCOUNTS,
  RUNTIME_QA_CLASS_ID,
  RUNTIME_QA_YEAR_MONTH,
  createAdminHeaders,
  getRuntimePassword,
  getSupabaseEnv,
  loadLocalEnv,
  readJson,
} from './lib/runtime-auth.mjs'

loadLocalEnv()

const { url, serviceRoleKey } = getSupabaseEnv()
const password = getRuntimePassword()
const headers = createAdminHeaders(serviceRoleKey, {
  'Content-Type': 'application/json',
})
const QA_CLASS_NAME = '000 로컬 QA 수업'
const QA_SCHEDULE_RULES = [
  {
    weekday: 1,
    start_time: '16:00',
    end_time: '18:00',
    sort_order: 0,
    is_active: true,
  },
]

function createJsonHeaders(extraHeaders = {}) {
  return createAdminHeaders(serviceRoleKey, {
    'Content-Type': 'application/json',
    ...extraHeaders,
  })
}

function getCurrentYearMonth() {
  const currentDate = new Date()
  return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
}

function buildMonthDate(yearMonth, day) {
  return `${yearMonth}-${String(day).padStart(2, '0')}`
}

function buildQaSessions(yearMonth) {
  const [yearText, monthText] = yearMonth.split('-')
  const year = Number(yearText)
  const month = Number(monthText)

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid QA yearMonth: ${yearMonth}`)
  }

  const monthDays = new Date(year, month, 0).getDate()
  const mondayDates = []

  for (let day = 1; day <= monthDays; day += 1) {
    const date = new Date(year, month - 1, day)
    if (date.getDay() === 1) {
      mondayDates.push(day)
    }
  }

  const selectedDates = mondayDates.slice(0, 4)
  if (selectedDates.length === 0) {
    selectedDates.push(1, 8, 15, 22)
  }

  return selectedDates.map((day, index) => ({
    week_number: index + 1,
    session_date: buildMonthDate(yearMonth, day),
    start_time: '16:00',
    end_time: '18:00',
    source: 'RULE',
  }))
}

function buildQaClassLogs(yearMonth) {
  return Array.from({ length: 4 }, (_, index) => ({
    class_id: RUNTIME_QA_CLASS_ID,
    year_month: yearMonth,
    week_number: index + 1,
    progress: '',
    reflection: '',
    admin_note: '',
    attendance_data: {},
    member_feedback: {},
  }))
}

async function listUsers() {
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    headers: createAdminHeaders(serviceRoleKey),
  })

  const payload = await readJson(response, 'Failed to list auth users')
  return Array.isArray(payload?.users) ? payload.users : []
}

async function ensureAuthUser(account, users) {
  const existing = users.find((item) => item.email === account.email)

  if (existing) {
    const response = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
        },
      }),
    })

    await readJson(response, `Failed to update auth user: ${account.email}`)
    return { id: existing.id, email: account.email }
  }

  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
      },
    }),
  })

  const payload = await readJson(response, `Failed to create auth user: ${account.email}`)
  return { id: payload.user.id, email: account.email }
}

async function upsertProfiles(rows) {
  const response = await fetch(`${url}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: createJsonHeaders({
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(rows),
  })

  return await readJson(response, 'Failed to upsert profiles')
}

async function upsertQaClass(ownerId) {
  const response = await fetch(`${url}/rest/v1/classes?on_conflict=id`, {
    method: 'POST',
    headers: createJsonHeaders({
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify([
      {
        id: RUNTIME_QA_CLASS_ID,
        name: QA_CLASS_NAME,
        instructor_id: ownerId,
        is_active: true,
      },
    ]),
  })

  return await readJson(response, 'Failed to upsert runtime QA class')
}

async function replaceQaScheduleRules() {
  const deleteResponse = await fetch(`${url}/rest/v1/class_schedule_rules?class_id=eq.${RUNTIME_QA_CLASS_ID}`, {
    method: 'DELETE',
    headers: createAdminHeaders(serviceRoleKey),
  })
  await readJson(deleteResponse, 'Failed to clear runtime QA schedule rules')

  const insertResponse = await fetch(`${url}/rest/v1/class_schedule_rules`, {
    method: 'POST',
    headers,
    body: JSON.stringify(
      QA_SCHEDULE_RULES.map((rule) => ({
        class_id: RUNTIME_QA_CLASS_ID,
        ...rule,
      })),
    ),
  })

  return await readJson(insertResponse, 'Failed to seed runtime QA schedule rules')
}

async function replaceQaSessions(yearMonths) {
  for (const yearMonth of yearMonths) {
    const deleteResponse = await fetch(
      `${url}/rest/v1/class_sessions?class_id=eq.${RUNTIME_QA_CLASS_ID}&year_month=eq.${yearMonth}`,
      {
        method: 'DELETE',
        headers: createAdminHeaders(serviceRoleKey),
      },
    )
    await readJson(deleteResponse, `Failed to clear runtime QA sessions: ${yearMonth}`)

    const insertResponse = await fetch(`${url}/rest/v1/class_sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(
        buildQaSessions(yearMonth).map((session) => ({
          class_id: RUNTIME_QA_CLASS_ID,
          year_month: yearMonth,
          ...session,
        })),
      ),
    })

    await readJson(insertResponse, `Failed to seed runtime QA sessions: ${yearMonth}`)
  }
}

async function upsertQaEnrollments(studentId, yearMonths) {
  const response = await fetch(`${url}/rest/v1/enrollments?on_conflict=class_id,student_id,year_month`, {
    method: 'POST',
    headers: createJsonHeaders({
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(
      yearMonths.map((yearMonth) => ({
        class_id: RUNTIME_QA_CLASS_ID,
        student_id: studentId,
        year_month: yearMonth,
        payment_status: false,
        status: 'ACTIVE',
      })),
    ),
  })

  return await readJson(response, 'Failed to upsert runtime QA enrollments')
}

async function upsertQaClassLogs(yearMonths) {
  const response = await fetch(`${url}/rest/v1/class_logs?on_conflict=class_id,year_month,week_number`, {
    method: 'POST',
    headers: createJsonHeaders({
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(yearMonths.flatMap((yearMonth) => buildQaClassLogs(yearMonth))),
  })

  return await readJson(response, 'Failed to upsert runtime QA class logs')
}

async function main() {
  const users = await listUsers()
  const ensured = []

  for (const account of LOCAL_RUNTIME_ACCOUNTS) {
    const user = await ensureAuthUser(account, users)
    ensured.push({
      id: user.id,
      email: account.email,
      role: account.role,
      full_name: account.fullName,
    })
  }

  await upsertProfiles(ensured)
  const ownerProfile = ensured.find((account) => account.role === 'OWNER')
  const studentProfile = ensured.find((account) => account.role === 'STUDENT')

  if (!ownerProfile || !studentProfile) {
    throw new Error('Missing runtime QA owner or student profile')
  }

  const qaYearMonths = Array.from(new Set([RUNTIME_QA_YEAR_MONTH, getCurrentYearMonth()]))

  await upsertQaClass(ownerProfile.id)
  await replaceQaScheduleRules()
  await replaceQaSessions(qaYearMonths)
  await upsertQaEnrollments(studentProfile.id, qaYearMonths)
  await upsertQaClassLogs(qaYearMonths)

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        passwordConfigured: true,
        accounts: ensured.map((account) => ({
          email: account.email,
          role: account.role,
          full_name: account.full_name,
        })),
        qaData: {
          classId: RUNTIME_QA_CLASS_ID,
          className: QA_CLASS_NAME,
          yearMonths: qaYearMonths,
          seededStudentEmail: studentProfile.email,
          sessionCountPerMonth: 4,
          weekCountPerMonth: 4,
        },
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
