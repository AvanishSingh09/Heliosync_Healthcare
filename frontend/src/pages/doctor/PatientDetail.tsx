import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ShieldCheck,
  ShieldAlert,
  Layers,
  Activity,
  FileText,
  FolderOpen,
  Calendar,
  User,
  ArrowLeft,
  Check,
  X,
  Plus,
} from 'lucide-react';

export const DoctorPatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'vitals' | 'prescriptions' | 'reports'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await doctorService.getAuthorizedPatientRecords(id);
        if (res.data) {
          setPatientData(res.data);
        }
      } catch (err: any) {
        console.error('Failed to query patient records', err);
        setError(err.response?.data?.message || 'Access denied by patient consent policy.');
        if (err.response?.data?.errors) {
          setPatientData(err.response.data.errors);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [id]);

  if (isLoading) {
    return <LoadingState message="Verifying consent and querying patient records..." />;
  }

  const patient = patientData?.patient;
  const consent = patientData?.activeConsent;
  const data = patientData?.data;
  const isAuthorized = patientData?.authorized !== false;

  const permissions = consent?.permissions || {
    canViewHistory: false,
    canViewVitals: false,
    canViewPrescriptions: false,
    canViewReports: false,
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Dashboard
      </Button>

      {/* Patient Header & Consent Status */}
      <Card className="border border-slate-200 shadow-subtle p-6 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {patient?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900">{patient?.name || 'Patient'}</h1>
                <Badge variant="neutral">{patient?.patientNumber || 'P-00000'}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {patient?.gender || 'N/A'} • Blood Group:{' '}
                <strong className="text-slate-800">{patient?.bloodGroup || 'N/A'}</strong> • Allergies:{' '}
                <strong className="text-rose-600">{patient?.allergies || 'None'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthorized && consent ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Active Consent
                  </span>
                  <span className="text-xs font-bold text-emerald-900">
                    Granted for Consultation
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">
                    Restricted
                  </span>
                  <span className="text-xs font-bold text-rose-900">No Active Consent</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Overview Bar */}
        {consent && (
          <div className="mt-4 pt-4 border-t border-slate-200/70 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Authorized Data Scope:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  permissions.canViewHistory
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400 line-through'
                }`}
              >
                {permissions.canViewHistory ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Consultations
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  permissions.canViewVitals
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400 line-through'
                }`}
              >
                {permissions.canViewVitals ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Vitals
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  permissions.canViewPrescriptions
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400 line-through'
                }`}
              >
                {permissions.canViewPrescriptions ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                Prescriptions
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  permissions.canViewReports
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400 line-through'
                }`}
              >
                {permissions.canViewReports ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Lab Reports
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Demographics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Consultation History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vitals')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'vitals'
              ? 'bg-white text-slate-900 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Biomarkers & Vitals
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'prescriptions'
              ? 'bg-white text-slate-900 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Medication History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeTab === 'reports'
              ? 'bg-white text-slate-900 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Lab Reports
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 mb-3 border-b border-slate-100">
                Contact & Emergency
              </h3>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="font-semibold">{patient?.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="font-semibold">{patient?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Address</span>
                  <span className="font-semibold">{patient?.address || 'New Delhi, India'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold">{patient?.emergencyContact || 'Sunita Kumar'}</span>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 mb-3 border-b border-slate-100">
                Clinical Summary
              </h3>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Known Allergies</span>
                  <span className="font-bold text-rose-600">{patient?.allergies || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Consultations</span>
                  <span className="font-semibold">{data?.encounters?.length || 0} recorded</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Prescription Orders</span>
                  <span className="font-semibold">{data?.prescriptions?.length || 0} issued</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {permissions.canViewHistory ? (
              data?.encounters?.length > 0 ? (
                <div className="space-y-3">
                  {data.encounters.map((enc: any) => (
                    <Card key={enc.id} className="border border-slate-200 p-4">
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">{enc.chiefComplaint}</span>
                        <span className="text-slate-400">
                          {new Date(enc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded w-fit text-xs mb-2">
                        Diagnosis: {enc.diagnosis}
                      </p>
                      {enc.clinicalNotes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-2">
                          {enc.clinicalNotes}
                        </p>
                      )}
                      {enc.treatmentPlan && (
                        <p className="text-xs text-slate-600">
                          <strong>Treatment Plan:</strong> {enc.treatmentPlan}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Layers className="w-8 h-8" />}
                  title="No consultations found"
                  description="No historical consultations have been recorded for this patient."
                />
              )
            ) : (
              <EmptyState
                icon={<ShieldAlert className="w-8 h-8 text-rose-500" />}
                title="Consultation History Restricted"
                description="The patient has not granted consent to view their past consultation history."
              />
            )}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div>
            {permissions.canViewVitals ? (
              data?.vitals?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.vitals.map((v: any) => (
                    <Card key={v.id} className="border border-slate-200 p-4">
                      <div className="flex justify-between text-xs text-slate-400 font-medium pb-2 mb-2 border-b border-slate-100">
                        <span>Recorded</span>
                        <span>{new Date(v.recordedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          BP: <strong>{v.bloodPressure || 'N/A'}</strong>
                        </div>
                        <div>
                          HR: <strong>{v.heartRate || 'N/A'} bpm</strong>
                        </div>
                        <div>
                          Temp: <strong>{v.temperature || 'N/A'}°F</strong>
                        </div>
                        <div>
                          SpO2: <strong>{v.spo2 || 'N/A'}%</strong>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Activity className="w-8 h-8" />}
                  title="No vitals recorded"
                  description="No historical vitals have been logged for this patient."
                />
              )
            ) : (
              <EmptyState
                icon={<ShieldAlert className="w-8 h-8 text-rose-500" />}
                title="Vitals Access Restricted"
                description="The patient has not granted consent to view their historical vitals."
              />
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            {permissions.canViewPrescriptions ? (
              data?.prescriptions?.length > 0 ? (
                <div className="space-y-3">
                  {data.prescriptions.map((rx: any) => (
                    <Card key={rx.id} className="border border-slate-200 p-4">
                      <div className="flex justify-between text-xs pb-2 mb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900">
                          Prescription ({rx.items?.length || 0} items)
                        </span>
                        <span className="text-slate-400 font-medium">
                          {new Date(rx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {rx.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex justify-between"
                          >
                            <div>
                              <strong className="text-slate-900">{item.medicineName}</strong>
                              <p className="text-[11px] text-slate-500">
                                {item.dosage} • {item.frequency} • {item.duration}
                              </p>
                            </div>
                            {item.quantity && (
                              <span className="text-slate-600 font-bold">Qty: {item.quantity}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText className="w-8 h-8" />}
                  title="No prescriptions found"
                  description="No historical prescriptions exist for this patient."
                />
              )
            ) : (
              <EmptyState
                icon={<ShieldAlert className="w-8 h-8 text-rose-500" />}
                title="Prescription History Restricted"
                description="The patient has withheld consent for their prescription histories."
              />
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            {permissions.canViewReports ? (
              data?.documents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.documents.map((doc: any) => (
                    <Card key={doc.id} className="border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-6 h-6 text-amber-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{doc.fileName}</h4>
                          <p className="text-[11px] text-slate-500">{doc.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FolderOpen className="w-8 h-8" />}
                  title="No lab reports found"
                  description="No diagnostic reports uploaded."
                />
              )
            ) : (
              <EmptyState
                icon={<ShieldAlert className="w-8 h-8 text-rose-500" />}
                title="Lab Reports Restricted"
                description="The patient has not authorized viewing of their lab reports or diagnostic scans."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
