import React from 'react';
import { FileText, Trash2, MoreVertical, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/documents/${document._id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="group bg-dark-800/80 backdrop-blur-xl border border-dark-700/60 rounded-2xl shadow-lg shadow-black/20 p-5 hover:shadow-xl hover:border-dark-600 transition-all duration-300 hover:border-dark-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FileText className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark-100 mb-1 line-clamp-2">
          {document.title}
        </h3>
        <p className="text-sm text-dark-500">
          {formatDate(document.createdAt || document.uploadedAt)}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-4 border-t border-dark-700">
        <button 
          onClick={handleView}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-dark-700 text-dark-200 font-medium hover:bg-emerald-500 hover:text-white transition-all duration-200"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        {document.fileUrl && (
          <a 
            href={document.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;

