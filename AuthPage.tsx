
import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import SelectField from '../components/ui/SelectField';
import Alert from '../components/ui/Alert';
import PageWrapper from '../components/layout/PageWrapper';
import { ROLES } from '../constants';
import { UserRole } from '../types';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, isLoading: authLoading, currentUser } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SHIPPER);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    setIsLoginMode(mode === 'login');
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [location.search, currentUser, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if(password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    try {
      if (isLoginMode) {
        await login(email, password);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await signup(name, email, password, role);
        setSuccess("Signup successful! Redirecting...");
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const pageTitle = isLoginMode ? "Login to Kargoline" : "Create Kargoline Account";

  return (
    <PageWrapper title={pageTitle}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} />}

        {!isLoginMode && (
          <InputField
            label="Full Name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        )}
        <InputField
          label="Email Address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <InputField
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isLoginMode ? "current-password" : "new-password"}
        />
        {!isLoginMode && (
          <>
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <SelectField
              label="I am a..."
              id="role"
              options={ROLES}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            />
          </>
        )}
        <div>
          <Button type="submit" isLoading={authLoading} fullWidth>
            {isLoginMode ? 'Login' : 'Create Account'}
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError(null);
            setSuccess(null);
            // Update URL without full navigation to reflect mode change
            navigate(`/auth?mode=${!isLoginMode ? 'signup' : 'login'}`, { replace: true });
          }}
          className="font-medium text-kargo-teal hover:text-teal-400"
        >
          {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
      </div>
      {isLoginMode && (
        <div className="mt-4 text-center">
          <Link to="#" className="text-sm text-gray-400 hover:text-kargo-teal">
            Forgot your password? (UI Only)
          </Link>
        </div>
      )}
    </PageWrapper>
  );
};

export default AuthPage;
