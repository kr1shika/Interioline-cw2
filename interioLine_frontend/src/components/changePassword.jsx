// components/ChangePasswordModal.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider/authcontext';
import { getCsrfToken } from "../provider/csrf";
import './changepassword.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Change Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);

    const { user } = useAuth();

    // Initialize email from authenticated user
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    // OTP Timer countdown
    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
        } else if (otpTimer === 0 && !canResend) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [otpTimer, canResend]);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);

        const criteriaMet = [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

        if (criteriaMet === 5) return 'strong';
        if (criteriaMet >= 3) return 'medium';
        if (criteriaMet >= 1) return 'weak';
        return 'very-weak';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear previous messages when user starts typing
        setError('');
        setSuccess('');

        // Real-time password strength check
        if (name === 'newPassword') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const requestOTP = async () => {
        if (!formData.email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const csrfToken = await getCsrfToken();

            await axios.post(
                'https://localhost:2005/api/password-change/request-otp',
                { email: formData.email },
                {
                    headers: {
                        "CSRF-Token": csrfToken,
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            );


            setSuccess('OTP sent! Please check your email inbox and spam folder.');
            setStep(2);
            setOtpTimer(300); // 5 minutes
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const csrfToken = await getCsrfToken();

            await axios.post(
                'https://localhost:2005/api/password-change/resend-otp',
                { email: formData.email },
                {
                    headers: {
                        "CSRF-Token": csrfToken
                    },
                    withCredentials: true
                }
            );


            setSuccess('OTP resent! Please check your email.');
            setOtpTimer(300); // 5 minutes
            setCanResend(false);
            setOtpVerified(false); // Reset verification status
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!formData.otp) {
            setError('OTP is required');
            return;
        }

        if (!/^\d{6}$/.test(formData.otp)) {
            setError('OTP must be exactly 6 digits');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const csrfToken = await getCsrfToken();

            await axios.post(
                'https://localhost:2005/api/password-change/verify-otp-only',
                {
                    email: formData.email,
                    otp: formData.otp
                },
                {
                    headers: {
                        "CSRF-Token": csrfToken
                    },
                    withCredentials: true
                }
            );

            setSuccess('OTP verified successfully! Now create your new password.');
            setOtpVerified(true);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (password) => {
        const errors = [];

        if (password.length < 8) {
            errors.push('At least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('One uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('One lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('One number');
        }
        if (!/[@$!%*?&]/.test(password)) {
            errors.push('One special character (@$!%*?&)');
        }

        return errors;
    };

    const changePassword = async () => {
        const { newPassword, confirmPassword } = formData;

        // Validation
        if (!newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            setError(`Password must contain: ${passwordErrors.join(', ')}`);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const csrfToken = await getCsrfToken();

            await axios.post(
                'https://localhost:2005/api/password-change/change-password',
                {
                    email: formData.email,
                    otp: formData.otp,
                    newPassword
                },
                {
                    headers: {
                        "CSRF-Token": csrfToken
                    },
                    withCredentials: true
                }
            );
            setSuccess('Password changed successfully! You can now log in with your new password.');
            setTimeout(() => {
                onClose();
                resetForm();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            email: user?.email || '',
            otp: '',
            newPassword: '',
            confirmPassword: ''
        });
        setError('');
        setSuccess('');
        setOtpTimer(0);
        setCanResend(true);
        setPasswordStrength('');
        setOtpVerified(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'strong': return '#28a745';
            case 'medium': return '#ffc107';
            case 'weak': return '#fd7e14';
            case 'very-weak': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 'strong': return 'Strong password';
            case 'medium': return 'Medium strength';
            case 'weak': return 'Weak password';
            case 'very-weak': return 'Very weak password';
            default: return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="change-password-modal-overlay">
            <div className="change-password-modal" style={{ backgroundColor: '#FCFCEC' }}>
                <div className="modal-header" style={{ color: '#FCFCEC' }}>
                    <h2 style={{ color: "#A75B2A" }}>Change Password</h2>
                    <button
                        className="close-button"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <span className="success-icon">✅</span>
                            {success}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="step-1">
                            <div className="step-indicator">
                                <div className="step active">1</div>
                                <div className="step-line"></div>
                                <div className="step">2</div>
                                <div className="step-line"></div>
                                <div className="step">3</div>
                            </div>

                            <p>We'll send a verification code to your email address for security purposes.</p>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    disabled={loading || !!user?.email}
                                />
                            </div>

                            <button
                                className="primary-button"
                                onClick={requestOTP}
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-2">
                            <div className="step-indicator">
                                <div className="step completed">✓</div>
                                <div className="step-line"></div>
                                <div className="step active">2</div>
                                <div className="step-line"></div>
                                <div className="step">3</div>
                            </div>

                            <h3>Verify OTP</h3>
                            <p>Enter the OTP sent to your email to verify your identity.</p>

                            <div className="form-group">
                                <label htmlFor="otp">OTP Code</label>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    className="otp-input"
                                />

                                <div className="otp-info">
                                    <div className="otp-timer">
                                        {otpTimer > 0 ? (
                                            <span className="timer-active">⏱️ Expires in: {formatTime(otpTimer)}</span>
                                        ) : (
                                            <span className="timer-expired">⚠️ OTP expired</span>
                                        )}
                                    </div>

                                    {canResend && (
                                        <button
                                            className="resend-button"
                                            onClick={resendOTP}
                                            disabled={loading}
                                        >
                                            {loading ? 'Resending...' : 'Resend OTP'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="button-group">
                                <button
                                    className="secondary-button"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    ← Back
                                </button>
                                <button
                                    className="primary-button"
                                    onClick={verifyOTP}
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && otpVerified && (
                        <div className="step-3" style={{ marginTop: '20px' }}>
                            <div className="step-indicator">
                                <div className="step completed">✓</div>
                                <div className="step-line"></div>
                                <div className="step completed">✓</div>
                                <div className="step-line"></div>
                                <div className="step active">3</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                />

                                {formData.newPassword && (
                                    <div className="password-strength">
                                        <div className="strength-bar">
                                            <div
                                                className="strength-fill"
                                                style={{
                                                    width: passwordStrength === 'strong' ? '100%' :
                                                        passwordStrength === 'medium' ? '66%' :
                                                            passwordStrength === 'weak' ? '33%' : '10%',
                                                    backgroundColor: getPasswordStrengthColor()
                                                }}
                                            ></div>
                                        </div>
                                        <span style={{ color: getPasswordStrengthColor(), fontSize: '0.85rem' }}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                )}

                                <div className="password-requirements">
                                    <small>Password must contain:</small>
                                    <ul>
                                        <li className={/^.{8,}$/.test(formData.newPassword) ? 'valid' : ''}>
                                            At least 8 characters
                                        </li>
                                        <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                            One uppercase letter
                                        </li>
                                        <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                                            One lowercase letter
                                        </li>
                                        <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                                            One number
                                        </li>
                                        <li className={/[@$!%*?&]/.test(formData.newPassword) ? 'valid' : ''}>
                                            One special character (@$!%*?&)
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your new password"
                                    className={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'error' : ''}
                                />
                                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                    <small className="error-text">Passwords do not match</small>
                                )}
                            </div>

                            <div className="button-group">
                                <button
                                    className="secondary-button"
                                    onClick={() => setStep(2)}
                                    disabled={loading}
                                >
                                    ← Back
                                </button>
                                <button
                                    className="primary-button"
                                    onClick={changePassword}
                                    disabled={loading}
                                >
                                    {loading ? 'Changing Password...' : 'Change Password'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;