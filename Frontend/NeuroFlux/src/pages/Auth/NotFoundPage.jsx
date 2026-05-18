import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, ArrowLeft } from 'lucide-react';
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-12 text-center shadow-2xl rounded-xl bg-black/30 border border-white/10">
        <div className="mb-8">
          <BrainCircuit className="w-24 h-24 mx-auto text-purple-400 mb-4 drop-shadow-2xl" />
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-sm mx-auto">
            Page not found.
          </p>
        </div>
        <Link to="/dashboard" className="inline-flex">
          <button className="px-12 py-6 text-xl rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-lg transition">
            <ArrowLeft className="w-6 h-6 mr-2 inline" />
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};


export default NotFoundPage;

