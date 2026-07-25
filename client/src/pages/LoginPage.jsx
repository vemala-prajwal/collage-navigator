import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-background/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Sign in to Campus Navigator</h1>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-0"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-0"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-sm text-foreground-muted">
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
