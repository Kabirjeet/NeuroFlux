import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, FileText, Upload, X, Loader2, CloudUpload, File, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../../services/documentService";
import Spinner from "../../../components/common/Spinner";
import Button from "../../../components/common/Button";
import DocumentCard from "../../../components/documents/DocumentCard";


const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // State for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 10MB.");
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await documentService.uploadDocument(formData);
      setUploadProgress(100);
      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async() => {
    if(!selectedDoc) return;
    setDeleting(true);
    try{
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelUpload = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadTitle("");
    setUploadProgress(0);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-dark-100 tracking-tight mb-2">
              My Documents
            </h1>
            <p className="text-dark-400 text-sm">
              Manage and organize your learning materials
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Upload Document
          </Button>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          className={`mb-8 p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-dark-600 bg-dark-800/30 hover:border-dark-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              dragActive ? 'bg-emerald-500/20' : 'bg-dark-700'
            }`}>
              <CloudUpload className={`w-8 h-8 ${dragActive ? 'text-emerald-400' : 'text-dark-400'}`} />
            </div>
            <p className="text-lg font-medium text-dark-100 mb-2">
              {dragActive ? 'Drop your file here' : 'Drag and drop your files here'}
            </p>
            <p className="text-dark-400 text-sm mb-4">
              or click the button below to browse
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Browse Files
            </Button>
            <p className="text-xs text-dark-500 mt-4">
              Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard 
                key={doc._id} 
                document={doc} 
                onDelete={() => handleDeleteRequest(doc)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-dark-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-dark-100 mb-2">No documents yet</h3>
            <p className="text-dark-400 text-center max-w-sm mb-6">
              Upload your first document to start creating flashcards and quizzes powered by AI.
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Your First Document
            </Button>
          </div>
        )}

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md p-6 scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-dark-100">Upload Document</h2>
                <button 
                  onClick={handleCancelUpload}
                  className="p-2 rounded-lg hover:bg-dark-700"
                  disabled={uploading}
                >
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              {/* File Preview */}
              {uploadFile && (
                <div className="mb-6 p-4 rounded-xl bg-dark-900 border border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <File className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-100 truncate">{uploadFile.name}</p>
                      <p className="text-xs text-dark-500">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {!uploading && (
                      <button 
                        onClick={handleCancelUpload}
                        className="p-1.5 rounded-lg hover:bg-dark-700"
                      >
                        <X className="w-4 h-4 text-dark-500" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark-200">Uploading...</span>
                    <span className="text-sm text-dark-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 rounded-xl border border-dark-600 bg-dark-900 text-dark-100 placeholder-dark-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter document title"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="w-full px-4 py-3 rounded-xl border border-dark-600 bg-dark-900 text-dark-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-dark-700 file:text-dark-100 file:font-medium file:cursor-pointer"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={handleCancelUpload}
                    disabled={uploading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={uploading || !uploadFile || !uploadTitle}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md p-6 scale-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-dark-100 mb-2">Delete Document?</h2>
                <p className="text-dark-400 mb-6">
                  Are you sure you want to delete "{selectedDoc?.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentListPage;

