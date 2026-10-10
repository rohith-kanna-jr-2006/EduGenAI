import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Checkbox } from '../../components/common/Checkbox';
import { Modal } from '../../components/common/Modal';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await login(email, password);
      success('Welcome back to EduGenAI Studio!');
      navigate('/app/overview');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setErrors({ form: msg });
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      notifyError('Please enter a valid email address');
      return;
    }
    setForgotLoading(true);
    try {
      await authService.requestPasswordReset(forgotEmail);
      setForgotSuccess(true);
      success('Password reset instructions sent!');
    } catch (err) {
      notifyError('Unable to send reset instructions. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-ink-heading font-heading tracking-tight">
            EduGenAI
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-ink-heading font-heading">
          Educator Sign In
        </h2>
        <p className="text-xs text-ink-body mt-1.5">
          Access your classroom worksheets, model rules, and generation history.
        </p>

        {searchParams.get('expired') && (
          <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
            Your session has expired. Please sign in again.
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-lg border border-border shadow-level-2">
          {errors.form && (
            <div className="mb-5 p-3 rounded-md bg-status-danger-bg border border-status-danger-border text-xs text-status-danger font-medium">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@district.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              iconRight={showPassword ? EyeOff : Eye}
              onIconRightClick={() => setShowPassword(!showPassword)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Checkbox
                checked={rememberMe}
                onChange={setRememberMe}
                label="Remember this computer"
              />
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotSuccess(false);
                }}
                className="text-brand font-medium hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full shadow-sm mt-3"
              iconRight={ArrowRight}
            >
              Sign In to Studio
            </Button>
          </form>

          {/* District Single Sign-On Note */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <div className="text-[11px] text-ink-muted mb-3">
              Institutional District Sign-On
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // Pre-fill demo educator credentials
                setEmail('eleanor.vance@lincoln.edu');
                setPassword('Classroom2026!');
              }}
            >
              Fill Demo District Educator Credentials
            </Button>
          </div>
        </div>

        {/* Link to signup */}
        <p className="text-center text-xs text-ink-body mt-6">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-brand font-semibold hover:underline">
            Create an Educator Account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Educator Password"
        subtitle="Enter your verified school email address to receive recovery steps."
      >
        {forgotSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-ink-heading">Check Your School Inbox</h4>
            <p className="text-xs text-ink-body">
              We have dispatched password reset instructions to <strong>{forgotEmail}</strong>.
            </p>
            <div className="pt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@district.edu"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={forgotLoading}
              >
                Send Instructions
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
