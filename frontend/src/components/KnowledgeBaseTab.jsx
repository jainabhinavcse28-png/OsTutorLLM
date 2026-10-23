import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Search, Folder, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function KnowledgeBaseTab() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDocuments()
      .then(docs => {
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDoc(docs[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter(d => 
    d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.module.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Course Knowledge Base & Materials
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Syllabus-Aligned Course Notes & Documents
        </h2>
        <p className="text-sm text-slate-500">
          Browse the underlying documents ingested into the RAG vector index. These materials form the basis of all AI answers, exam questions, and viva evaluations.
        </p>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 absolute left-3 top-5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search documents by concept, module, or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Two Column Layout: Document List + Document Reader */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Doc List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-xs text-slate-500 p-4">Loading course documents...</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-slate-500 p-4">No matching documents found.</p>
          ) : (
            filtered.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {doc.title}
                    </p>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {doc.module}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Document Viewer (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm min-h-[500px]">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <Folder className="w-3.5 h-3.5" />
                  {selectedDoc.module}
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedDoc.title}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Filename: {selectedDoc.filename}
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed text-xs">
                {selectedDoc.content}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Select a document to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
