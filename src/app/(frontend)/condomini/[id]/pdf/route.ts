import type { Fornitori } from '@/payload-types'
import config from '@payload-config'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'
import { getPayload } from 'payload'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import slugify from 'slugify'

type RGB = [number, number, number]

type TypeStyle = {
  accent: RGB
  icon: RGB
  iconBg: RGB
  chipBg: RGB
  chipText: RGB
}

const TYPE_STYLES: Record<string, TypeStyle> = {
  elettricista: {
    accent: [245, 158, 11],
    icon: [146, 64, 14],
    iconBg: [254, 243, 199],
    chipBg: [255, 251, 235],
    chipText: [146, 64, 14],
  },
  'impresa edile': {
    accent: [249, 115, 22],
    icon: [154, 52, 18],
    iconBg: [255, 237, 213],
    chipBg: [255, 247, 237],
    chipText: [154, 52, 18],
  },
  idraulico: {
    accent: [59, 130, 246],
    icon: [30, 64, 175],
    iconBg: [219, 234, 254],
    chipBg: [239, 246, 255],
    chipText: [30, 64, 175],
  },
  ascensorista: {
    accent: [139, 92, 246],
    icon: [91, 33, 182],
    iconBg: [237, 233, 254],
    chipBg: [245, 243, 255],
    chipText: [91, 33, 182],
  },
  manutentore: {
    accent: [16, 185, 129],
    icon: [6, 95, 70],
    iconBg: [209, 250, 229],
    chipBg: [236, 253, 245],
    chipText: [6, 95, 70],
  },
  caldaista: {
    accent: [239, 68, 68],
    icon: [153, 27, 27],
    iconBg: [254, 226, 226],
    chipBg: [254, 242, 242],
    chipText: [153, 27, 27],
  },
  spurghi: {
    accent: [14, 165, 233],
    icon: [3, 105, 161],
    iconBg: [224, 242, 254],
    chipBg: [240, 249, 255],
    chipText: [3, 105, 161],
  },
  fabbro: {
    accent: [100, 116, 139],
    icon: [51, 65, 85],
    iconBg: [226, 232, 240],
    chipBg: [241, 245, 249],
    chipText: [51, 65, 85],
  },
  amministratore: {
    accent: [15, 118, 110],
    icon: [17, 94, 89],
    iconBg: [204, 251, 241],
    chipBg: [240, 253, 250],
    chipText: [17, 94, 89],
  },
}

const DEFAULT_STYLE: TypeStyle = {
  accent: [15, 118, 110],
  icon: [17, 94, 89],
  iconBg: [204, 251, 241],
  chipBg: [240, 253, 250],
  chipText: [17, 94, 89],
}

const toRgb = ([r, g, b]: RGB) => rgb(r / 255, g / 255, b / 255)

const getTypeStyle = (supplierType?: string | null): TypeStyle => {
  if (!supplierType) return DEFAULT_STYLE
  return TYPE_STYLES[supplierType.trim().toLowerCase()] ?? DEFAULT_STYLE
}

const truncateText = (value: string, font: PDFFont, size: number, maxWidth: number): string => {
  if (!value) return ''
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value
  const ellipsis = '…'
  let output = value
  while (output.length > 1 && font.widthOfTextAtSize(`${output}${ellipsis}`, size) > maxWidth) {
    output = output.slice(0, -1)
  }
  return `${output}${ellipsis}`
}

