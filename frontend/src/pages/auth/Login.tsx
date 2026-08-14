import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { HeartPulse, Lock, Mail, ShieldCheck, Stethoscope, User, Building2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('patient@heliosync.demo');
  const [password, setPassword] = useState<string>('password123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.data) {
        login(res.data.token, res.data.user);
        // Navigate based on user role
        if (res.data.user.role === 'PATIENT') {
          navigate('/patient/dashboard');
        } else if (res.data.user.role === 'DOCTOR') {
          navigate('/doctor/dashboard');
        } else if (res.data.user.role === 'HOSPITAL_ADMIN') {
          navigate('/hospital/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-sm mb-3">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">HELIOSYNC</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Patient-Governed Healthcare Platform & Clinical Workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border border-slate-200 shadow-elevated p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@heliosync.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isLoading}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Sign-in Shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Demo Roles (Preloaded Data)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('patient@heliosync.demo')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  email === 'patient@heliosync.demo'
                    ? 'bg-brand-50 border-brand-300 text-brand-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 mx-auto mb-1 text-brand-600" />
                <span className="text-[11px] block">Patient</span>
                <span className="text-[9px] text-slate-400 block truncate">Rahul Kumar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('doctor@heliosync.demo')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  email === 'doctor@heliosync.demo'
                    ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                <span className="text-[11px] block">Doctor</span>
                <span className="text-[9px] text-slate-400 block truncate">Dr. Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hospital@heliosync.demo')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  email === 'hospital@heliosync.demo'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-[11px] block">Hospital</span>
                <span className="text-[9px] text-slate-400 block truncate">ABC Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
