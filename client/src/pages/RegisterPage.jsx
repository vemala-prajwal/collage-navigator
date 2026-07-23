import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

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
    <Card variant="elevated" hover={false} className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-foreground-muted">Join the Campus Navigator community.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="input-field"
          placeholder="Name"
        />
        <input
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          className="input-field"
          placeholder="Email"
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
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-4 text-sm text-foreground-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Login
        </Link>
      </p>
    </Card>
  );
}
