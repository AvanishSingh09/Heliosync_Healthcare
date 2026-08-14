import React from 'react';
import { Vitals } from '../../types';
import { Card } from '../ui/Card';
import { Activity, Heart, Thermometer, Wind, Weight } from 'lucide-react';

interface VitalsCardProps {
  vitals: Vitals;
}

export const VitalsCard: React.FC<VitalsCardProps> = ({ vitals }) => {
  return (
    <Card className="border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Biomarker Assessment</span>
        <span className="text-slate-400 font-medium">
          {new Date(vitals.recordedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
        {/* Blood Pressure */}
        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Blood Pressure</p>
            <p className="text-sm font-extrabold text-slate-900">{vitals.bloodPressure || 'N/A'}</p>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Heart Rate</p>
            <p className="text-sm font-extrabold text-slate-900">
              {vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Temperature</p>
            <p className="text-sm font-extrabold text-slate-900">
              {vitals.temperature ? `${vitals.temperature}°F` : 'N/A'}
            </p>
          </div>
        </div>

        {/* SpO2 */}
        <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">SpO2 Oxygen</p>
            <p className="text-sm font-extrabold text-slate-900">
              {vitals.spo2 ? `${vitals.spo2}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Weight */}
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            <Weight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Weight</p>
            <p className="text-sm font-extrabold text-slate-900">
              {vitals.weight ? `${vitals.weight} kg` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
