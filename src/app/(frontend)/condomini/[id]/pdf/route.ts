import type { Fornitori } from '@/payload-types'
import config from '@payload-config'
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
  const page = pdf.addPage([595.28, 841.89])
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const margin = 36

  page.drawRectangle({
    color: rgb(0.97, 0.98, 0.97),
    height: pageHeight,
    width: pageWidth,
    x: 0,
    y: 0,
  })

  page.drawRectangle({
    color: rgb(0.9, 0.98, 0.95),
    height: 34,
    width: pageWidth,
    x: 0,
    y: pageHeight - 34,
  })

  page.drawText('Scheda Fornitori Condominio', {
    color: rgb(0.06, 0.2, 0.18),
    font: helveticaBold,
    size: 20,
    x: margin,
    y: pageHeight - margin - 4,
  })

  const nomeCondominio = condominio.nomeCondominio || `Condominio #${condominio.id}`

  page.drawText(nomeCondominio, {
    color: rgb(0.2, 0.3, 0.27),
    font: helvetica,
    size: 11,
    x: margin,
    y: pageHeight - margin - 24,
  })

  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo-pr.jpeg')
    const logoBytes = await readFile(logoPath)
    const logoImage = await pdf.embedJpg(logoBytes)
    const maxLogoWidth = 120
    const maxLogoHeight = 30
    const scaled = logoImage.scale(1)
    const ratio = Math.min(maxLogoWidth / scaled.width, maxLogoHeight / scaled.height)
    const logoWidth = scaled.width * ratio
    const logoHeight = scaled.height * ratio

    page.drawImage(logoImage, {
      height: logoHeight,
      width: logoWidth,
      x: pageWidth - margin - logoWidth,
      y: pageHeight - margin - 22,
    })
  } catch {}

  const columns = 2
  const cardGapX = 14
  const cardGapY = 12
  const cardWidth = (pageWidth - margin * 2 - cardGapX) / columns
  const startY = pageHeight - margin - 54
  const maxCards = 8
  const shown = fornitori.slice(0, maxCards)
  const qrSize = 68
  const cardPadding = 12
  const nameFontSize = 11
  const nameLineHeight = 13
  const contentGap = 10
  const textColumnWidth = cardWidth - cardPadding * 2 - qrSize - contentGap
  const nameLinesList = shown.map((fornitore) =>
    wrapText(fornitore.nomeAzienda || `Fornitore #${fornitore.id}`, helveticaBold, nameFontSize, textColumnWidth, 3),
  )
  const maxNameLines = Math.max(...nameLinesList.map((lines) => lines.length), 1)
  const cardHeight = Math.max(108, 92 + (maxNameLines - 1) * nameLineHeight)

  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

  for (let index = 0; index < shown.length; index += 1) {
    const fornitore = shown[index]
    const col = index % columns
    const row = Math.floor(index / columns)
    const x = margin + col * (cardWidth + cardGapX)
    const y = startY - row * (cardHeight + cardGapY) - cardHeight
    const supplierType = fornitore.type || 'Tipo non disponibile'
    const style = getTypeStyle(fornitore.type)

    page.drawRectangle({
      color: rgb(0.93, 0.96, 0.95),
      height: cardHeight,
      width: cardWidth,
      x: x + 1.2,
      y: y - 1.2,
    })

    page.drawRectangle({
      borderColor: rgb(0.83, 0.9, 0.88),
      borderWidth: 1,
      color: rgb(1, 1, 1),
      height: cardHeight,
      width: cardWidth,
      x,
      y,
    })

    page.drawRectangle({
      color: toRgb(style.accent),
      height: cardHeight,
      width: 3.5,
      x,
      y,
    })

    const contentTop = y + cardHeight - cardPadding
    const iconCenterX = x + cardPadding + 10
    const iconCenterY = contentTop - 10

    page.drawCircle({
      color: toRgb(style.iconBg),
      size: 10,
      x: iconCenterX,
      y: iconCenterY,
    })

    drawTypeIcon(page, fornitore.type, iconCenterX, iconCenterY, toRgb(style.icon))

    const nameX = x + cardPadding + 24
    const nameLines = nameLinesList[index]

    nameLines.forEach((line, lineIndex) => {
      page.drawText(line, {
        color: rgb(0.11, 0.17, 0.15),
        font: helveticaBold,
        size: nameFontSize,
        x: nameX,
        y: contentTop - 5 - lineIndex * nameLineHeight,
      })
    })

    const chipFontSize = 8.2
    const chipText = truncateText(supplierType, helveticaBold, chipFontSize, textColumnWidth - 10)
    const chipWidth = Math.min(textColumnWidth, helveticaBold.widthOfTextAtSize(chipText, chipFontSize) + 14)
    const chipY = contentTop - 8 - nameLines.length * nameLineHeight - 12

    page.drawRectangle({
      borderColor: toRgb(style.accent),
      borderWidth: 0.7,
      color: toRgb(style.chipBg),
      height: 14,
      width: chipWidth,
      x: nameX,
      y: chipY,
    })

    page.drawText(chipText, {
      color: toRgb(style.chipText),
      font: helveticaBold,
      size: chipFontSize,
      x: nameX + 7,
      y: chipY + 4,
    })

    const qrImageUrl =
      typeof fornitore.qrImage === 'object' &&
      fornitore.qrImage &&
      'url' in fornitore.qrImage &&
      fornitore.qrImage.url
        ? fornitore.qrImage.url
        : null

    const qrX = x + cardWidth - cardPadding - qrSize
    const qrY = y + (cardHeight - qrSize) / 2

    page.drawRectangle({
      borderColor: rgb(0.83, 0.9, 0.88),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 0.98),
      height: qrSize,
      width: qrSize,
      x: qrX,
      y: qrY,
    })

    if (!qrImageUrl) {
      page.drawText('QR', {
        color: rgb(0.38, 0.46, 0.43),
        font: helveticaBold,
        size: 14,
        x: qrX + 22,
        y: qrY + 27,
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
        height: qrSize - 8,
        width: qrSize - 8,
        x: qrX + 4,
        y: qrY + 4,
      })
    } catch {
      page.drawText('QR', {
        color: rgb(0.38, 0.46, 0.43),
        font: helveticaBold,
        size: 14,
        x: qrX + 22,
        y: qrY + 27,
      })
    }
  }

  if (fornitori.length > maxCards) {
    page.drawText(`Mostrati ${maxCards} fornitori su ${fornitori.length}`, {
      color: rgb(0.38, 0.46, 0.43),
      font: helvetica,
      size: 9,
      x: margin,
      y: margin + 4,
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
