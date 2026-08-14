import React, { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointments';
import { Appointment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar, Clock, Stethoscope, Building2, ShieldCheck, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getAppointments({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      if (res.data) setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="brand">Confirmed</Badge>;
      case 'IN_QUEUE':
        return <Badge variant="info">In Queue</Badge>;
      case 'IN_CONSULTATION':
        return <Badge variant="warning">In Consultation</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled visits, clinical consultations, and granted record consents.
          </p>
        </div>
        <Link to="/patient/doctors">
          <Button variant="primary" size="md">
            + Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'CONFIRMED', 'IN_QUEUE', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filterStatus === st
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading your appointments..." />
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card
              key={appt.id}
              className="border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-base flex-shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-slate-900">
                        {appt.doctor?.user?.name}
                      </h4>
                      {getStatusBadge(appt.status)}
                    </div>
                    <p className="text-xs text-brand-700 font-semibold mt-0.5">
                      {appt.doctor?.specialization}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {appt.hospital?.name || 'ABC Multispeciality Hospital'}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>
                      {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200/60">
                    <Clock className="w-3 h-3" />
                    <span>{appt.appointmentTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-700">Reason for visit: </span>
                  <span>{appt.reason}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Consent Linked
                  </Badge>

                  {appt.status === 'CONFIRMED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(appt.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      leftIcon={<Ban className="w-3 h-3" />}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No appointments found"
          description="You don't have any appointments matching this filter."
          action={
            <Link to="/patient/doctors">
              <Button variant="primary" size="md">
                Find a Doctor
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
};
