import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await register(form);
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
        <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="premium-card relative p-8 sm:p-10">
          <motion.div variants={fadeUp}>
            <p className="eyebrow mb-4">Get started</p>
            <h1 className="font-display text-display-sm font-extrabold text-foreground">Create account</h1>
            <p className="mt-3 text-sm text-foreground-muted">Join Campus Navigator and start exploring.</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="input-field"
              placeholder="Full name"
            />
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
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="canteenStaff">Canteen Staff</option>
            </select>
            <Button type="submit" className="w-full py-3.5">
              Create account
            </Button>
          </motion.form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-foreground-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent transition-colors hover:text-accent-strong">
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
