import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

export async function POST(request: NextRequest) {
  try {
    console.log('Starting conversion process...');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    console.log(`Received ${files.length} files`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
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
        // Extract text from Word document
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        if (!text || text.trim().length === 0) {
          console.warn(`Warning: ${file.name} appears to be empty`);
        }

        console.log(`Creating PDF for ${file.name}...`);

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
        
        console.log(`Successfully converted ${file.name}`);
        
        // Add PDF to ZIP with original filename but .pdf extension
        const pdfFileName = file.name.replace(/\.(docx?|DOC|DOCX?)$/i, '.pdf');
        pdfFolder?.file(pdfFileName, pdfBytes);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing file ${file.name}:`, errorMessage, error);
        errors.push(`${file.name}: ${errorMessage}`);
        // Continue with other files even if one fails
      }
    }

    console.log(`Generating ZIP file with ${files.length - errors.length} successful conversions...`);
    
    // Generate ZIP file
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
    return NextResponse.json(
      { 
        error: 'Failed to convert files',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
