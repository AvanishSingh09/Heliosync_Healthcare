import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  Clock,
  FileText,
  Stethoscope,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { doctorService } from '../../services/doctors';
import { appointmentService } from '../../services/appointments';
import { patientService } from '../../services/patients';
import { Doctor, Appointment } from '../../types';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'consent' | 'appointment' | 'prescription' | 'system';
  read: boolean;
  link: string;
}

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    doctors: Doctor[];
    appointments: Appointment[];
    patients: any[];
  }>({ doctors: [], appointments: [], patients: [] });

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Initialize notifications based on role
  useEffect(() => {
    if (!user) return;

    if (user.role === 'PATIENT') {
      setNotifications([
        {
          id: 'n1',
          title: 'Active Consent Granted',
          message: 'Dr. Ankit Sharma has active authorized access to your records.',
          time: '10m ago',
          type: 'consent',
          read: false,
          link: '/patient/consents',
        },
        {
          id: 'n2',
          title: 'Appointment Scheduled',
          message: 'Follow-up Cardiology consultation confirmed.',
          time: '1h ago',
          type: 'appointment',
          read: false,
          link: '/patient/appointments',
        },
        {
          id: 'n3',
          title: 'New Digital Prescription',
          message: 'Telmisartan 40mg issued by Dr. Ankit Sharma.',
          time: '3h ago',
          type: 'prescription',
          read: true,
          link: '/patient/prescriptions',
        },
      ]);
    } else if (user.role === 'DOCTOR') {
      setNotifications([
        {
          id: 'n1',
          title: 'Patient in OPD Queue',
          message: 'Srijan Tripathi is checked in and waiting for consultation.',
          time: '5m ago',
          type: 'appointment',
          read: false,
          link: '/doctor/queue',
        },
        {
          id: 'n2',
          title: 'Consent Access Active',
          message: 'Rahul Kumar granted clinical record access permissions.',
          time: '25m ago',
          type: 'consent',
          read: false,
          link: '/doctor/appointments',
        },
        {
          id: 'n3',
          title: 'Consultation Completed',
          message: 'Clinical encounter & prescription recorded in timeline.',
          time: '2h ago',
          type: 'system',
          read: true,
          link: '/doctor/dashboard',
        },
      ]);
    } else {
      setNotifications([
        {
          id: 'n1',
          title: 'Live OPD Queue Updated',
          message: 'New patient token issued for Cardiology department.',
          time: '2m ago',
          type: 'appointment',
          read: false,
          link: '/hospital/queue',
        },
        {
          id: 'n2',
          title: 'New Patient Registered',
          message: 'Patient profile P-16846 added to registry.',
          time: '15m ago',
          type: 'system',
          read: false,
          link: '/hospital/patients',
        },
      ]);
    }
  }, [user]);

  // Handle Search Input & Live Fetching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ doctors: [], appointments: [], patients: [] });
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.toLowerCase().trim();
        const [docsRes, apptsRes] = await Promise.all([
          doctorService.getDoctors({ search: query }).catch(() => ({ data: [] })),
          appointmentService.getAppointments().catch(() => ({ data: [] })),
        ]);

        const filteredDocs = (docsRes.data || []).filter(
          (d) =>
            d.user?.name.toLowerCase().includes(query) ||
            d.specialization.toLowerCase().includes(query)
        );

        const filteredAppts = (apptsRes.data || []).filter(
          (a) =>
            a.patient?.user?.name.toLowerCase().includes(query) ||
            a.doctor?.user?.name.toLowerCase().includes(query) ||
            a.reason?.toLowerCase().includes(query)
        );

        setSearchResults({
          doctors: filteredDocs.slice(0, 4),
          appointments: filteredAppts.slice(0, 4),
          patients: [],
        });
        setIsSearchOpen(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchOpen(false);
    if (user?.role === 'PATIENT') {
      navigate(`/patient/doctors`);
    } else if (user?.role === 'DOCTOR') {
      navigate(`/doctor/appointments`);
    } else {
      navigate(`/hospital/patients`);
    }
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'PATIENT':
        return { label: 'Patient Portal', variant: 'brand' as const };
      case 'DOCTOR':
        return { label: 'Doctor Workspace', variant: 'info' as const };
      case 'HOSPITAL_ADMIN':
        return { label: 'Hospital Admin', variant: 'purple' as const };
      default:
        return { label: 'Portal', variant: 'neutral' as const };
    }
  };

  const roleInfo = getRoleDisplay();

  const totalResults =
    searchResults.doctors.length + searchResults.appointments.length;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
      {/* Left section: Interactive Search Bar */}
      <div ref={searchRef} className="relative flex items-center gap-4 flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setIsSearchOpen(true);
            }}
            placeholder="Search doctors, appointments, medical records..."
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-elevated overflow-hidden z-50 animate-in fade-in duration-150">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{isSearching ? 'Searching...' : `Search Results (${totalResults})`}</span>
              <span className="text-[10px] text-slate-400 font-normal">Press Enter to view all</span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
              {totalResults === 0 && !isSearching && (
                <div className="py-6 text-center text-slate-400">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}

              {/* Doctors Matches */}
              {searchResults.doctors.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Specialists & Doctors
                  </span>
                  <div className="space-y-1">
                    {searchResults.doctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (user?.role === 'PATIENT') {
                            navigate('/patient/doctors');
                          } else if (user?.role === 'HOSPITAL_ADMIN') {
                            navigate('/hospital/doctors');
                          } else {
                            navigate('/doctor/dashboard');
                          }
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                            <Stethoscope className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{doc.user?.name}</p>
                            <p className="text-[10px] text-slate-500">{doc.specialization} • ₹{doc.consultationFee}</p>
                          </div>
                        </div>
                        <Badge variant="info" size="sm">Doctor</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments Matches */}
              {searchResults.appointments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                    Appointments & Consultations
                  </span>
                  <div className="space-y-1">
                    {searchResults.appointments.map((appt) => (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (user?.role === 'DOCTOR') {
                            navigate(`/doctor/consultation/${appt.id}`);
                          } else if (user?.role === 'PATIENT') {
                            navigate('/patient/appointments');
                          } else {
                            navigate('/hospital/queue');
                          }
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {appt.patient?.user?.name || 'Patient'} with {appt.doctor?.user?.name}
                            </p>
                            <p className="text-[10px] text-slate-500">{appt.appointmentTime} • {appt.reason}</p>
                          </div>
                        </div>
                        <Badge variant="brand" size="sm">{appt.status}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right section: System role status, notifications, profile */}
      <div className="flex items-center gap-3.5">
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant={roleInfo.variant} size="md" className="font-semibold shadow-subtle">
            <ShieldCheck className="w-3.5 h-3.5" />
            {roleInfo.label}
          </Badge>
        </div>

        {/* Notifications Button & Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`relative p-2 rounded-xl transition-all ${
              isNotifOpen
                ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-elevated overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-600 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotifsAsRead}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate(notif.link);
                      }}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !notif.read ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                          notif.type === 'consent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : notif.type === 'prescription'
                            ? 'bg-indigo-100 text-indigo-700'
                            : notif.type === 'appointment'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {notif.type === 'consent' ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : notif.type === 'prescription' ? (
                          <FileText className="w-4 h-4" />
                        ) : notif.type === 'appointment' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    if (user?.role === 'PATIENT') navigate('/patient/dashboard');
                    else if (user?.role === 'DOCTOR') navigate('/doctor/dashboard');
                    else navigate('/hospital/dashboard');
                  }}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 mx-auto"
                >
                  View Activity Dashboard <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shadow-subtle">
            {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
