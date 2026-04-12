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

export function hasTransparentGradientStop(value) {
  if (!value || value === 'none') {
    return false
  }

  if (value.includes('transparent')) {
    return true
  }

  const rgbaMatches = value.match(/rgba\(([^)]+)\)/g) ?? []

  return rgbaMatches.some((match) => {
    const parts = match
      .slice('rgba('.length, -1)
      .split(',')
      .map((part) => part.trim())
    const alpha = Number(parts[3] ?? 1)
    return Number.isFinite(alpha) && alpha < 0.995
  })
}

export async function readSurface(locator) {
  return await locator.evaluate((node) => {
    const style = window.getComputedStyle(node)
    const rect = node.getBoundingClientRect()
    const svg = node.querySelector('svg')
    const svgRect = svg?.getBoundingClientRect() ?? null
    const filledSvgPath =
      svg?.querySelector('path[fill]:not([fill="none"])') ??
      svg?.querySelector('rect[fill]:not([fill="none"])') ??
      null
    const filledSvgStyle = filledSvgPath ? window.getComputedStyle(filledSvgPath) : null

    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderImageSource: style.borderImageSource,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      svgFill: filledSvgStyle?.fill ?? null,
      svgWidthRatio: svgRect && rect.width > 0 ? svgRect.width / rect.width : 0,
      svgHeightRatio: svgRect && rect.height > 0 ? svgRect.height / rect.height : 0,
    }
  })
}

export function assertOpaqueSurface(surface, label) {
  const alpha = alphaFromCssColor(surface.backgroundColor)
  const svgFillAlpha = alphaFromCssColor(surface.svgFill)
  const hasBackgroundImage = surface.backgroundImage && surface.backgroundImage !== 'none'
  const hasBorderImage = surface.borderImageSource && surface.borderImageSource !== 'none'
  const hasOpaqueBackground = hasBackgroundImage
    ? !hasTransparentGradientStop(surface.backgroundImage)
    : alpha > 0.99
  const hasOpaqueSvgSurface =
    svgFillAlpha > 0.99 && surface.svgWidthRatio >= 0.95 && surface.svgHeightRatio >= 0.95
  const opacity = Number(surface.opacity)

  if (!hasOpaqueBackground && !hasOpaqueSvgSurface && !hasBorderImage) {
    throw new Error(`${label} background should stay opaque`)
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
