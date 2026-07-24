import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.08, 0.05)}
        className="relative w-full max-w-md"
      >
        <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-accent/10 blur-3xl dark:bg-accent/[0.04] dark:blur-[80px]" aria-hidden="true" />
        <div className="premium-card relative p-8 sm:p-10">
          <motion.div variants={fadeUp}>
            <p className="eyebrow mb-4">Welcome back</p>
            <h1 className="font-display text-display-sm font-extrabold text-foreground">Sign in</h1>
            <p className="mt-3 text-sm text-foreground-muted">Continue navigating campus with your account.</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="input-field"
              placeholder="Email address"
              type="email"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="input-field"
              placeholder="Password"
            />
            <Button type="submit" className="w-full py-3.5">
              Sign in
            </Button>
          </motion.form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-foreground-muted">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-accent transition-colors hover:text-accent-strong">
              Create one
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
