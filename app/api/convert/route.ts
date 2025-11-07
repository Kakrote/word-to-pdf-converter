import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function sanitizeTextForPDF(text: string): string {
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '    ');
  let sanitized = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    if ((code >= 32 && code <= 126) || code === 10) {
      sanitized += char;
      continue;
    }
    if (code >= 128 && code <= 255) {
      sanitized += char;
      continue;
    }
    if ((code >= 0 && code < 32 && code !== 10) || code === 127) {
      continue;
    }
    sanitized += getASCIIEquivalent(char, code);
  }
  return sanitized;
}

function getASCIIEquivalent(char: string, code: number): string {
  const mappings: Array<[number[], string]> = [
    [[0x2018, 0x2019, 0x201A, 0x201B], "'"],
    [[0x201C, 0x201D, 0x201E, 0x201F, 0x00AB, 0x00BB], '"'],
    [[0x2039, 0x203A], "'"],
    [[0x2013, 0x2014, 0x2015, 0x2010, 0x2011], '-'],
    [[0x2026], '...'], [[0x2025], '..'], [[0x2024], '.'],
    [[0x2022], '*'], [[0x25E6], 'o'], [[0x2023, 0x2043], '-'],
    [[0x2192], '->'], [[0x2190], '<-'], [[0x2191], '^'], [[0x2193], 'v'],
    [[0x21D2], '=>'], [[0x21D0], '<='],
    [[0x00D7], 'x'], [[0x00F7], '/'], [[0x00B1], '+/-'], [[0x2213], '-/+'],
    [[0x2248], '~'], [[0x2260], '!='], [[0x2264], '<='], [[0x2265], '>='],
    [[0x221E], 'inf'], [[0x2211], 'sum'], [[0x220F], 'prod'], [[0x222B], 'int'],
    [[0x221A], 'sqrt'], [[0x2202], 'd'], [[0x2206], 'delta'],
    [[0x00A0, 0x2000, 0x2001, 0x2002, 0x2003], ' '],
    [[0x20AC], 'EUR'], [[0x00A3], 'GBP'], [[0x00A5], 'JPY'], [[0x20B9], 'INR'],
    [[0x20BD], 'RUB'], [[0x20A9], 'KRW'], [[0x20AA], 'ILS'],
    [[0x2122], '(TM)'], [[0x00A9], '(C)'], [[0x00AE], '(R)'], [[0x2117], '(P)'],
    [[0x00B0], ' deg'], [[0x2032], "'"], [[0x2033], '"'],
    [[0x00B5], 'u'], [[0x03A9], 'Ohm'], [[0x212B], 'A'],
    [[0x00BC], '1/4'], [[0x00BD], '1/2'], [[0x00BE], '3/4'],
    [[0x2153], '1/3'], [[0x2154], '2/3'], [[0x215B], '1/8'],
    [[0x215C], '3/8'], [[0x215D], '5/8'], [[0x215E], '7/8'],
  ];

  for (const [codes, replacement] of mappings) {
    if (codes.includes(code)) return replacement;
  }

  if (code >= 0x2070 && code <= 0x2079) return String(code - 0x2070);
  if (code === 0x00B9) return '1';
  if (code === 0x00B2) return '2';
  if (code === 0x00B3) return '3';
  if (code >= 0x2080 && code <= 0x2089) return String(code - 0x2080);

  if (code >= 0x0391 && code <= 0x03C9) {
    const greekNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
    if (code >= 0x0391 && code <= 0x03A9) return greekNames[code - 0x0391] || '?';
    if (code >= 0x03B1 && code <= 0x03C9) return greekNames[code - 0x03B1]?.toLowerCase() || '?';
  }

  if (code >= 0x0400 && code <= 0x04FF) return '[Cyrillic]';
  if (code >= 0x0590 && code <= 0x05FF) return '[Hebrew]';
  if (code >= 0x0600 && code <= 0x06FF) return '[Arabic]';
  if (code >= 0x0E00 && code <= 0x0E7F) return '[Thai]';
  if (code >= 0x4E00 && code <= 0x9FFF) return '[CJK]';
  if (code >= 0x3040 && code <= 0x30FF) return '[Japanese]';
  if (code >= 0xAC00 && code <= 0xD7AF) return '[Korean]';
  if (code >= 0x1F300 && code <= 0x1F9FF) return '[Emoji]';

  return '?';
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting conversion process...');
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    console.log(`Received ${files.length} files`);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const zip = new JSZip();
    const pdfFolder = zip.folder('converted-pdfs');
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`Extracting text from ${file.name}...`);
        const result = await mammoth.extractRawText({ buffer });
        let text = sanitizeTextForPDF(result.value);

        if (!text || text.trim().length === 0) {
          console.warn(`Warning: ${file.name} appears to be empty`);
        }

        console.log(`Creating PDF for ${file.name}...`);
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        const margin = 50;
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const maxWidth = pageWidth - (2 * margin);

        const lines: string[] = [];
        const paragraphs = text.split('\n');

        for (const paragraph of paragraphs) {
          if (paragraph.trim() === '') {
            lines.push('');
            continue;
          }

          const words = paragraph.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, fontSize);

            if (width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) lines.push(currentLine);
        }

        let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;

        for (const line of lines) {
          if (yPosition < margin + lineHeight) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });

          yPosition -= lineHeight;
        }

        const pdfBytes = await pdfDoc.save();
        console.log(`Successfully converted ${file.name}`);
        const pdfFileName = file.name.replace(/\.(docx?|DOC|DOCX?)$/i, '.pdf');
        pdfFolder?.file(pdfFileName, pdfBytes);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing file ${file.name}:`, errorMessage, error);
        errors.push(`${file.name}: ${errorMessage}`);
      }
    }

    console.log(`Generating ZIP file with ${files.length - errors.length} successful conversions...`);
    const zipBlob = await zip.generateAsync({ 
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    console.log('ZIP file generated successfully');
    return new NextResponse(Buffer.from(zipBlob), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=converted-pdfs.zip',
        'X-Conversion-Errors': errors.length > 0 ? JSON.stringify(errors) : '',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Conversion error:', errorMessage, error);
    return NextResponse.json({ 
      error: 'Failed to convert files',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
