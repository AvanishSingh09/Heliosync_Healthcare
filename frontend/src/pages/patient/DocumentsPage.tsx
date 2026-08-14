import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patients';
import { documentService } from '../../services/documents';
import { MedicalDocument } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { FolderOpen, Upload, FileText, Calendar, User, Download, Plus } from 'lucide-react';

export const PatientDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('LAB_REPORT');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patientId = user?.patient?.id;

  const fetchDocuments = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const res = await patientService.getDocuments(patientId);
      if (res.data) setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !patientId) {
      setError('Please choose a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('documentType', documentType);
      formData.append('description', description);

      await documentService.uploadDocument(formData);
      setIsUploadOpen(false);
      setFile(null);
      setDescription('');
      fetchDocuments();
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Lab Reports & Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store diagnostic test reports, blood panels, radiology scans, and discharge summaries.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Upload New Document
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your diagnostic documents..." />
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all p-5"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.fileName}</h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      {doc.uploadedBy}
                    </span>
                  </div>
                </div>
                <Badge variant="warning" size="sm">
                  {doc.documentType}
                </Badge>
              </div>

              {doc.description && (
                <p className="py-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                <a
                  href={`/${doc.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> View File
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderOpen className="w-8 h-8" />}
          title="No documents uploaded"
          description="You can upload lab test reports and imaging scans to share with your doctors."
          action={
            <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)}>
              Upload First Document
            </Button>
          }
        />
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Medical Document"
        description="Supported formats: PDF, PNG, JPG, JPEG (Max 15MB)"
        maxWidth="md"
      >
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Document File
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          <Select
            label="Document Category"
            options={[
              { value: 'LAB_REPORT', label: 'Lab Report (Blood, Pathology)' },
              { value: 'IMAGING', label: 'Imaging / Scan (ECG, X-Ray, Echo)' },
              { value: 'PRESCRIPTION', label: 'Previous Prescription Scan' },
              { value: 'MEDICAL_HISTORY', label: 'Historical Hospital Record' },
              { value: 'OTHER', label: 'Other Document' },
            ]}
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Complete Blood Count test performed at ABC Hospital Lab"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isUploading}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
