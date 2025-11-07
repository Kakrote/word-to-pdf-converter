'use client';

import { useState } from 'react';
import { Upload, Download, FileText, Loader2, CheckCircle2, XCircle, Folder } from 'lucide-react';

interface FileStatus {
  name: string;
  status: 'pending' | 'converting' | 'success' | 'error';
  error?: string;
  path?: string;
}

// Configuration
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB per file
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500 MB total
const MAX_FILES = 100; // Maximum number of files

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const wordFiles = selectedFiles.filter(
        file => file.name.endsWith('.docx') || file.name.endsWith('.doc') || 
               file.name.endsWith('.DOCX') || file.name.endsWith('.DOC')
      );
      
      // Validate file count
      if (wordFiles.length > MAX_FILES) {
        alert(`Too many files! Please select maximum ${MAX_FILES} files at once.`);
        return;
      }
      
      // Validate individual file sizes and total size
      let totalSize = 0;
      const oversizedFiles: string[] = [];
      
      for (const file of wordFiles) {
        if (file.size > MAX_FILE_SIZE) {
          oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        }
        totalSize += file.size;
      }
      
      if (oversizedFiles.length > 0) {
        alert(`The following files are too large (max 500 MB per file):\n${oversizedFiles.join('\n')}`);
        return;
      }
      
      if (totalSize > MAX_TOTAL_SIZE) {
        alert(`Total file size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds limit of 500 MB. Please select fewer or smaller files.`);
        return;
      }
      
      // Extract folder name from file path
      if (wordFiles.length > 0 && wordFiles[0].webkitRelativePath) {
        const pathParts = wordFiles[0].webkitRelativePath.split('/');
        if (pathParts.length > 1) {
          setFolderName(pathParts[0]);
        } else {
          setFolderName('');
        }
      } else {
        setFolderName('');
      }
      
      setFiles(wordFiles);
      setFileStatuses(
        wordFiles.map(file => ({
          name: file.name,
          status: 'pending',
          path: file.webkitRelativePath || file.name
        }))
      );
      setDownloadUrl(null);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(errorData.details || errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Check for partial errors in headers
      const errorHeader = response.headers.get('X-Conversion-Errors');
      if (errorHeader) {
        const errors = JSON.parse(errorHeader);
        console.warn('Some files failed to convert:', errors);
        
        // Mark individual files as error/success
        setFileStatuses(prev =>
          prev.map(file => {
            const hasError = errors.some((err: string) => err.startsWith(file.name));
            return { 
              ...file, 
              status: hasError ? 'error' : 'success',
              error: hasError ? 'Conversion failed' : undefined
            };
          })
        );
      } else {
        setFileStatuses(prev =>
          prev.map(file => ({ ...file, status: 'success' }))
        );
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
      alert(`Conversion error: ${errorMessage}`);
      setFileStatuses(prev =>
        prev.map(file => ({ ...file, status: 'error', error: errorMessage }))
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'converted-pdfs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setFileStatuses([]);
    setDownloadUrl(null);
    setFolderName('');
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Word to PDF Converter
            </h1>
            <p className="text-lg text-gray-600">
              Upload a folder or multiple Word documents and convert them to PDF instantly
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload folder or files</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Select a folder or multiple Word documents (.doc, .docx)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max 500 MB per file • 500 MB total • Up to 100 files
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  /* @ts-ignore */
                  webkitdirectory=""
                  directory=""
                  mozdirectory=""
                  accept=".doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isConverting}
                />
              </label>
              <div className="mt-3 text-center">
                <button
                  onClick={() => {
                    const input = document.getElementById('file-upload') as HTMLInputElement;
                    if (input) {
                      input.removeAttribute('webkitdirectory');
                      input.removeAttribute('directory');
                      input.removeAttribute('mozdirectory');
                      input.click();
                      setTimeout(() => {
                        input.setAttribute('webkitdirectory', '');
                        input.setAttribute('directory', '');
                        input.setAttribute('mozdirectory', '');
                      }, 100);
                    }
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={isConverting}
                >
                  Or select individual files
                </button>
              </div>
            </div>

            {/* File List */}
            {fileStatuses.length > 0 && (
              <div className="mb-6">
                {folderName && (
                  <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm text-indigo-700">
                      <span className="font-semibold">Folder:</span> {folderName}
                    </p>
                  </div>
                )}
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Selected Files ({fileStatuses.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fileStatuses.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 truncate block">
                            {file.name}
                          </span>
                          {file.path && file.path !== file.name && (
                            <span className="text-xs text-gray-500 truncate block">
                              {file.path}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 ml-3">
                        {file.status === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {file.status === 'converting' && (
                          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!downloadUrl ? (
                <>
                  <button
                    onClick={handleConvert}
                    disabled={files.length === 0 || isConverting}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        Convert to PDF
                      </>
                    )}
                  </button>
                  {files.length > 0 && (
                    <button
                      onClick={handleReset}
                      disabled={isConverting}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Clear
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download ZIP
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Convert More
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">1.</span>
                <span>Upload an entire folder or select multiple Word documents (.doc or .docx)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">2.</span>
                <span>All Word files will be automatically detected and listed</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">3.</span>
                <span>Click "Convert to PDF" to convert all files at once</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">4.</span>
                <span>Download all converted PDFs as a single ZIP file</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
