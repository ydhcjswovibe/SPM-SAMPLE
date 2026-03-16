import type { UserRole } from '@/lib/types'

export type AppRole = UserRole

export function normalizeUserRole(role: unknown): AppRole | null {
  if (typeof role !== 'string') return null

  const normalized = role.toUpperCase()
  if (normalized === 'OWNER' || normalized === 'ADMIN' || normalized === 'STUDENT') {
    return normalized
  }

  return null
}

export function isAdminRole(role: unknown): boolean {
  const normalized = normalizeUserRole(role)
  return normalized === 'OWNER' || normalized === 'ADMIN'
}

export function isOwnerRole(role: unknown): boolean {
  return normalizeUserRole(role) === 'OWNER'
}

export function isStudentRole(role: unknown): boolean {
  return normalizeUserRole(role) === 'STUDENT'
}

export function getDefaultRouteForRole(role: unknown): '/admin' | '/student' | '/auth/login' {
  const normalized = normalizeUserRole(role)

  if (normalized === 'OWNER' || normalized === 'ADMIN') {
    return '/admin'
  }

  if (normalized === 'STUDENT') {
    return '/student'
  }

  return '/auth/login'
}

export function normalizeInternalNextPath(path: unknown): string | null {
  if (typeof path !== 'string') return null
  if (!path.startsWith('/')) return null
  if (path.startsWith('//')) return null
  return path
}

export function getPostLoginRoute(role: unknown, requestedPath: unknown): string {
  const defaultRoute = getDefaultRouteForRole(role)
  const safeRequestedPath = normalizeInternalNextPath(requestedPath)

  if (!safeRequestedPath || safeRequestedPath === '/') {
    return defaultRoute
  }

  if (defaultRoute === '/admin' && safeRequestedPath.startsWith('/admin')) {
    return safeRequestedPath
  }

  if (defaultRoute === '/student' && safeRequestedPath.startsWith('/student')) {
    return safeRequestedPath
  }

  return defaultRoute
}

export function getRoleLabel(role: unknown): string {
  const normalized = normalizeUserRole(role)

  if (normalized === 'OWNER') return '오너'
  if (normalized === 'ADMIN') return '관리자'
  if (normalized === 'STUDENT') return '학생'
  return '미확인'
}
