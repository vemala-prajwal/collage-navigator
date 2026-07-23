import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

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
    <Card variant="elevated" hover={false} className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
      <p className="mt-2 text-sm text-foreground-muted">Sign in to continue navigating campus.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-4 text-sm text-foreground-muted">
        Need an account?{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
