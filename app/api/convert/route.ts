import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    const pdfFolder = zip.folder('converted-pdfs');

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from Word document
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        const margin = 50;

        // Split text into lines that fit the page width
        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
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

          if (currentLine) {
            lines.push(currentLine);
          }
        }

        // Create pages and add text
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
        
        // Add PDF to ZIP with original filename but .pdf extension
        const pdfFileName = file.name.replace(/\.(docx?|DOC|DOCX?)$/i, '.pdf');
        pdfFolder?.file(pdfFileName, pdfBytes);

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'uint8array' });

    return new NextResponse(Buffer.from(zipBlob), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=converted-pdfs.zip',
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert files' },
      { status: 500 }
    );
  }
}
