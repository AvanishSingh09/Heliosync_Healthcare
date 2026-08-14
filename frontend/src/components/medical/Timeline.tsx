import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  Layers,
  FileText,
  Activity,
  FolderOpen,
  Calendar,
  User,
  Building2,
  Stethoscope,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'ENCOUNTER':
        return <Layers className="w-4 h-4 text-emerald-600" />;
      case 'PRESCRIPTION':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'VITALS':
        return <Activity className="w-4 h-4 text-sky-600" />;
      case 'DOCUMENT':
        return <FolderOpen className="w-4 h-4 text-amber-600" />;
    }
  };

  const getEventBadge = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'ENCOUNTER':
        return <Badge variant="success">Consultation</Badge>;
      case 'PRESCRIPTION':
        return <Badge variant="purple">Prescription</Badge>;
      case 'VITALS':
        return <Badge variant="info">Vitals Recorded</Badge>;
      case 'DOCUMENT':
        return <Badge variant="warning">Lab Report</Badge>;
    }
  };

  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        No medical history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {events.map((event) => {
        const dateFormatted = new Date(event.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const timeFormatted = new Date(event.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all cursor-pointer"
          >
            {/* Timeline bullet dot */}
            <div className="absolute -left-[27px] top-5 w-4 h-4 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-brand-50/50 transition-colors">
                {getEventIcon(event.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {event.title}
                  </h4>
                  {getEventBadge(event.type)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                  {event.doctor && (
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-slate-400" />
                      {event.doctor}
                    </span>
                  )}
                  {event.hospital && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {event.hospital}
                    </span>
                  )}
                  {event.details?.diagnosis && (
                    <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                      Dx: {event.details.diagnosis}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap pl-12 sm:pl-0">
              <Calendar className="w-3 h-3" />
              <span>{dateFormatted}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3 h-3" />
              <span>{timeFormatted}</span>
            </div>
          </div>
        );
      })}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          description={`${new Date(selectedEvent.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} at ${new Date(selectedEvent.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {selectedEvent.doctor && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <User className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-800">{selectedEvent.doctor}</p>
                  <p className="text-slate-500">{selectedEvent.hospital}</p>
                </div>
              </div>
            )}

            {/* Encounter Detail */}
            {selectedEvent.type === 'ENCOUNTER' && (
              <div className="space-y-3 text-xs">
                {selectedEvent.details.diagnosis && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
                    <p className="font-bold text-emerald-900 mb-0.5">Clinical Diagnosis</p>
                    <p className="text-emerald-800">{selectedEvent.details.diagnosis}</p>
                  </div>
                )}
                {selectedEvent.details.symptoms && (
                  <div>
                    <p className="font-bold text-slate-700">Reported Symptoms:</p>
                    <p className="text-slate-600 mt-0.5">{selectedEvent.details.symptoms}</p>
                  </div>
                )}
                {selectedEvent.details.clinicalNotes && (
                  <div>
                    <p className="font-bold text-slate-700">Clinical Notes:</p>
                    <p className="text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedEvent.details.clinicalNotes}
                    </p>
                  </div>
                )}
                {selectedEvent.details.treatmentPlan && (
                  <div>
                    <p className="font-bold text-slate-700">Treatment & Action Plan:</p>
                    <p className="text-slate-600 mt-0.5">{selectedEvent.details.treatmentPlan}</p>
                  </div>
                )}
                {selectedEvent.details.followUpDate && (
                  <div className="flex items-center gap-2 text-brand-700 font-semibold pt-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Follow-up scheduled:{' '}
                      {new Date(selectedEvent.details.followUpDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Prescription Detail */}
            {selectedEvent.type === 'PRESCRIPTION' && (
              <div className="space-y-3">
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  {selectedEvent.details.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{item.medicineName}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {item.dosage} • {item.frequency} • {item.duration}
                        </p>
                        {item.instructions && (
                          <p className="text-[11px] text-brand-700 mt-0.5 font-medium">
                            Note: {item.instructions}
                          </p>
                        )}
                      </div>
                      {item.quantity && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          Qty: {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {selectedEvent.details.notes && (
                  <p className="text-xs text-slate-600 italic">
                    Doctor's Advice: {selectedEvent.details.notes}
                  </p>
                )}
              </div>
            )}

            {/* Vitals Detail */}
            {selectedEvent.type === 'VITALS' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {selectedEvent.details.bloodPressure && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium">Blood Pressure</span>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedEvent.details.bloodPressure} <span className="text-xs font-normal">mmHg</span>
                    </p>
                  </div>
                )}
                {selectedEvent.details.heartRate && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium">Heart Rate</span>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedEvent.details.heartRate} <span className="text-xs font-normal">bpm</span>
                    </p>
                  </div>
                )}
                {selectedEvent.details.temperature && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium">Temperature</span>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedEvent.details.temperature}°F
                    </p>
                  </div>
                )}
                {selectedEvent.details.spo2 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium">SpO2 Oxygen</span>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedEvent.details.spo2}%
                    </p>
                  </div>
                )}
                {selectedEvent.details.weight && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium">Weight</span>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedEvent.details.weight} <span className="text-xs font-normal">kg</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Document Detail */}
            {selectedEvent.type === 'DOCUMENT' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-8 h-8 text-amber-600" />
                    <div>
                      <p className="font-bold text-slate-900">{selectedEvent.details.fileName}</p>
                      <p className="text-[11px] text-slate-500">
                        Uploaded by {selectedEvent.details.uploadedBy}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedEvent.details.description && (
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedEvent.details.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
