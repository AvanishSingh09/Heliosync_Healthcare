import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  FileText,
  Activity,
  FolderOpen,
  ShieldCheck,
  User,
  Users,
  Stethoscope,
  Clock,
  Layers,
  HeartPulse,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getPatientSections = (): NavSection[] => [
    {
      items: [
        {
          label: 'Dashboard',
          path: '/patient/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'APPOINTMENTS',
      items: [
        {
          label: 'Find & Book Doctor',
          path: '/patient/doctors',
          icon: <Stethoscope className="w-4 h-4" />,
        },
        {
          label: 'My Appointments',
          path: '/patient/appointments',
          icon: <Calendar className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'HEALTH RECORDS',
      items: [
        {
          label: 'Medical Timeline',
          path: '/patient/timeline',
          icon: <Layers className="w-4 h-4" />,
        },
        {
          label: 'Prescriptions',
          path: '/patient/prescriptions',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: 'Vitals & Biomarkers',
          path: '/patient/vitals',
          icon: <Activity className="w-4 h-4" />,
        },
        {
          label: 'Reports & Documents',
          path: '/patient/documents',
          icon: <FolderOpen className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'CONSENT & PRIVACY',
      items: [
        {
          label: 'Access Consents',
          path: '/patient/consents',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          badge: 'Live',
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          label: 'Patient Profile',
          path: '/patient/profile',
          icon: <User className="w-4 h-4" />,
        },
      ],
    },
  ];

  const getDoctorSections = (): NavSection[] => [
    {
      items: [
        {
          label: 'Doctor Dashboard',
          path: '/doctor/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'CLINICAL WORKFLOW',
      items: [
        {
          label: "Today's Appointments",
          path: '/doctor/appointments',
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          label: 'Patient Queue',
          path: '/doctor/queue',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          label: 'Patient Records',
          path: '/doctor/patients',
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: 'Prescriptions',
          path: '/doctor/prescriptions',
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
  ];

  const getHospitalSections = (): NavSection[] => [
    {
      items: [
        {
          label: 'Hospital Overview',
          path: '/hospital/dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          label: 'Token Queue',
          path: '/hospital/queue',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          label: 'Doctor Directory',
          path: '/hospital/doctors',
          icon: <Stethoscope className="w-4 h-4" />,
        },
        {
          label: 'Patient Registry',
          path: '/hospital/patients',
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: 'All Appointments',
          path: '/hospital/appointments',
          icon: <Calendar className="w-4 h-4" />,
        },
      ],
    },
  ];

  const sections =
    user?.role === 'PATIENT'
      ? getPatientSections()
      : user?.role === 'DOCTOR'
      ? getDoctorSections()
      : getHospitalSections();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl bg-gradient-to-r from-brand-50 to-medical-50 border border-brand-100/70">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              HELIOSYNC
            </h1>
            <p className="text-[10px] font-medium text-brand-700 tracking-wide">
              Healthcare Platform
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150',
                        isActive
                          ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200/60 shadow-subtle'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Privacy / Consent Badge in Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Patient-Governed Access</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Records are only accessible when patient explicitly grants consent.
          </p>
        </div>
      </div>
    </aside>
  );
};
