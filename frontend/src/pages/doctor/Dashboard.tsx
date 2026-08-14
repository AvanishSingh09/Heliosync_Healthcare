import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctors';
import { appointmentService } from '../../services/appointments';
import { Appointment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Calendar,
  Clock,
  UserCheck,
  Activity,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const doctorId = user?.doctor?.id;

  const fetchTodayAppointments = async () => {
    if (!doctorId) return;
    setIsLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await doctorService.getDoctorAppointments(doctorId, todayStr);
      if (res.data) setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, [doctorId]);

  const handleStartConsultation = async (appt: Appointment) => {
    try {
      await appointmentService.startConsultation(appt.id);
      navigate(`/doctor/consultation/${appt.id}`);
    } catch (err) {
      console.error('Failed to start consultation', err);
      navigate(`/doctor/consultation/${appt.id}`);
    }
  };

  const todayTotal = appointments.length;
  const waitingPatients = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_QUEUE'
  ).length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Good day, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.doctor?.specialization} • Registration: {user?.doctor?.registrationNumber} •{' '}
            {user?.doctor?.hospital?.name || 'ABC Hospital'}
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-800 font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Patient-Consent Engine Active</span>
        </div>
      </div>

      {/* 4 Clinical Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{todayTotal}</p>
          <span className="text-[11px] text-slate-400 font-medium">Patients on schedule</span>
        </Card>

        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Waiting Patients</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{waitingPatients}</p>
          <span className="text-[11px] text-amber-700 font-medium">Ready for consultation</span>
        </Card>

        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{completedCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Encounters finalized</span>
        </Card>

        <Card className="border border-slate-200/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Consult Fee</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{(completedCount * (user?.doctor?.consultationFee || 800)).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Estimated generated</span>
        </Card>
      </div>

      {/* Today's Queue & Patient Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Today's Consultation Schedule</span>
          </h3>
          <span className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {isLoading ? (
          <LoadingState message="Loading today's clinical schedule..." />
        ) : appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appt) => {
              const isCompleted = appt.status === 'COMPLETED';

              return (
                <Card
                  key={appt.id}
                  hover
                  className="border border-slate-200/80 shadow-subtle p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{appt.appointmentTime}</span>
                      </div>
                      <Badge
                        variant={
                          isCompleted ? 'success' : appt.status === 'IN_QUEUE' ? 'warning' : 'brand'
                        }
                      >
                        {appt.status}
                      </Badge>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                        {appt.patient?.user?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {appt.patient?.user?.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {appt.patient?.gender} • Blood: {appt.patient?.bloodGroup}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 mb-3">
                      <span className="font-semibold text-slate-700">Reason: </span>
                      <span className="line-clamp-2">{appt.reason}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/doctor/patients/${appt.patientId}`)}
                    >
                      View Profile
                    </Button>
                    {!isCompleted ? (
                      <Button
                        variant="teal"
                        size="sm"
                        onClick={() => handleStartConsultation(appt)}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Start Consultation
                      </Button>
                    ) : (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title="No appointments scheduled for today"
            description="You are all caught up. Check upcoming dates or view past consultations."
          />
        )}
      </div>
    </div>
  );
};
