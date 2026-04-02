export function alphaFromCssColor(value) {
  if (!value || value === 'transparent') {
    return 0
  }

  const rgbaMatch = value.match(/^rgba\((.+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim())
    return Number(parts[3] ?? 1)
  }

  if (value.startsWith('rgb(')) {
    return 1
  }

  return 1
}

export async function readSurface(locator) {
  return await locator.evaluate((node) => {
    const style = window.getComputedStyle(node)
    const rect = node.getBoundingClientRect()

    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    }
  })
}

export function assertOpaqueSurface(surface, label) {
  const alpha = alphaFromCssColor(surface.backgroundColor)
  const hasOpaqueBackground = alpha > 0.9 || surface.backgroundImage !== 'none'
  const opacity = Number(surface.opacity)

  if (!hasOpaqueBackground) {
    throw new Error(`${label} background should not be transparent`)
  }

  if (!Number.isFinite(opacity) || opacity < 0.85) {
    throw new Error(`${label} opacity should stay opaque enough`)
  }
}

export async function expectOpaqueSurface(locator, label) {
  let lastError = null

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const surface = await readSurface(locator)

    try {
      assertOpaqueSurface(surface, label)
      return surface
    } catch (error) {
      lastError = error

      if (attempt === 2) {
        throw error
      }

      await locator.evaluate(
        () =>
          new Promise((resolve) => {
            window.setTimeout(resolve, 180)
          }),
      )
    }
  }

  throw lastError ?? new Error(`${label} surface check failed`)
}
