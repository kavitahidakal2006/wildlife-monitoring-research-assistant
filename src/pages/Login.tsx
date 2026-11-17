import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Mail, Trees, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ASSET_IMAGES } from '../data/mockData';
import { useResearch } from '../context/ResearchContext';
import { WildlifeImage } from '../components/WildlifeImage';

interface LoginProps {
  initialMode?: 'login' | 'register';
}

export function Login({ initialMode = 'login' }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('s.jenkins@terrawild-research.org');
  const [password, setPassword] = useState('••••••••••••');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, showToast } = useResearch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, mode === 'register' ? name : undefined);
    showToast({
      type: 'success',
      title: mode === 'register' ? 'Researcher account created' : 'Signed in',
      description: 'Welcome back to your wildlife monitoring workspace.',
    });
    navigate('/');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setForgotOpen(false);
      setResetSent(false);
      setResetEmail('');
      showToast({
        type: 'info',
        title: 'Password reset link queued',
        description: 'Check your institutional inbox for recovery instructions.',
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6EF] text-[#202B24]">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12">
        <div className="relative hidden overflow-hidden lg:col-span-6 lg:block">
          <WildlifeImage
            src={ASSET_IMAGES.loginHero}
            alt="Subtropical forest reserve trail at dawn"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#162D20]/90 via-[#162D20]/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-xs font-medium tracking-wide text-[#A6B77A]">
              Western Ghats &amp; Central Highland Transects
            </p>
            <h2 className="mt-2 max-w-md font-display text-2xl font-bold leading-snug text-balance">
              Transforming unorganised camera-trap frames into verifiable ecological observations.
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/80">
              Upload field memory cards, filter empty triggers, verify AI species predictions, and export structured survey summaries.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-6 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244B35] text-white">
                <Trees className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-[#202B24]">
                  Wildlife Monitoring and Research Assistant
                </p>
                <p className="text-xs text-[#788078]">
                  Camera-Trap Analysis Platform
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#202B24] text-balance">
                Understand Wildlife. Simplify Research.
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-[#788078]">
                An intelligent workspace for analysing camera-trap images and discovering wildlife insights.
              </p>
            </div>

            <div className="mt-7 flex rounded-lg bg-[#EAECE2] p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-[#202B24] shadow-sm'
                    : 'text-[#4F574F] hover:text-[#202B24]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                  mode === 'register'
                    ? 'bg-white text-[#202B24] shadow-sm'
                    : 'text-[#4F574F] hover:text-[#202B24]'
                }`}
              >
                Register Researcher
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold text-[#202B24]"
                  >
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <User
                      className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#788078]"
                      aria-hidden="true"
                    />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Aarav Menon"
                      required
                      className="w-full rounded-lg border border-[#D8DDD0] bg-white py-2.5 pr-4 pl-10 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Researcher Email
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#788078]"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@institute.org"
                    required
                    className="w-full rounded-lg border border-[#D8DDD0] bg-white py-2.5 pr-4 pl-10 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-[#202B24]"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs font-medium text-[#244B35] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#788078]"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#D8DDD0] bg-white py-2.5 pr-4 pl-10 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#244B35] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1C3B2A]"
              >
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Researcher Account'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[#788078]">
              {mode === 'login' ? (
                <>
                  New to the survey team?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-semibold text-[#244B35] hover:underline"
                  >
                    Register an account
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-[#244B35] hover:underline"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#202B24]/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-[#E2E5DA] bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-[#202B24]">
              Reset Researcher Password
            </h3>
            <p className="mt-1.5 text-xs text-[#788078]">
              Enter your registered email address to receive password recovery instructions.
            </p>
            {resetSent ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#244B35]/10 p-3 text-xs font-medium text-[#244B35]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Recovery instructions prepared for {resetEmail}.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="s.jenkins@terrawild-research.org"
                  className="w-full rounded-lg border border-[#D8DDD0] px-3.5 py-2 text-sm focus:border-[#244B35] focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="rounded-lg border border-[#D8DDD0] px-4 py-2 text-xs font-medium text-[#202B24]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#244B35] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
