# Word to PDF Converter

A modern Next.js application that converts Word documents (.doc, .docx) to PDF files and bundles them into a downloadable ZIP archive.

## Features

- 📄 Upload multiple Word documents at once
- 🔄 Convert Word files to PDF format
- 📦 Download all converted PDFs as a single ZIP file
- 🎨 Beautiful, responsive UI built with Tailwind CSS
- ⚡ Fast and efficient conversion
- 💻 Built with Next.js 15, TypeScript, and modern React

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **mammoth** - Word document processing
- **pdf-lib** - PDF generation
- **jszip** - ZIP file creation
- **lucide-react** - Beautiful icons

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Upload Files**: Click the upload area or drag and drop Word documents (.doc or .docx)
2. **Convert**: Click the "Convert to PDF" button to start the conversion process
3. **Download**: Once conversion is complete, click "Download ZIP" to get all your PDFs
4. **Convert More**: Click "Convert More" to process additional files

## Project Structure

```
word-to-pdf-converter/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts      # API endpoint for file conversion
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main page component
│   └── globals.css           # Global styles
├── public/                   # Static assets
└── package.json
```

## How It Works

1. **File Upload**: Users select Word documents through the file input
2. **Server Processing**: Files are sent to the `/api/convert` endpoint
3. **Text Extraction**: The mammoth library extracts text from Word documents
4. **PDF Generation**: pdf-lib creates PDF documents from the extracted text
5. **ZIP Creation**: All PDFs are bundled into a ZIP file using jszip
6. **Download**: The ZIP file is sent back to the client for download

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

