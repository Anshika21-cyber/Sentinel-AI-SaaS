import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // redirect handled by auth listener
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/6 bg-card p-8 shadow-soft-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-faint">Sign in to continue to Sentinel AI</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
            <div className="mt-2 flex items-center justify-between text-xs text-ink-faint">
              <Link to="#" className="hover:text-ink">Forgot password?</Link>
            </div>
          </div>

          {error && <div className="text-sm text-danger">{error}</div>}

          <button disabled={loading} type="submit" className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-faint">
          New to Sentinel AI? <Link to="/signup" className="text-primary font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
