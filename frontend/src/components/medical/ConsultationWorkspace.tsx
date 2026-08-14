import React, { useState } from 'react';
import { Appointment, Doctor } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  FileText,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Pill,
} from 'lucide-react';
import { encounterService } from '../../services/encounters';

interface ConsultationWorkspaceProps {
  appointment: Appointment;
  authorizedData?: any;
  activeConsent?: any;
  onCompleted: () => void;
}

interface PrescriptionRow {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export const ConsultationWorkspace: React.FC<ConsultationWorkspaceProps> = ({
  appointment,
  authorizedData,
  activeConsent,
  onCompleted,
}) => {
  // Clinical Encounter State
  const [chiefComplaint, setChiefComplaint] = useState(
    appointment.reason || 'Follow-up Evaluation & Routine Review'
  );
  const [symptoms, setSymptoms] = useState('Mild head heaviness, morning fatigue');
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension (Stage 1 controlled)');
  const [clinicalNotes, setClinicalNotes] = useState(
    'Heart sounds normal S1/S2 heard. Regular rate and rhythm. Patient reports compliance with low sodium diet.'
  );
  const [treatmentPlan, setTreatmentPlan] = useState(
    'Continue antihypertensive therapy. Schedule follow-up in 4 weeks.'
  );
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Today's Vitals State
  const [vitals, setVitals] = useState({
    bloodPressure: '124/82',
    heartRate: '76',
    temperature: '98.4',
    spo2: '99',
    respiratoryRate: '16',
    weight: '74.5',
    height: '175',
  });

  // Prescription Items Builder State
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionRow[]>([
    {
      medicineName: 'Telmisartan 40mg',
      dosage: '1 tablet',
      frequency: 'OD (Morning)',
      duration: '30 days',
      instructions: 'Take with or after breakfast',
      quantity: 30,
    },
    {
      medicineName: 'Rosuvastatin 10mg',
      dosage: '1 tablet',
      frequency: 'HS (Bedtime)',
      duration: '30 days',
      instructions: 'Take after dinner',
      quantity: 30,
    },
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState(
    'Maintain daily BP log. Reduce sodium and caffeine intake.'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'vitals' | 'encounters' | 'prescriptions' | 'reports'>('vitals');

  const addPrescriptionItem = () => {
    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '1 tablet',
        frequency: 'OD (Once daily)',
        duration: '15 days',
        instructions: 'Take after meals',
        quantity: 15,
      },
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionRow, value: any) => {
    setPrescriptionItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint || !diagnosis) {
      setError('Chief complaint and diagnosis are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await encounterService.createEncounter({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        chiefComplaint,
        symptoms,
        diagnosis,
        clinicalNotes,
        treatmentPlan,
        followUpDate,
        vitals,
        prescription: {
          notes: prescriptionNotes,
          items: prescriptionItems.filter((item) => item.medicineName.trim() !== ''),
        },
      });

      onCompleted();
    } catch (err: any) {
      console.error('Failed to complete consultation', err);
      setError(err.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setIsLoading(false);
    }
  };

  const permissions = activeConsent?.permissions || {
    canViewHistory: true,
    canViewVitals: true,
    canViewPrescriptions: true,
    canViewReports: true,
  };

  return (
    <div className="space-y-6">
      {/* Patient Header & Consent Bar */}
      <Card className="border border-brand-200/80 bg-gradient-to-r from-emerald-50/60 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
              {appointment.patient?.user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {appointment.patient?.user?.name || 'Rahul Kumar'}
                </h2>
                <Badge variant="brand">{appointment.patient?.patientNumber}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {appointment.patient?.gender} • Blood Group: {appointment.patient?.bloodGroup} • Allergies:{' '}
                <span className="font-semibold text-rose-600">
                  {appointment.patient?.allergies || 'None'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-subtle">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Consent Access</span>
              <p className="text-xs font-bold text-emerald-700">Active & Authorized</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Consent-Governed Medical History */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>Authorized Patient Records</span>
              </div>
              <Badge variant="success" size="sm">
                Patient-Shared
              </Badge>
            </div>

            {/* History Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl my-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveHistoryTab('vitals')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeHistoryTab === 'vitals'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Vitals
              </button>
              <button
                type="button"
                onClick={() => setActiveHistoryTab('encounters')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeHistoryTab === 'encounters'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Consults
              </button>
              <button
                type="button"
                onClick={() => setActiveHistoryTab('prescriptions')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeHistoryTab === 'prescriptions'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Meds
              </button>
              <button
                type="button"
                onClick={() => setActiveHistoryTab('reports')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  activeHistoryTab === 'reports'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Reports
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="max-h-[460px] overflow-y-auto space-y-3 pr-1 text-xs">
              {activeHistoryTab === 'vitals' && (
                <div>
                  {permissions.canViewVitals ? (
                    authorizedData?.data?.vitals?.length > 0 ? (
                      authorizedData.data.vitals.map((v: any) => (
                        <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2">
                          <div className="flex justify-between text-slate-400 font-semibold text-[11px] mb-1.5">
                            <span>Recorded</span>
                            <span>{new Date(v.recordedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-700">
                            <div>
                              BP: <strong className="text-slate-900">{v.bloodPressure || 'N/A'}</strong>
                            </div>
                            <div>
                              HR: <strong className="text-slate-900">{v.heartRate || 'N/A'} bpm</strong>
                            </div>
                            <div>
                              Temp: <strong className="text-slate-900">{v.temperature || 'N/A'}°F</strong>
                            </div>
                            <div>
                              SpO2: <strong className="text-slate-900">{v.spo2 || 'N/A'}%</strong>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-6">No previous vitals found</p>
                    )
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 flex flex-col items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-amber-500" />
                      <span>Vitals access was not authorized by patient</span>
                    </div>
                  )}
                </div>
              )}

              {activeHistoryTab === 'encounters' && (
                <div>
                  {permissions.canViewHistory ? (
                    authorizedData?.data?.encounters?.length > 0 ? (
                      authorizedData.data.encounters.map((enc: any) => (
                        <div key={enc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2">
                          <div className="flex justify-between font-bold text-slate-900 mb-1">
                            <span>{enc.chiefComplaint}</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              {new Date(enc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded w-fit mb-1.5">
                            Dx: {enc.diagnosis}
                          </p>
                          {enc.clinicalNotes && <p className="text-slate-600 text-[11px]">{enc.clinicalNotes}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-6">No previous encounters found</p>
                    )
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 flex flex-col items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-amber-500" />
                      <span>Consultation history not shared by patient</span>
                    </div>
                  )}
                </div>
              )}

              {activeHistoryTab === 'prescriptions' && (
                <div>
                  {permissions.canViewPrescriptions ? (
                    authorizedData?.data?.prescriptions?.length > 0 ? (
                      authorizedData.data.prescriptions.map((rx: any) => (
                        <div key={rx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2">
                          <div className="flex justify-between text-slate-500 text-[11px] mb-2">
                            <span>Prescribed by {rx.doctor?.user?.name}</span>
                            <span>{new Date(rx.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-1">
                            {rx.items?.map((item: any) => (
                              <div key={item.id} className="bg-white p-2 rounded-lg border border-slate-200">
                                <p className="font-bold text-slate-900">{item.medicineName}</p>
                                <p className="text-[11px] text-slate-500">
                                  {item.dosage} • {item.frequency} • {item.duration}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-6">No previous prescriptions</p>
                    )
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 flex flex-col items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-amber-500" />
                      <span>Prescriptions restricted by patient</span>
                    </div>
                  )}
                </div>
              )}

              {activeHistoryTab === 'reports' && (
                <div>
                  {permissions.canViewReports ? (
                    authorizedData?.data?.documents?.length > 0 ? (
                      authorizedData.data.documents.map((doc: any) => (
                        <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 mb-2">
                          <p className="font-bold text-slate-900">{doc.fileName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-6">No lab reports found</p>
                    )
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 flex flex-col items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-amber-500" />
                      <span>Lab reports restricted by patient</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Consultation Recording Form */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleCompleteConsultation} className="space-y-4">
            <Card className="border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <span>Today's Clinical Assessment & Vitals</span>
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Vitals Recording Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <Input
                  label="BP (mmHg)"
                  placeholder="120/80"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                />
                <Input
                  label="Pulse (bpm)"
                  placeholder="72"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                />
                <Input
                  label="Temp (°F)"
                  placeholder="98.6"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                />
                <Input
                  label="SpO2 (%)"
                  placeholder="99"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                />
              </div>

              {/* Chief Complaint & Diagnosis */}
              <div className="space-y-3">
                <Input
                  label="Chief Complaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  required
                />
                <Input
                  label="Reported Symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
                <Input
                  label="Clinical Diagnosis (Primary)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Clinical Examination & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Treatment & Action Plan
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <Input
                    label="Follow-Up Date"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Dynamic Prescription Builder */}
            <Card className="border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>Prescription & Medication Order</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPrescriptionItem}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Medicine
                </Button>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {prescriptionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Telmisartan 40mg)"
                        value={item.medicineName}
                        onChange={(e) => updatePrescriptionItem(idx, 'medicineName', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      {prescriptionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescriptionItem(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1 tab)"
                        value={item.dosage}
                        onChange={(e) => updatePrescriptionItem(idx, 'dosage', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. OD, BID)"
                        value={item.frequency}
                        onChange={(e) => updatePrescriptionItem(idx, 'frequency', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 30 days)"
                        value={item.duration}
                        onChange={(e) => updatePrescriptionItem(idx, 'duration', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <input
                        type="number"
                        placeholder="Qty (e.g. 30)"
                        value={item.quantity}
                        onChange={(e) =>
                          updatePrescriptionItem(idx, 'quantity', parseInt(e.target.value, 10) || 0)
                        }
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Special Instructions (e.g. Take with warm water after food)"
                      value={item.instructions}
                      onChange={(e) => updatePrescriptionItem(idx, 'instructions', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
                    />
                  </div>
                ))}

                <Input
                  label="General Advice / Pharmacist Instructions"
                  placeholder="e.g. Take plenty of rest and hydrate."
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                />
              </div>
            </Card>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                variant="teal"
                size="lg"
                isLoading={isLoading}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Complete Consultation & Issue Prescription
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
