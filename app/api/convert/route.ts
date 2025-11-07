import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const libreConvert = promisify(libre.convert);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    console.log('Starting LibreOffice conversion process...');
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
        
        // Read file as buffer
        const arrayBuffer = await file.arrayBuffer();
        const docxBuffer = Buffer.from(arrayBuffer);

        console.log(`Converting ${file.name} with LibreOffice...`);
        
        // Convert using LibreOffice
        // This preserves ALL formatting, images, tables, colors, fonts, etc.
        const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);

        console.log(`Successfully converted ${file.name}`);
        
        // Add PDF to ZIP
        const pdfFileName = file.name.replace(/\.(docx?|DOC|DOCX?)$/i, '.pdf');
        pdfFolder?.file(pdfFileName, pdfBuffer);

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