const wrapText = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  maxLines: number,
): string[] => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return ['-']

  const lines: string[] = []
  let currentLine = words[0]

  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${currentLine} ${words[index]}`
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate
      continue
    }

    lines.push(currentLine)
    currentLine = words[index]

    if (lines.length === maxLines - 1) {
      const remaining = [currentLine, ...words.slice(index + 1)].join(' ')
      lines.push(truncateText(remaining, font, size, maxWidth))
      return lines
    }
  }

  lines.push(currentLine)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = truncateText(kept[maxLines - 1], font, size, maxWidth)
    return kept
  }

  return lines
}

const drawSegment = (
  page: PDFPage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: ReturnType<typeof rgb>,
  thickness = 1.15,
) => {
  page.drawLine({
    color,
    end: { x: endX, y: endY },
    start: { x: startX, y: startY },
    thickness,
  })
}

const drawTypeIcon = (
  page: PDFPage,
  supplierType: string | null | undefined,
  centerX: number,
  centerY: number,
  color: ReturnType<typeof rgb>,
) => {
  const iconType = supplierType?.trim().toLowerCase() ?? ''

  switch (iconType) {
    case 'elettricista': {
      drawSegment(page, centerX - 3.6, centerY + 4.7, centerX - 0.2, centerY + 1.1, color)
      drawSegment(page, centerX - 0.2, centerY + 1.1, centerX - 1.5, centerY + 1.1, color)
      drawSegment(page, centerX - 1.5, centerY + 1.1, centerX + 3.7, centerY - 4.8, color)
      drawSegment(page, centerX + 3.7, centerY - 4.8, centerX + 0.7, centerY - 1.1, color)
      return
    }

    case 'impresa edile': {
      page.drawRectangle({
        borderColor: color,
        borderWidth: 1.1,
        height: 8.6,
        width: 9.2,
        x: centerX - 4.6,
        y: centerY - 4.6,
      })
      drawSegment(page, centerX - 5.2, centerY + 4, centerX, centerY + 6.4, color)
      drawSegment(page, centerX, centerY + 6.4, centerX + 5.2, centerY + 4, color)
      drawSegment(page, centerX, centerY - 4.6, centerX, centerY + 4, color, 1)
      drawSegment(page, centerX - 2.4, centerY + 1.4, centerX - 2.4, centerY + 3.5, color, 1)
      drawSegment(page, centerX + 2.4, centerY + 1.4, centerX + 2.4, centerY + 3.5, color, 1)
      return
    }

    case 'idraulico': {
      drawSegment(page, centerX - 4.4, centerY + 3.4, centerX + 1.2, centerY + 3.4, color)
      drawSegment(page, centerX + 1.2, centerY + 3.4, centerX + 1.2, centerY - 1.7, color)
      drawSegment(page, centerX + 1.2, centerY - 1.7, centerX + 4.4, centerY - 1.7, color)
      page.drawCircle({
        borderColor: color,
        borderWidth: 1.1,
        size: 1.4,
        x: centerX - 4.4,
        y: centerY + 3.4,
      })
      page.drawCircle({
        borderColor: color,
        borderWidth: 1.1,
        size: 1.4,
        x: centerX + 4.4,
        y: centerY - 1.7,
      })
      return
    }

    case 'ascensorista': {
      page.drawRectangle({
        borderColor: color,
        borderWidth: 1.1,
        height: 11,
        width: 9,
        x: centerX - 4.5,
        y: centerY - 5.5,
      })
      drawSegment(page, centerX, centerY - 5.5, centerX, centerY + 5.5, color, 1)
      drawSegment(page, centerX - 2.8, centerY + 0.2, centerX - 1.6, centerY + 2.4, color, 1.1)
      drawSegment(page, centerX - 1.6, centerY + 2.4, centerX - 0.4, centerY + 0.2, color, 1.1)
      drawSegment(page, centerX + 0.4, centerY + 0.2, centerX + 1.6, centerY - 2, color, 1.1)
      drawSegment(page, centerX + 1.6, centerY - 2, centerX + 2.8, centerY + 0.2, color, 1.1)
      return
    }

    case 'manutentore': {
      drawSegment(page, centerX - 4.3, centerY - 4.3, centerX + 4.3, centerY + 4.3, color, 1.25)
      drawSegment(page, centerX - 4.3, centerY + 4.3, centerX + 4.3, centerY - 4.3, color, 1.25)
      page.drawCircle({ color, size: 1.1, x: centerX - 4.3, y: centerY - 4.3 })
      page.drawCircle({ color, size: 1.1, x: centerX + 4.3, y: centerY + 4.3 })
      return
    }

    case 'caldaista': {
      page.drawRectangle({
        borderColor: color,
        borderWidth: 1.1,
        height: 10.2,
        width: 9.2,
        x: centerX - 4.6,
        y: centerY - 5.1,
      })
      page.drawCircle({
        borderColor: color,
        borderWidth: 1.1,
        size: 1.4,
        x: centerX - 1.8,
        y: centerY + 1.6,
      })
      drawSegment(page, centerX + 1.2, centerY - 3.3, centerX + 2.9, centerY - 0.3, color, 1.1)
      drawSegment(page, centerX + 2.9, centerY - 0.3, centerX + 1.2, centerY + 1.4, color, 1.1)
      drawSegment(page, centerX + 1.2, centerY + 1.4, centerX - 0.2, centerY - 0.3, color, 1.1)
      drawSegment(page, centerX - 0.2, centerY - 0.3, centerX + 1.2, centerY - 3.3, color, 1.1)
      return
    }

    case 'spurghi': {
      page.drawRectangle({
        borderColor: color,
        borderWidth: 1.1,
        height: 4.4,
        width: 7,
        x: centerX - 5.2,
        y: centerY - 1.6,
      })
      page.drawRectangle({
        borderColor: color,
        borderWidth: 1.1,
        height: 3.4,
        width: 3.2,
        x: centerX + 1.8,
        y: centerY - 1.6,
      })
      page.drawCircle({
        borderColor: color,
        borderWidth: 1.1,
        size: 1.4,
        x: centerX - 2.8,
        y: centerY - 2.7,
      })
      page.drawCircle({
        borderColor: color,
        borderWidth: 1.1,
        size: 1.4,
        x: centerX + 3.4,
        y: centerY - 2.7,
      })
      return
    }

    case 'fabbro': {
      page.drawCircle({
        borderColor: color,
        borderWidth: 1.1,
        size: 2.2,
        x: centerX - 3.2,
        y: centerY + 0.8,
      })
      drawSegment(page, centerX - 1, centerY + 0.8, centerX + 4.4, centerY + 0.8, color)
      drawSegment(page, centerX + 2.1, centerY + 0.8, centerX + 2.1, centerY - 1.4, color, 1)
      drawSegment(page, centerX + 3.5, centerY + 0.8, centerX + 3.5, centerY - 0.2, color, 1)
      return
    }

    case 'amministratore': {
      drawSegment(page, centerX - 5.2, centerY + 3.8, centerX, centerY + 6, color)
      drawSegment(page, centerX, centerY + 6, centerX + 5.2, centerY + 3.8, color)
      drawSegment(page, centerX - 5.2, centerY - 4.4, centerX + 5.2, centerY - 4.4, color)
      drawSegment(page, centerX - 3, centerY - 4.4, centerX - 3, centerY + 3, color, 1)
      drawSegment(page, centerX, centerY - 4.4, centerX, centerY + 3, color, 1)
      drawSegment(page, centerX + 3, centerY - 4.4, centerX + 3, centerY + 3, color, 1)
      return
    }

    default: {
      page.drawRectangle({
        borderColor: color,
        borderWidth: 1.1,
        height: 10,
        width: 8.2,
        x: centerX - 4.1,
        y: centerY - 5,
      })
      drawSegment(page, centerX - 2.7, centerY + 1.8, centerX + 2.7, centerY + 1.8, color, 1)
      drawSegment(page, centerX - 2.7, centerY - 0.5, centerX + 2.7, centerY - 0.5, color, 1)
    }
  }
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string
    }>
  },
) {
  const { id } = await context.params
  const payload = await getPayload({ config })

  const condominio = await payload
    .findByID({
      collection: 'condomini',
      id,
      depth: 2,
    })
    .catch(() => null)

  if (!condominio) return new Response('Condominio non trovato', { status: 404 })

  const fornitori = (condominio.fornitori ?? []).filter(
    (fornitore): fornitore is Fornitori => typeof fornitore !== 'number',
  )

  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)

  const page = pdf.addPage([595.28, 841.89])
  let bodyFont = await pdf.embedFont(StandardFonts.Helvetica)
  let headingFont = await pdf.embedFont(StandardFonts.HelveticaBold)

  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'SpaceGrotesk[wght].ttf')
    const fontBytes = await readFile(fontPath)
    const modernFont = await pdf.embedFont(fontBytes, { subset: true })
    bodyFont = modernFont
    headingFont = modernFont
  } catch {}

  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const margin = 30
  const nomeCondominio = condominio.nomeCondominio || `Condominio #${condominio.id}`

  page.drawRectangle({
    color: rgb(0.95, 0.97, 0.99),
    height: pageHeight,
    width: pageWidth,
    x: 0,
    y: 0,
  })

  page.drawCircle({
    color: rgb(0.86, 0.96, 0.91),
    size: 105,
    x: 26,
    y: pageHeight - 18,
  })

  page.drawCircle({
    color: rgb(1, 0.95, 0.84),
    size: 88,
    x: pageWidth - 24,
    y: pageHeight - 44,
  })

  const headerHeight = 66
  const headerY = pageHeight - margin - headerHeight
  const headerWidth = pageWidth - margin * 2

  page.drawRectangle({
    color: rgb(0.85, 0.89, 0.94),
    height: headerHeight,
    width: headerWidth,
    x: margin + 1.6,
    y: headerY - 1.8,
  })

  page.drawRectangle({
    borderColor: rgb(0.8, 0.84, 0.9),
    borderWidth: 1,
    color: rgb(1, 1, 1),
    height: headerHeight,
    width: headerWidth,
    x: margin,
    y: headerY,
  })

  page.drawRectangle({
    color: rgb(0.09, 0.58, 0.5),
    height: headerHeight,
    width: 4,
    x: margin,
    y: headerY,
  })

  page.drawText('Scheda fornitori condominio', {
    color: rgb(0.09, 0.16, 0.21),
    font: headingFont,
    size: 17.6,
    x: margin + 14,
    y: headerY + 39,
  })

  page.drawText(truncateText(nomeCondominio, bodyFont, 10.4, headerWidth - 198), {
    color: rgb(0.35, 0.42, 0.48),
    font: bodyFont,
    size: 10.4,
    x: margin + 14,
    y: headerY + 21,
  })

  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo-pr.jpeg')
    const logoBytes = await readFile(logoPath)
    const logoImage = await pdf.embedJpg(logoBytes)
    const maxLogoWidth = 166
    const maxLogoHeight = 44
    const scaled = logoImage.scale(1)
    const ratio = Math.min(maxLogoWidth / scaled.width, maxLogoHeight / scaled.height)
    const logoWidth = scaled.width * ratio
    const logoHeight = scaled.height * ratio

    page.drawImage(logoImage, {
      height: logoHeight,
      width: logoWidth,
      x: pageWidth - margin - logoWidth - 8,
      y: headerY + (headerHeight - logoHeight) / 2,
    })
  } catch {}

  const columns = 2
  const cardGapX = 14
  const cardGapY = 12
  const cardWidth = (pageWidth - margin * 2 - cardGapX) / columns
  const startY = headerY - 14
  const maxCards = 8
  const shown = fornitori.slice(0, maxCards)
  const qrSize = 72
  const cardPadding = 12
  const topBarHeight = 30
  const nameFontSize = 10.9
  const nameLineHeight = 11.6
  const contentGap = 10
  const textColumnWidth = cardWidth - cardPadding * 2 - qrSize - contentGap
  const nameLinesList = shown.map((fornitore) =>
    wrapText(fornitore.nomeAzienda || `Fornitore #${fornitore.id}`, headingFont, nameFontSize, textColumnWidth, 3),
  )
  const maxNameLines = Math.max(...nameLinesList.map((lines) => lines.length), 1)
  const cardHeight = Math.max(156, 142 + (maxNameLines - 1) * 10)

  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

  for (let index = 0; index < shown.length; index += 1) {
    const fornitore = shown[index]
    const col = index % columns
    const row = Math.floor(index / columns)
    const x = margin + col * (cardWidth + cardGapX)
    const y = startY - row * (cardHeight + cardGapY) - cardHeight
    const supplierType = fornitore.type || 'Tipo non disponibile'
    const style = getTypeStyle(fornitore.type)
    const accentColor = toRgb(style.accent)

    page.drawRectangle({
      color: rgb(0.86, 0.89, 0.94),
      height: cardHeight,
      width: cardWidth,
      x: x + 1.5,
      y: y - 1.5,
    })

    page.drawRectangle({
      borderColor: rgb(0.8, 0.84, 0.9),
      borderWidth: 1,
      color: rgb(1, 1, 1),
      height: cardHeight,
      width: cardWidth,
      x,
      y,
    })

    page.drawRectangle({
      color: toRgb(style.iconBg),
      height: topBarHeight,
      width: cardWidth,
      x,
      y: y + cardHeight - topBarHeight,
    })

    page.drawRectangle({
      color: accentColor,
      height: topBarHeight,
      width: 4,
      x,
      y: y + cardHeight - topBarHeight,
    })

    const iconCenterX = x + cardPadding + 9
    const iconCenterY = y + cardHeight - topBarHeight / 2

    page.drawCircle({
      color: rgb(1, 1, 1),
      size: 9,
      x: iconCenterX,
      y: iconCenterY,
    })

    drawTypeIcon(page, fornitore.type, iconCenterX, iconCenterY, toRgb(style.icon))

    page.drawText(truncateText(supplierType, bodyFont, 8.3, textColumnWidth - 18), {
      color: toRgb(style.icon),
      font: bodyFont,
      size: 8.3,
      x: x + cardPadding + 22,
      y: iconCenterY - 3.2,
    })

    const nameX = x + cardPadding
    const nameLines = nameLinesList[index]
    const nameStartY = y + cardHeight - topBarHeight - 12

    nameLines.forEach((line, lineIndex) => {
      page.drawText(line, {
        color: rgb(0.1, 0.15, 0.2),
        font: headingFont,
        size: nameFontSize,
        x: nameX,
        y: nameStartY - lineIndex * nameLineHeight,
      })
    })

    const chipFontSize = 8.1
    const chipText = truncateText(supplierType, bodyFont, chipFontSize, textColumnWidth - 8)
    const chipWidth = Math.min(textColumnWidth, bodyFont.widthOfTextAtSize(chipText, chipFontSize) + 13)
    const chipY = nameStartY - nameLines.length * nameLineHeight - 10

    page.drawRectangle({
      borderColor: accentColor,
      borderWidth: 0.9,
      color: toRgb(style.chipBg),
      height: 14,
      width: chipWidth,
      x: nameX,
      y: chipY,
    })

    page.drawText(chipText, {
      color: toRgb(style.chipText),
      font: bodyFont,
      size: chipFontSize,
      x: nameX + 6.5,
      y: chipY + 3.8,
    })

    const contactFullName = [fornitore.contattoNome, fornitore.contattoCognome].filter(Boolean).join(' ')
    const infoRows = [
      { label: 'Referente', value: contactFullName || '-' },
      { label: 'Email', value: fornitore.email || '-' },
      { label: 'Telefono', value: fornitore.telefono || '-' },
    ]

    let infoY = chipY - 9

    infoRows.forEach((rowData) => {
      page.drawText(`${rowData.label}:`, {
        color: rgb(0.43, 0.49, 0.56),
        font: bodyFont,
        size: 7.2,
        x: nameX,
        y: infoY,
      })

      page.drawText(truncateText(rowData.value, bodyFont, 8.8, textColumnWidth), {
        color: rgb(0.12, 0.18, 0.23),
        font: headingFont,
        size: 8.8,
        x: nameX,
        y: infoY - 8.1,
      })

      infoY -= 19.5
    })

    const qrImageUrl =
      typeof fornitore.qrImage === 'object' &&
      fornitore.qrImage &&
      'url' in fornitore.qrImage &&
      fornitore.qrImage.url
        ? fornitore.qrImage.url
        : null

    const qrX = x + cardWidth - cardPadding - qrSize
    const qrY = y + (cardHeight - qrSize) / 2 - 1

    page.drawRectangle({
      borderColor: accentColor,
      borderWidth: 1,
      color: rgb(1, 1, 1),
      height: qrSize,
      width: qrSize,
      x: qrX,
      y: qrY,
    })

    page.drawRectangle({
      color: toRgb(style.iconBg),
      height: 10,
      width: qrSize,
      x: qrX,
      y: qrY + qrSize - 10,
    })

    page.drawText('SCAN', {
      color: toRgb(style.icon),
      font: bodyFont,
      size: 6.7,
      x: qrX + qrSize / 2 - bodyFont.widthOfTextAtSize('SCAN', 6.7) / 2,
      y: qrY + qrSize - 7.2,
    })

    if (!qrImageUrl) {
      page.drawText('QR', {
        color: rgb(0.38, 0.46, 0.54),
        font: headingFont,
        size: 14,
        x: qrX + 22,
        y: qrY + 28,
      })
      continue
    }

    try {
      const absolute = qrImageUrl.startsWith('http')
        ? qrImageUrl
        : new URL(qrImageUrl, baseURL).toString()
      const imageResponse = await fetch(absolute)
      if (!imageResponse.ok) continue
      const imageBytes = await imageResponse.arrayBuffer()
      const contentType = imageResponse.headers.get('content-type') ?? ''
      const embedded =
        contentType.includes('jpeg') || contentType.includes('jpg')
          ? await pdf.embedJpg(imageBytes)
          : await pdf.embedPng(imageBytes)
      page.drawImage(embedded, {
        height: qrSize - 18,
        width: qrSize - 18,
        x: qrX + 9,
        y: qrY + 5,
      })
    } catch {
      page.drawText('QR', {
        color: rgb(0.38, 0.46, 0.54),
        font: headingFont,
        size: 14,
        x: qrX + 22,
        y: qrY + 28,
      })
    }
  }

  if (fornitori.length > maxCards) {
    page.drawText(`Mostrati ${maxCards} fornitori su ${fornitori.length}`, {
      color: rgb(0.39, 0.45, 0.53),
      font: bodyFont,
      size: 9,
      x: margin,
      y: margin - 2,
    })
  }

  const bytes = await pdf.save()
  const fileSlug =
    slugify(nomeCondominio, { lower: true, strict: true, trim: true }) || `condominio-${condominio.id}`

  return new Response(bytes, {
    headers: {
      'Content-Disposition': `attachment; filename="${fileSlug}-fornitori.pdf"`,
      'Content-Type': 'application/pdf',
    },
    status: 200,
  })
}
