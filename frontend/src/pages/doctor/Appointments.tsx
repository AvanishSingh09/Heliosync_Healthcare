import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctors';
import { Appointment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar, Clock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  const doctorId = user?.doctor?.id;

  const fetchAppointments = async () => {
    if (!doctorId) return;
    setIsLoading(true);
    try {
      const res = await doctorService.getDoctorAppointments(doctorId, selectedDate);
      if (res.data) setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Consultation Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your daily appointment queue and start consultations with authorized record access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading scheduled appointments..." />
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const isCompleted = appt.status === 'COMPLETED';

            return (
              <Card
                key={appt.id}
                className="border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm border border-sky-200 flex-shrink-0">
                    {appt.patient?.user?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{appt.patient?.user?.name}</h4>
                      <Badge
                        variant={
                          isCompleted ? 'success' : appt.status === 'IN_QUEUE' ? 'warning' : 'brand'
                        }
                        size="sm"
                      >
                        {appt.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reason: <strong className="text-slate-700">{appt.reason}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {appt.appointmentTime}
                    </span>
                  </div>

                  {!isCompleted ? (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => navigate(`/doctor/consultation/${appt.id}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Start Consult
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/doctor/patients/${appt.patientId}`)}
                    >
                      View Record
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No appointments for this date"
          description="Select another date using the date picker above."
        />
      )}
    </div>
  );
};
