import React from 'react';
import { Doctor } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Award, Building2, Calendar, Star, Clock } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  return (
    <Card hover className="flex flex-col justify-between border border-slate-200/80 shadow-subtle group">
      <div>
        {/* Header: Photo & Core Credentials */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
            {doctor.profilePhoto ? (
              <img
                src={doctor.profilePhoto}
                alt={doctor.user.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                {doctor.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Badge variant="brand" size="sm">
                {doctor.specialization}
              </Badge>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>4.9</span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1">{doctor.user.name}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">{doctor.qualification}</p>
          </div>
        </div>

        {/* Experience & Hospital Details */}
        <div className="py-3.5 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>{doctor.experience} Years of Clinical Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-medical-600" />
            <span className="truncate">{doctor.hospital?.name || 'ABC Multispeciality Hospital'}</span>
          </div>
          {doctor.bio && (
            <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 leading-relaxed">
              {doctor.bio}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Fee & Booking CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Fee</span>
          <p className="text-sm font-extrabold text-slate-900">₹{doctor.consultationFee}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onBook(doctor)}
          leftIcon={<Calendar className="w-3.5 h-3.5" />}
        >
          Book Appointment
        </Button>
      </div>
    </Card>
  );
};
