import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export function SignUpPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim() || !email.trim() || !password) return 'Please fill all required fields.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    if (!terms) return 'You must accept the terms.';
    return null;
  };

  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      // Use Supabase signUp with options.data to include full_name
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      } as any);

      if (error) {
        console.error('Supabase signup error:', error);
        setError(error.message || 'Failed to create account');
        return;
      }

      // data may contain session or user depending on Supabase settings
      // If session exists, redirect. If not, show confirmation message.
      const session = (data as any)?.session ?? null;
      if (session) {
        navigate('/dashboard');
        return;
      }

      setSuccessMessage('Account created. Please check your email to verify your account.');
    } catch (err: any) {
      console.error('Signup exception:', err);
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/6 bg-card p-8 shadow-soft-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink-faint">Get started with Sentinel AI — secure community reporting and insights.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-faint">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-faint">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-faint">Password</label>
            <div className="relative mt-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                required
                className="w-full rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-ink outline-none focus:border-primary/50"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-ink-faint">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-faint">Confirm password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={show ? 'text' : 'password'}
              required
              className="mt-2 w-full rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-ink outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <input id="terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="h-4 w-4 rounded" />
            <label htmlFor="terms" className="text-ink-faint">I agree to the <a className="text-primary" href="#">terms</a></label>
          </div>

          {error && <div className="text-sm text-danger">{error}</div>}
          {successMessage && <div className="text-sm text-success">{successMessage}</div>}

          <button disabled={loading} type="submit" className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-faint">
          Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
