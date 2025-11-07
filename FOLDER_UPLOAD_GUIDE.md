# 📁 Folder Upload Feature - Quick Guide

## ✨ New Feature: Upload Entire Folders!

Your Word to PDF converter now supports uploading entire folders at once!

## 🚀 How to Use

### Method 1: Upload Entire Folder
1. Click on the upload area
2. Your browser will prompt you to "Select Folder" or "Upload Folder"
3. Choose the folder containing your Word documents
4. All `.doc` and `.docx` files in that folder will be automatically detected
5. Click "Convert to PDF" to convert all files at once
6. Download the ZIP file with all converted PDFs

### Method 2: Upload Individual Files
1. Click the "Or select individual files" button below the upload area
2. Select multiple Word files using Ctrl+Click (Windows) or Cmd+Click (Mac)
3. All selected files will be listed
4. Click "Convert to PDF" to convert all files
5. Download the ZIP file

## 📋 Features

✅ **Folder Upload**
- Upload an entire folder with one click
- All Word files are automatically detected
- Folder name is displayed for reference
- Maintains relative file paths

✅ **Batch Conversion**
- Convert multiple files at once
- Real-time status for each file
- Progress indicators
- Success/error states

✅ **Smart Detection**
- Automatically finds .doc and .docx files
- Case-insensitive (.DOC, .DOCX also work)
- Ignores non-Word files
- Shows file count

✅ **Organized Output**
- All PDFs in a single ZIP file
- Original filenames preserved (with .pdf extension)
- Easy to download and extract

## 🧪 Testing the Folder Feature

### Create a Test Folder
```
my-documents/
├── document1.docx
├── document2.doc
├── report.docx
└── notes.txt (will be ignored)
```

### Steps to Test
1. Create a folder on your computer
2. Add several Word documents to it
3. Go to http://localhost:3000
4. Click the upload area
5. Select your test folder
6. Verify all Word files are listed
7. Click "Convert to PDF"
8. Download and extract the ZIP
9. Check that all PDFs are created

## 💡 Tips

- **Large folders**: Works with folders containing many files
- **Nested folders**: Currently processes files in the selected folder (browser limitation)
- **Mixed content**: Non-Word files are automatically filtered out
- **File limit**: Depends on browser - typically handles 100+ files
- **Path display**: See relative paths for better organization

## 🔧 Browser Support

Different browsers handle folder upload differently:

- **Chrome/Edge**: ✅ Full support - "Upload Folder" option
- **Firefox**: ✅ Supported - May need to enable in settings
- **Safari**: ⚠️ Limited - Use individual file selection
- **Opera**: ✅ Supported

## 📱 Mobile Behavior

On mobile devices:
- Folder upload may not be available (browser limitation)
- Use individual file selection instead
- Select multiple files from your file manager

## ⚠️ Important Notes

1. **Browser Security**: Folder upload is a browser feature and works within browser security restrictions
2. **Relative Paths**: File paths are preserved to show folder structure
3. **Performance**: Converting many large files may take time
4. **Memory**: Very large batches may need browser refresh between conversions

## 🎯 Use Cases

Perfect for:
- Converting entire project documentation folders
- Batch processing reports
- Converting archived documents
- Processing shared drive folders
- Organizing document libraries

## 🐛 Troubleshooting

**Q: Folder upload not working?**
- Try using individual file selection instead
- Check browser compatibility
- Ensure JavaScript is enabled

**Q: Some files not showing?**
- Only .doc and .docx files are processed
- Check file extensions
- Verify files aren't corrupted

**Q: Conversion fails?**
- Try smaller batches
- Check individual files for issues
- Refresh browser and try again

---

Enjoy the new folder upload feature! 🎉
