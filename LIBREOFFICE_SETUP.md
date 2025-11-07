# LibreOffice Setup Guide

This application uses **LibreOffice** to convert Word documents to PDF with perfect formatting preservation.

## ✨ Features

With LibreOffice conversion, your tool preserves:
- ✅ All images and graphics
- ✅ Tables with borders and colors
- ✅ Fonts, colors, and text formatting
- ✅ Headers, footers, and page numbers
- ✅ Page layouts and margins
- ✅ Special characters (Greek, math symbols, etc.)

## 📋 Prerequisites

**LibreOffice must be installed** on the server where this application runs.

### For Development (Local)

#### Windows:
1. Download LibreOffice: https://www.libreoffice.org/download/download/
2. Install LibreOffice to default location: `C:\Program Files\LibreOffice`
3. Add to PATH (optional): `C:\Program Files\LibreOffice\program`

#### macOS:
```bash
brew install libreoffice
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

#### Linux (CentOS/RHEL):
```bash
sudo yum install libreoffice
```

### For Production

#### Vercel ❌
**Note:** LibreOffice cannot run on Vercel's serverless functions due to size and binary restrictions.

**Alternative hosting options:**
1. **Railway** ✅ (Supports LibreOffice)
2. **Render** ✅ (Supports LibreOffice)
3. **DigitalOcean App Platform** ✅
4. **AWS EC2** ✅
5. **Google Cloud Run** ✅
6. **Heroku** ✅

#### Docker Deployment (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

# Install LibreOffice
RUN apk add --no-cache \
    libreoffice \
    ttf-dejavu \
    fontconfig

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t word-to-pdf-converter .
docker run -p 3000:3000 word-to-pdf-converter
```

## 🔧 Configuration

The application uses the `libreoffice-convert` npm package which automatically detects LibreOffice installation.

### Custom LibreOffice Path

If LibreOffice is installed in a non-standard location, set environment variable:

```bash
# Linux/macOS
export LIBREOFFICE_PATH=/custom/path/to/soffice

# Windows
set LIBREOFFICE_PATH=C:\Custom\Path\LibreOffice\program\soffice.exe
```

## 🧪 Testing

After installing LibreOffice, test the conversion:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Upload a Word document with images and tables

4. Convert and check if all formatting is preserved!

## ⚠️ Troubleshooting

### Error: "LibreOffice not found"

**Solution:**
- Verify LibreOffice is installed: `libreoffice --version`
- Check PATH includes LibreOffice binary
- On Windows, ensure `soffice.exe` is accessible

### Error: "Conversion timeout"

**Solution:**
- Increase timeout in `route.ts`: `export const maxDuration = 300;`
- Check server has enough memory (minimum 512MB recommended)

### Poor PDF quality

**Solution:**
- LibreOffice uses default export settings
- For custom quality, you may need to configure LibreOffice settings

## 📊 Performance

- Small files (<1MB): ~1-2 seconds
- Medium files (1-5MB): ~3-5 seconds
- Large files (5-10MB): ~10-20 seconds

## 🚀 Alternative: Text-Only Conversion

If you cannot install LibreOffice, the app can fall back to text-only conversion:

1. Uncomment the text-only code in `route.ts`
2. Update frontend messages to indicate text-only mode

## 📚 Resources

- LibreOffice: https://www.libreoffice.org/
- libreoffice-convert package: https://www.npmjs.com/package/libreoffice-convert
- Docker Hub - LibreOffice images: https://hub.docker.com/search?q=libreoffice
