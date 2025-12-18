// Утилиты для работы с цветами

/**
 * Генерирует случайный HEX цвет
 */
export function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
}

/**
 * Конвертирует HEX в RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Конвертирует RGB в HEX
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('').toUpperCase()
}

/**
 * Конвертирует HEX в HSL
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Конвертирует HSL в HEX
 */
export function hslToHex(h, s, l) {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return rgbToHex(r, g, b)
}

/**
 * Генерирует гармоничную палитру на основе базового цвета
 */
export function generateHarmoniousPalette(baseColor, count = 5, type = 'analogous') {
  const hsl = hexToHsl(baseColor)
  if (!hsl) return []

  const colors = [baseColor]
  const hue = hsl.h
  const saturation = hsl.s
  const lightness = hsl.l

  switch (type) {
    case 'analogous':
      // Аналогичная палитра (соседние цвета на цветовом круге)
      for (let i = 1; i < count; i++) {
        const newHue = (hue + (i * 30)) % 360
        colors.push(hslToHex(newHue, saturation, lightness))
      }
      break

    case 'monochromatic':
      // Монохромная палитра (разные оттенки одного цвета)
      for (let i = 1; i < count; i++) {
        const newLightness = Math.max(10, Math.min(90, lightness + (i % 2 === 0 ? 15 : -15) * i))
        colors.push(hslToHex(hue, saturation, newLightness))
      }
      break

    case 'triad':
      // Триада (три равноудаленных цвета)
      for (let i = 1; i < count; i++) {
        const newHue = (hue + (i * 120)) % 360
        const newLightness = lightness + (i % 2 === 0 ? 10 : -10)
        colors.push(hslToHex(newHue, saturation, Math.max(10, Math.min(90, newLightness))))
      }
      break

    case 'complementary':
      // Комплементарная (противоположные цвета)
      for (let i = 1; i < count; i++) {
        if (i === 1) {
          colors.push(hslToHex((hue + 180) % 360, saturation, lightness))
        } else {
          const newHue = (hue + (i * 60)) % 360
          colors.push(hslToHex(newHue, saturation, lightness))
        }
      }
      break

    case 'random':
      // Случайная палитра
      for (let i = 1; i < count; i++) {
        colors.push(randomColor())
      }
      break
  }

  return colors.slice(0, count)
}

/**
 * Вычисляет относительную яркость цвета (для WCAG)
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Вычисляет контрастность между двумя цветами
 */
export function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Проверяет соответствие контрастности стандартам WCAG
 */
export function checkWCAG(color1, color2) {
  const ratio = getContrastRatio(color1, color2)
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5, // Для обычного текста
    AALarge: ratio >= 3, // Для крупного текста
    AAA: ratio >= 7, // Для обычного текста
    AAALarge: ratio >= 4.5 // Для крупного текста
  }
}

/**
 * Генерирует палитру по настроению
 */
export function generateMoodPalette(mood, count = 5) {
  const moods = {
    calm: { h: 200, s: 40, l: 60 }, // Спокойные синие тона
    energetic: { h: 0, s: 80, l: 50 }, // Энергичные красные/оранжевые
    professional: { h: 220, s: 30, l: 45 }, // Профессиональные темно-синие
    nature: { h: 120, s: 50, l: 50 }, // Природные зеленые
    warm: { h: 30, s: 70, l: 55 }, // Теплые оранжевые/желтые
    cool: { h: 180, s: 50, l: 55 } // Холодные голубые/зеленые
  }

  const base = moods[mood] || moods.calm
  const colors = []

  for (let i = 0; i < count; i++) {
    const hue = (base.h + (i * 20)) % 360
    const lightness = base.l + (i % 2 === 0 ? 15 : -15) * Math.floor(i / 2)
    colors.push(hslToHex(hue, base.s, Math.max(20, Math.min(80, lightness))))
  }

  return colors
}


