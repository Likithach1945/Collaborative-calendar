import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertCircle, XCircle, Loader } from 'lucide-react';
import { apiClient as api } from '../api/client';

export default function ICSUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const data = await api.post('/ics/import', formData);
      return data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      setSelectedFile(null);
      // Invalidate events cache to refresh the calendar
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to import ICS file';
      setImportResult({
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: [errorMessage],
      });
    },
  });

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.ics')) {
      setImportResult({
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: ['Please select a valid .ics file'],
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setImportResult({
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: ['File size must be less than 10MB'],
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Import Calendar Events
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Upload an .ics file to import events into your calendar. Recurring events will be expanded and duplicates will be detected.
      </p>

      {/* File Upload Area */}
      {!selectedFile && !importResult && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Drag and drop ICS file or click to browse"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
          <p className="text-base font-medium text-gray-900 mb-2">
            Drop your .ics file here
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or
          </p>
          <button
            type="button"
            onClick={handleBrowseClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Browse for ICS file"
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics,text/calendar"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="ICS file input"
            id="ics-file-input"
          />
          <p className="text-xs text-gray-500 mt-4">
            Maximum file size: 10MB
          </p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !uploadMutation.isPending && !importResult && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Upload selected file"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="Cancel file selection"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="border border-blue-200 rounded-lg p-6 bg-blue-50" role="status" aria-live="polite">
          <div className="flex items-center justify-center space-x-3">
            <Loader className="h-6 w-6 text-blue-600 animate-spin" aria-hidden="true" />
            <p className="text-sm font-medium text-blue-900">
              Importing calendar events...
            </p>
          </div>
        </div>
      )}

      {/* Import Result Summary */}
      {importResult && (
        <div className="space-y-4" role="region" aria-label="Import results">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    {importResult.importedCount}
                  </p>
                  <p className="text-xs text-green-700">
                    Imported
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {importResult.duplicateCount}
                  </p>
                  <p className="text-xs text-yellow-700">
                    Duplicates
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold text-red-900">
                    {importResult.errorCount}
                  </p>
                  <p className="text-xs text-red-700">
                    Errors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Processed */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Total processed:</span>{' '}
              {importResult.importedCount + importResult.duplicateCount + importResult.errorCount} events
            </p>
          </div>

          {/* Error List */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Import Errors
              </h3>
              <ul className="space-y-1" role="list">
                {importResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {importResult.importedCount > 0 && importResult.errorCount === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <CheckCircle className="inline h-4 w-4 mr-2" aria-hidden="true" />
                Successfully imported {importResult.importedCount} event{importResult.importedCount !== 1 ? 's' : ''} into your calendar!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Import another file"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
