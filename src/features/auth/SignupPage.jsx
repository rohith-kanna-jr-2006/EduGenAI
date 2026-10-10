import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, ShieldCheck, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Checkbox } from '../../components/common/Checkbox';

export const SignupPage = () => {
  const { signup } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const strengthColors = ['bg-red-400', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid school or institutional email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service & Privacy Policy';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        district: formData.district || 'Lincoln Public Schools',
      });
      success('Welcome to EduGenAI Studio!');
      navigate('/app/overview');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to create account. Please try again.';
      setErrors({ form: msg });
      notifyError(msg);
    } finally {
      setLoading(false);
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
          Create an Educator Account
        </h2>
        <p className="text-xs text-ink-body mt-1.5">
          Join your school district's collaborative AI visual workspace.
        </p>
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
              label="Full Name"
              required
              placeholder="e.g. Eleanor Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Institutional Email"
              type="email"
              required
              placeholder="name@district.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              helperText="Use your .edu or school district email for automatic group authorization."
            />

            <Input
              label="School or District Name"
              placeholder="e.g. Lincoln Middle School (Optional)"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                iconRight={showPassword ? EyeOff : Eye}
                onIconRightClick={() => setShowPassword(!showPassword)}
              />

              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-ink-muted">Password strength:</span>
                    <span className="font-semibold text-ink-heading">
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-canvas rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-full rounded-full transition-all ${
                          strength >= step ? strengthColors[strength] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              iconRight={showConfirmPassword ? EyeOff : Eye}
              onIconRightClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Terms Checkbox */}
            <div className="pt-1">
              <Checkbox
                checked={formData.agreedToTerms}
                onChange={(val) => setFormData({ ...formData, agreedToTerms: val })}
                label="I accept the Terms of Service & Privacy Policy"
                description="I certify that I am an educator or student authorized to generate classroom learning aids."
              />
              {errors.terms && (
                <p className="text-xs text-status-danger font-medium mt-1">{errors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full shadow-sm mt-2"
              iconRight={ArrowRight}
            >
              Create Account
            </Button>
          </form>

          {/* Compliance notice */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FERPA & COPPA compliant classroom platform</span>
          </div>
        </div>

        {/* Link to login */}
        <p className="text-center text-xs text-ink-body mt-6">
          Already have an educator account?{' '}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
