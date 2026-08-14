import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Shield, Check, Lock, Calendar, FileText, Activity, Layers, FolderOpen } from 'lucide-react';
import { Doctor } from '../../types';

export interface ConsentScopeSelection {
  canViewHistory: boolean;
  canViewVitals: boolean;
  canViewPrescriptions: boolean;
  canViewReports: boolean;
  durationDays: number;
}

interface ConsentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onConfirm: (scopes: ConsentScopeSelection) => void;
  isLoading?: boolean;
}

export const ConsentConfigModal: React.FC<ConsentConfigModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onConfirm,
  isLoading = false,
}) => {
  const [scopes, setScopes] = useState<ConsentScopeSelection>({
    canViewHistory: true,
    canViewVitals: true,
    canViewPrescriptions: true,
    canViewReports: true,
    durationDays: 30,
  });

  const toggleScope = (key: keyof Omit<ConsentScopeSelection, 'durationDays'>) => {
    setScopes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllow = () => {
    onConfirm(scopes);
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Record Access Consent"
      description="You control which parts of your health history Dr. Sharma can view."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Doctor Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300">
            {doctor.profilePhoto ? (
              <img src={doctor.profilePhoto} alt={doctor.user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                {doctor.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{doctor.user.name}</h4>
            <p className="text-xs text-brand-700 font-semibold">{doctor.specialization}</p>
            <p className="text-[11px] text-slate-500">{doctor.hospital?.name || 'ABC Multispeciality Hospital'}</p>
          </div>
        </div>

        {/* Purpose Banner */}
        <div className="flex items-center gap-2 p-3 bg-brand-50/70 rounded-xl border border-brand-200/50 text-xs text-brand-900">
          <Shield className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <span>
            <strong>Purpose:</strong> Consultation and clinical diagnosis evaluation.
          </span>
        </div>

        {/* Granular Scope Checkboxes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Select Health Information to Share:
          </label>
          <div className="space-y-2.5">
            {/* Previous Consultations */}
            <div
              onClick={() => toggleScope('canViewHistory')}
              className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewHistory
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Previous Consultations & Diagnoses</p>
                  <p className="text-[11px] text-slate-500">Past doctor notes, clinical findings, and encounter history</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  scopes.canViewHistory ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {scopes.canViewHistory && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Vitals */}
            <div
              onClick={() => toggleScope('canViewVitals')}
              className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewVitals
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Vitals & Biomarkers</p>
                  <p className="text-[11px] text-slate-500">Blood pressure trends, heart rate, temperature, SpO2 records</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  scopes.canViewVitals ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {scopes.canViewVitals && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Prescriptions */}
            <div
              onClick={() => toggleScope('canViewPrescriptions')}
              className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewPrescriptions
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Prescriptions & Active Medications</p>
                  <p className="text-[11px] text-slate-500">Historical medications, dosages, and dosage frequencies</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  scopes.canViewPrescriptions
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {scopes.canViewPrescriptions && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            {/* Lab Reports & Documents */}
            <div
              onClick={() => toggleScope('canViewReports')}
              className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewReports
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Lab Reports & Imaging Documents</p>
                  <p className="text-[11px] text-slate-500">Blood tests (CBC, Lipids), ECG scans, and attached PDFs</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  scopes.canViewReports ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {scopes.canViewReports && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>

        {/* Access Duration Selection */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Access Duration:</span>
          </div>
          <select
            value={scopes.durationDays}
            onChange={(e) => setScopes({ ...scopes, durationDays: parseInt(e.target.value, 10) })}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value={7}>7 Days</option>
            <option value={15}>15 Days</option>
            <option value={30}>30 Days (Recommended)</option>
            <option value={90}>90 Days</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Decline
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAllow}
            isLoading={isLoading}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Allow & Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
};
