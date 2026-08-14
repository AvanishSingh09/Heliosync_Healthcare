import React, { useEffect, useState } from 'react';
import { doctorService } from '../../services/doctors';
import { Doctor } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { Stethoscope, Award, Mail, Phone } from 'lucide-react';

export const HospitalDoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const res = await doctorService.getDoctors();
        if (res.data) setDoctors(res.data);
      } catch (err) {
        console.error('Failed to load doctors', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Hospital Medical Staff Roster
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered consultants, departments, registration IDs, and consultation fees.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading doctor roster..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <Card key={doc.id} className="border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {doc.profilePhoto ? (
                    <img src={doc.profilePhoto} alt={doc.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                      {doc.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{doc.user.name}</h4>
                  <Badge variant="brand" size="sm" className="mt-0.5">
                    {doc.specialization}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p>
                  <strong className="text-slate-700">Reg #:</strong> {doc.registrationNumber}
                </p>
                <p>
                  <strong className="text-slate-700">Experience:</strong> {doc.experience} Years
                </p>
                <p>
                  <strong className="text-slate-700">Consultation Fee:</strong> ₹{doc.consultationFee}
                </p>
                <p className="text-slate-500 flex items-center gap-1.5 pt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {doc.user.email}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
