import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  BookOpen,
  FileText,
  Search,
  Upload,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Database,
  Sparkles,
} from 'lucide-react';
import { getLegalDocuments, addLegalDocument, LegalDocItem } from '../api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { OfflineNotice } from '../components/OfflineNotice';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<LegalDocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocItem | null>(null);

  // Ingest form state
  const [showIngestForm, setShowIngestForm] = useState(false);
  const [ingestFilename, setIngestFilename] = useState('');
  const [ingestContent, setIngestContent] = useState('');
  const [ingestCategory, setIngestCategory] = useState('acts');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    setBackendOffline(false);
    try {
      const res = await getLegalDocuments(activeCategory === 'all' ? undefined : activeCategory);
      if (res && res.documents) {
        setDocuments(res.documents);
        if (res.documents.length > 0 && !selectedDoc) {
          setSelectedDoc(res.documents[0]);
        }
      }
    } catch (e) {
      setBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeCategory]);

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestFilename.trim() || !ingestContent.trim()) return;

    setIngestStatus('Ingesting and chunking into ChromaDB vector store...');
    try {
      const res = await addLegalDocument(ingestFilename.trim(), ingestContent.trim(), ingestCategory);
      if (res.error) {
        setIngestStatus(`Error: ${res.message}`);
      } else {
        setIngestStatus(`Successfully ingested ${res.chunks_added || 1} chunks into ChromaDB.`);
        setIngestFilename('');
        setIngestContent('');
        setShowIngestForm(false);
        fetchDocs();
      }
    } catch (err) {
      setIngestStatus('Failed to ingest document. Verify FastAPI server.');
    }
  };

  const categories = [
    { id: 'all', label: 'All Indexed Sources' },
    { id: 'acts', label: 'Statutory Acts' },
    { id: 'rules', label: 'Procedural Rules' },
    { id: 'regulations', label: 'Regulations' },
    { id: 'gazette', label: 'Gazette Notifications' },
    { id: 'court_forms', label: 'Court Forms' },
  ];

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.filename.toLowerCase().includes(q) ||
      (doc.category && doc.category.toLowerCase().includes(q))
    );
  });

  return (
    <div id="nyayamithra-documents-page" className="space-y-6 pb-8">
      {/* Top Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="h-5 w-5 text-blue-600" />
            <span>Indian Statutory Repository & Knowledge Base</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Indexed Indian acts, statutes, criminal codes, and gazettes powering the local ChromaDB RAG engine.
          </p>
        </div>

        <button
          type="button"
          id="btn-toggle-ingest"
          onClick={() => setShowIngestForm(!showIngestForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition"
        >
          <Plus className="h-4 w-4 text-blue-400" />
          <span>{showIngestForm ? 'Close Ingest Panel' : 'Ingest New Act / Rule'}</span>
        </button>
      </div>

      {backendOffline && (
        <OfflineNotice
          onRetry={() => fetchDocs()}
          message="FastAPI backend is offline. Local standard Indian legal Acts catalog is displayed."
        />
      )}

      {/* Ingest Form Accordion */}
      {showIngestForm && (
        <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              <span>Ingest Legal Document into ChromaDB</span>
            </h3>
            <p className="text-xs text-slate-500">
              The text will be chunked, embedded, and stored in the persistent ChromaDB collection for RAG retrieval.
            </p>
          </div>

          <form onSubmit={handleIngestSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Filename:</label>
                <input
                  type="text"
                  value={ingestFilename}
                  onChange={(e) => setIngestFilename(e.target.value)}
                  placeholder="e.g. telecom_act_2023.txt"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Legal Category:</label>
                <select
                  value={ingestCategory}
                  onChange={(e) => setIngestCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                >
                  <option value="acts">Statutory Acts</option>
                  <option value="rules">Rules & Procedures</option>
                  <option value="regulations">Regulatory Orders</option>
                  <option value="gazette">Gazette Notifications</option>
                  <option value="court_forms">Court Forms</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document Content (Plain text or Markdown):</label>
              <textarea
                rows={5}
                value={ingestContent}
                onChange={(e) => setIngestContent(e.target.value)}
                placeholder="Paste the full text, sections, or provisions of the Indian statutory act..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">{ingestStatus}</span>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Ingest & Index
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Pills and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full sm:w-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              id={`btn-doc-cat-${c.id}`}
              onClick={() => setActiveCategory(c.id)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition shrink-0 border ${
                activeCategory === c.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search acts, sections..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      {/* Main 2-Column Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document List (Left: 5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading indexed documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              No documents matched your query.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.filename === doc.filename;
              return (
                <div
                  key={doc.filename}
                  id={`doc-card-${doc.filename}`}
                  onClick={() => setSelectedDoc(doc)}
                  className={`rounded-xl border p-4 transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                        {doc.category || 'Statute'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {doc.summary || doc.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
                    <span>{doc.filename}</span>
                    {doc.year && <span>Year: {doc.year}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Document Full Text Viewer (Right: 7 Cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                Document Reader
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {selectedDoc?.title || 'Select a document'}
              </h3>
            </div>
            {selectedDoc && (
              <span className="font-mono text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                {selectedDoc.filename}
              </span>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[500px] text-xs sm:text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
            {selectedDoc?.content || selectedDoc?.summary || 'Select a legal document from the left to view its text.'}
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
