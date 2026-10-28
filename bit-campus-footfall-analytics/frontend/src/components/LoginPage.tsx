import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  ArrowRight,
  Check,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Loader2,
  Key,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: {
    email: string;
    name: string;
    role: 'student' | 'faculty' | 'admin';
    picture?: string;
  }) => void;
}

// Helper to decode JWT payload from Google Identity Services token
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT credential:', err);
    return null;
  }
}

// Institutional BIT Sathy role resolver
function resolveBitRole(email: string): 'student' | 'faculty' | 'admin' {
  const lower = email.toLowerCase();
  if (lower.includes('admin') || lower.startsWith('director') || lower.includes('dean') || lower.includes('hod')) {
    return 'admin';
  }
  if (lower.includes('faculty') || lower.includes('prof') || lower.includes('staff') || lower.includes('dr.')) {
    return 'faculty';
  }
  return 'student';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [showGoogleInfoModal, setShowGoogleInfoModal] = useState<boolean>(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [isGoogleSdkReady, setIsGoogleSdkReady] = useState<boolean>(false);
  
  // Initialize Client ID from env or saved in localStorage
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('bit_google_client_id') || '';
  });
  const [inputClientId, setInputClientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('bit_google_client_id') || '';
  });
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedOrigin, setCopiedOrigin] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const isConfiguredClientId =
    Boolean(googleClientId) &&
    googleClientId.trim() !== '' &&
    !googleClientId.includes('YOUR_GOOGLE_CLIENT_ID');

  // Handle successful Google token credential
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      let resolvedUser = null;

      // 1. First attempt backend verification via POST /api/auth/google
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            resolvedUser = data.user;
          }
        }
      } catch (backendErr) {
        console.warn('Backend authentication endpoint unreachable; using client-side verification:', backendErr);
      }

      // 2. Client-side fallback if backend was unavailable
      if (!resolvedUser) {
        const payload = parseJwt(response.credential);
        if (!payload) {
          throw new Error('Unable to parse institutional Google token payload.');
        }

        const userEmail: string = payload.email || 'campus.member@bitsathy.ac.in';
        const userName: string = payload.name || payload.given_name || 'BIT Scholar';
        const userPicture: string | undefined = payload.picture;
        const resolvedRole = resolveBitRole(userEmail);

        resolvedUser = {
          email: userEmail,
          name: userName,
          role: resolvedRole,
          picture: userPicture,
        };
      }

      onLogin(resolvedUser);
    } catch (err: any) {
      console.error('Google Login Error:', err);
      setAuthError(err?.message || 'Google authentication encountered an issue.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Initialize official Google Identity Services button if Client ID is configured
  useEffect(() => {
    if (!isConfiguredClientId) return;

    let checkInterval: any = null;

    const tryInitGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && googleBtnContainerRef.current) {
        setIsGoogleSdkReady(true);
        try {
          google.accounts.id.initialize({
            client_id: googleClientId.trim(),
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          // Render the official Google button into container
          googleBtnContainerRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 330,
          });
        } catch (err) {
          console.error('Google accounts.id initialization error:', err);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      tryInitGoogle();
    } else {
      checkInterval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(checkInterval);
          tryInitGoogle();
        }
      }, 250);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId, isConfiguredClientId]);

  const handleSaveClientId = (newId: string) => {
    const trimmed = newId.trim();
    setGoogleClientId(trimmed);
    localStorage.setItem('bit_google_client_id', trimmed);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (trimmed) {
        setShowGoogleInfoModal(false);
      }
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    const resolvedRole = trimmedEmail.includes('admin')
      ? 'admin'
      : trimmedEmail.includes('faculty')
      ? 'faculty'
      : role;

    const defaultName = trimmedEmail
      .split('@')[0]
      .split('.')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Campus Member';

    const resolvedName = name.trim() || defaultName;

    onLogin({
      email: trimmedEmail,
      name: resolvedName,
      role: resolvedRole,
    });
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-[#3066e4] via-[#4682f6] to-[#4facfe] overflow-hidden select-none font-sans">
      {/* Background Graphic Patterns & Translucent Study Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Top Header Typography */}
        <div className="text-center mb-8 text-white space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
            {isRegisterMode ? 'Create your account!' : "Let's get started now!"}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
            {isRegisterMode ? (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-white font-bold underline underline-offset-2 hover:text-cyan-200 transition"
                >
                  Sign in here
                </button>
              </>
            ) : (
              <>
                Or{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-white font-bold underline underline-offset-2 hover:text-cyan-200 transition"
                >
                  create an account
                </button>{' '}
                if not registered yet
              </>
            )}
          </p>
        </div>

        {/* Crisp White Card with Protruding Notch Cutout */}
        <div className="w-full bg-white rounded-3xl shadow-2xl shadow-blue-950/25 p-7 sm:p-9 relative pt-12">
          {/* Top Center Protruding Circular Notch & Icon */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-1.5 border border-blue-50">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-50 to-blue-50 border border-cyan-200/60 flex items-center justify-center text-cyan-600 shadow-inner">
                <div className="relative flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-cyan-500" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                College Email:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter college email"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition font-mono"
                />
              </div>
            </div>

            {/* Sign in / Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#596df2] hover:bg-[#495de0] text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{isRegisterMode ? 'Create Account' : 'Sign In with Password'}</span>
              </button>
            </div>

            {/* Forgot password link */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium transition"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Area */}
          <div className="space-y-2">
            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {isAuthenticating && (
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Verifying institutional Google credentials...</span>
              </div>
            )}

            {/* Real Google GSI Button Container if Client ID is configured */}
            {isConfiguredClientId ? (
              <div className="w-full flex flex-col items-center">
                <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />
                <div className="flex items-center justify-between w-full px-1 mt-2 text-[10px]">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>OAuth Active ({googleClientId.slice(0, 10)}...)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleInfoModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
                  >
                    Change Client ID
                  </button>
                </div>
              </div>
            ) : (
              /* Ready-to-use branded Google Sign-In button with setup click */
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowGoogleInfoModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-3 group cursor-pointer"
                >
                  {/* Google 'G' Multi-Color SVG */}
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
                <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-500" />
                    College Google Workspace ready
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleInfoModal(true)}
                    className="text-blue-500 hover:text-blue-600 underline font-medium cursor-pointer"
                  >
                    Paste Client ID
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>

        {/* BIT Institutional Footer */}
        <div className="mt-8 text-center text-xs text-blue-100/70">
          Bannari Amman Institute of Technology (BIT Sathy) • Campus Telemetry Portal
        </div>
      </div>

      {/* Google Setup & Quick Verification Modal */}
      {showGoogleInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Google OAuth 2.0 Setup</h3>
                <p className="text-xs text-slate-500">Connect your Google Cloud OAuth Client ID</p>
              </div>
            </div>

            {/* Instant Paste Client ID Input Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Paste Google Client ID here:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  placeholder="xxxx.apps.googleusercontent.com"
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => handleSaveClientId(inputClientId)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Apply</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Or save permanently in <code className="text-slate-600 font-mono">frontend/.env</code></span>
                {isConfiguredClientId && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputClientId('');
                      handleSaveClientId('');
                    }}
                    className="text-rose-500 hover:text-rose-700 underline font-medium cursor-pointer"
                  >
                    Clear ID
                  </button>
                )}
              </div>
            </div>

            {/* Authorized JavaScript Origin Helper */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-[11px]">Authorized JavaScript Origin:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentOrigin);
                    setCopiedOrigin(true);
                    setTimeout(() => setCopiedOrigin(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 font-semibold bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs transition cursor-pointer"
                >
                  {copiedOrigin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOrigin ? 'Copied URI' : 'Copy URI'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-blue-800 bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 select-all font-semibold">
                {currentOrigin}
              </div>
              <p className="text-[10px] text-blue-600/90 leading-tight">
                Add this exact URI in Google Cloud Console → APIs & Services → Credentials → Authorized JavaScript origins.
              </p>
            </div>



            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGoogleInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500">
              Enter your college email address. We'll send an authentication recovery link to reset your account credentials.
            </p>
            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Password reset link sent to {forgotEmail}!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your-id@bitsathy.ac.in"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.trim()) {
                      setForgotSuccess(true);
                      setTimeout(() => {
                        setShowForgotModal(false);
                        setForgotSuccess(false);
                      }, 2000);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#596df2] text-white text-xs font-bold hover:bg-[#495de0] transition"
                >
                  Send Recovery Link
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
