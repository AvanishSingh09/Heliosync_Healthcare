import React from 'react';
import { Prescription } from '../../types';
import { Card } from '../ui/Card';
import { FileText, Calendar, Pill, CheckCircle2 } from 'lucide-react';

interface PrescriptionCardProps {
  prescription: Prescription;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription }) => {
  return (
    <Card className="border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Rx Prescription ({prescription.items?.length || 0} Medications)
            </h4>
            <p className="text-xs text-slate-500">
              Prescribed by {prescription.doctor?.user?.name || 'Practitioner'} •{' '}
              {prescription.doctor?.specialization || 'Clinical Specialist'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {new Date(prescription.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Medication Items List */}
      <div className="py-3.5 space-y-2.5">
        {prescription.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/60"
          >
            <div className="flex items-start gap-2.5">
              <Pill className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">{item.medicineName}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    Dosage: {item.dosage}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    Freq: {item.frequency}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    Duration: {item.duration}
                  </span>
                </div>
                {item.instructions && (
                  <p className="text-[11px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item.instructions}
                  </p>
                )}
              </div>
            </div>
            {item.quantity && (
              <span className="px-2 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold whitespace-nowrap">
                Qty: {item.quantity}
              </span>
            )}
          </div>
        ))}
      </div>

      {prescription.notes && (
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50">
          <span className="font-semibold text-amber-900">Physician Notes: </span>
          <span className="text-amber-800">{prescription.notes}</span>
        </div>
      )}
    </Card>
  );
};
