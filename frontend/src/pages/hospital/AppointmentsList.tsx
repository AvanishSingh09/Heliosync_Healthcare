import React, { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointments';
import { Appointment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { Calendar, Clock, Stethoscope, User } from 'lucide-react';

export const HospitalAppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppts = async () => {
      setIsLoading(true);
      try {
        const res = await appointmentService.getAppointments();
        if (res.data) setAppointments(res.data);
      } catch (err) {
        console.error('Failed to load appointments', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Master Appointments Register
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hospital-wide schedule, statuses, and clinical booking logs.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading master appointments log..." />
      ) : (
        <Card className="border border-slate-200 p-0 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {new Date(a.appointmentDate).toLocaleDateString()}
                      <span className="block text-[10px] text-brand-700">{a.appointmentTime}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {a.patient?.user?.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {a.patient?.patientNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{a.doctor?.user?.name}</td>
                    <td className="py-3 px-4">{a.doctor?.specialization}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{a.reason}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          a.status === 'COMPLETED'
                            ? 'success'
                            : a.status === 'IN_QUEUE'
                            ? 'warning'
                            : a.status === 'CONFIRMED'
                            ? 'brand'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
