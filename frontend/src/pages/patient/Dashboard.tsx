import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  Calendar,
  Layers,
  FileText,
  FolderOpen,
  Activity,
  ShieldCheck,
  Plus,
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointments';
import { patientService } from '../../services/patients';
import { consentService } from '../../services/consent';
import { Appointment, TimelineEvent, Vitals, Consent } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [latestVitals, setLatestVitals] = useState<Vitals | null>(null);
  const [activeConsents, setActiveConsents] = useState<Consent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const patientId = user?.patient?.id;

  useEffect(() => {
    if (!patientId) return;

    const loadDashboardData = async () => {
      try {
        const [apptsRes, timelineRes, vitalsRes, consentsRes] = await Promise.all([
          appointmentService.getAppointments({ limit: 5 }),
          patientService.getTimeline(patientId),
          patientService.getVitals(patientId),
          consentService.getConsents({ patientId }),
        ]);

        if (apptsRes.data) setAppointments(apptsRes.data);
        if (timelineRes.data) setTimeline(timelineRes.data);
        if (vitalsRes.data && vitalsRes.data.length > 0) setLatestVitals(vitalsRes.data[0]);
        if (consentsRes.data) setActiveConsents(consentsRes.data.filter((c) => c.status === 'GRANTED'));
      } catch (err) {
        console.error('Failed to load patient dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [patientId]);

  if (isLoading) {
    return <LoadingState message="Loading your health overview..." />;
  }

  const upcomingAppt = appointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_QUEUE' || a.status === 'IN_CONSULTATION'
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Good day, {user?.name} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Patient ID: <strong className="text-slate-700">{user?.patient?.patientNumber}</strong> • Blood Group:{' '}
            <strong className="text-slate-700">{user?.patient?.bloodGroup}</strong>
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/patient/doctors')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Book Consultation
        </Button>
      </div>

      {/* 4 Health Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Visits</span>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {appointments.filter((a) => a.status === 'CONFIRMED').length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Scheduled with doctors</span>
        </Card>

        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Consultations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {timeline.filter((t) => t.type === 'ENCOUNTER').length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Recorded clinical encounters</span>
        </Card>

        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prescriptions</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {timeline.filter((t) => t.type === 'PRESCRIPTION').length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Active & past prescriptions</span>
        </Card>

        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Consents</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeConsents.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Patient-authorized doctors</span>
        </Card>
      </div>

      {/* Main Grid: Upcoming Appointment & Latest Biomarkers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Upcoming Appointment & Timeline Preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Appointment Card */}
          <Card className="border border-brand-200 bg-gradient-to-br from-brand-50/40 via-white to-white">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Next Upcoming Appointment</span>
              </div>
              {upcomingAppt && <Badge variant="brand">{upcomingAppt.status}</Badge>}
            </div>

            {upcomingAppt ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {upcomingAppt.doctor?.user?.name}
                      </h4>
                      <p className="text-xs text-brand-700 font-semibold">
                        {upcomingAppt.doctor?.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {upcomingAppt.hospital?.name || 'ABC Multispeciality Hospital'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      {new Date(upcomingAppt.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {upcomingAppt.appointmentTime}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    <strong>Reason:</strong> {upcomingAppt.reason}
                  </span>
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3" /> Consent Active
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No upcoming consultations scheduled.{' '}
                <Link to="/patient/doctors" className="font-bold text-brand-600 ml-1">
                  Find a Doctor →
                </Link>
              </div>
            )}
          </Card>

          {/* Recent Medical Timeline Preview */}
          <Card className="border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Recent Longitudinal Timeline</span>
              </div>
              <Link
                to="/patient/timeline"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {timeline.length > 0 ? (
              <div className="space-y-3">
                {timeline.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-subtle text-brand-600">
                        {event.type === 'ENCOUNTER' ? (
                          <Layers className="w-4 h-4" />
                        ) : event.type === 'PRESCRIPTION' ? (
                          <FileText className="w-4 h-4 text-indigo-600" />
                        ) : event.type === 'VITALS' ? (
                          <Activity className="w-4 h-4 text-sky-600" />
                        ) : (
                          <FolderOpen className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{event.title}</p>
                        <p className="text-[11px] text-slate-500">{event.doctor || 'Heliosync Clinical'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">No records available</div>
            )}
          </Card>
        </div>

        {/* Right Side: Latest Biomarkers & Active Consents Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest Vitals Card */}
          <Card className="border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Latest Biomarkers</span>
              </div>
              <Link to="/patient/vitals" className="text-xs font-bold text-sky-600">
                Trends →
              </Link>
            </div>

            {latestVitals ? (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                  <span className="text-[11px] text-slate-500 font-semibold">Blood Pressure</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    {latestVitals.bloodPressure || '120/80'} <span className="text-[10px] font-normal">mmHg</span>
                  </p>
                </div>
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                  <span className="text-[11px] text-slate-500 font-semibold">Heart Rate</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    {latestVitals.heartRate || 72} <span className="text-[10px] font-normal">bpm</span>
                  </p>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-[11px] text-slate-500 font-semibold">Oxygen (SpO2)</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    {latestVitals.spo2 || 99}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[11px] text-slate-500 font-semibold">Weight</span>
                  <p className="text-base font-extrabold text-slate-900 mt-1">
                    {latestVitals.weight || 74} <span className="text-[10px] font-normal">kg</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">No vitals recorded yet</div>
            )}
          </Card>

          {/* Privacy & Active Consents Quick Overview */}
          <Card className="border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Patient-Governed Access</span>
              </div>
              <Link to="/patient/consents" className="text-xs font-bold text-emerald-700">
                Manage Access →
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                You have active consent shared with{' '}
                <strong className="text-slate-900">{activeConsents.length} medical provider(s)</strong>.
                You can revoke access at any time with instantaneous effect.
              </p>

              {activeConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">{consent.doctor?.user?.name}</span>
                  </div>
                  <Badge variant="success" size="sm">
                    Authorized
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
