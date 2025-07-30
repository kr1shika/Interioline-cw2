import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import logo from "../../assets/images/logo.png";
import ChangePasswordModal from "../../components/changePassword";
import Toast from "../../components/toastMessage";
import { useAuth } from "../../provider/authcontext";
import { getCsrfToken } from "../../provider/csrf";
import { sanitizeUserInput } from "../../provider/santization";
import "../style/authComponent.css"; // Import the CSS file

// Password strength calculation
const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (!password) return { score: 0, strength: 'Very Weak', feedback: ['Enter a password'] };

    // Length scoring
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else if (password.length >= 6) score += 10;
    else feedback.push("Use at least 8 characters");

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Add uppercase letters");

    if (/\d/.test(password)) score += 15;
    else feedback.push("Add numbers");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    else feedback.push("Add special characters (!@#$%^&*)");

    // Complexity bonus
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 10;

    // Common pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // repeated characters
    if (/123456|abcdef|qwerty|password/i.test(password)) score -= 15; // common patterns

    let strength = 'Very Weak';
    let color = '#ef4444'; // red

    if (score >= 85) {
        strength = 'Very Strong';
        color = '#22c55e'; // green
    } else if (score >= 70) {
        strength = 'Strong';
        color = '#84cc16'; // lime
    } else if (score >= 50) {
        strength = 'Medium';
        color = '#eab308'; // yellow
    } else if (score >= 30) {
        strength = 'Weak';
        color = '#f97316'; // orange
    }

    return { score: Math.max(0, Math.min(100, score)), strength, feedback, color };
};

export default function AuthPopup({ onClose }) {
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Toast state
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "info"
    });

    const { login } = useAuth();

    // Password strength for signup
    const passwordStrength = !isLogin ? calculatePasswordStrength(password) : null;

    // Show toast message with auto-dismiss
    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    // Handle forgot password click
    const handleForgotPassword = () => {
        setShowChangePassword(true);
    };

    // Handle change password modal close
    const handleChangePasswordClose = () => {
        setShowChangePassword(false);
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const cleanEmail = sanitizeUserInput(email);
            const cleanPassword = sanitizeUserInput(password);
            if (!cleanEmail || !cleanPassword) return showToast("Please fill in all fields", "error");

            setLoading(true);
            const csrfToken = await getCsrfToken();
            const res = await fetch("https://localhost:2005/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", "CSRF-Token": csrfToken },
                credentials: "include",
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.errors?.[0] || "Login failed");

            if (data.message?.includes("OTP sent")) {
                setOtpSent(true);
                showToast(data.message, "info");
            }
        } catch (err) {
            console.error("Login error:", err);
            showToast(err.message || "Login error", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();

        if (!otp || !email) {
            return showToast("Enter the OTP", "error");
        }

        setLoading(true);
        try {
            const csrfToken = await getCsrfToken();

            const res = await fetch("https://localhost:2005/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.errors ? data.errors[0] : "OTP verification failed");
            }

            login(data.user.email, data.user.role, data.user);
            showToast(`Welcome back!`, "success");

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error("OTP verify error:", err);
            showToast(err.message || "An unexpected error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!email || !fullName || !password) {
            return showToast("Please fill in all required fields", "error");
        }
        if (password !== confirmPassword) {
            return showToast("Passwords do not match", "error");
        }
        if (passwordStrength.score < 50) {
            return showToast("Please choose a stronger password", "error");
        }

        setLoading(true);
        try {
            const csrfToken = await getCsrfToken();

            const res = await fetch("https://localhost:2005/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    full_name: fullName.trim(),
                    password,
                    role: "client",
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                showToast("OTP sent to your email. Please verify.", "info");
            } else {
                setPassword("");
                setConfirmPassword("");
            }

            showToast("OTP sent to your email. Please verify.", "info");
            setOtpSent(true);

        } catch (err) {
            console.error("Signup error:", err);
            showToast(err.message || "Signup error", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-overlay">
                <div className="auth-container">
                    {/* Close Button */}
                    <button onClick={onClose} className="close-button">
                        &times;
                    </button>

                    {/* Right Auth Content */}
                    <div className="auth-content">
                        <div className="logo-container">
                            <img src={logo} alt="Logo" className="logo" />
                        </div>

                        {/* Enhanced Toggle Buttons */}
                        <div className="auth-tab-container">
                            <div className="auth-tab-list">
                                <button
                                    className={`auth-tab ${isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Login
                                </button>
                                <button
                                    className={`auth-tab ${!isLogin ? 'auth-tab-active' : 'auth-tab-inactive'}`}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="form-container">
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login"
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -100, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <form onSubmit={handleLogin} className="login-form">
                                            {/* Email Input */}
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter Email"
                                                className="auth-input"
                                                disabled={loading || otpSent}
                                            />

                                            {/* Password Input */}
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter Password"
                                                className="auth-input"
                                                disabled={loading || otpSent}
                                            />

                                            {/* Forgot Password Link */}
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                className="forgot-password-link"
                                                disabled={loading || otpSent}
                                            >
                                                Forgot your password?
                                            </button>

                                            {/* OTP + Buttons */}
                                            {otpSent ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        placeholder="Enter OTP"
                                                        className="auth-input"
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="auth-button auth-button-primary"
                                                        disabled={loading}
                                                        onClick={handleOtpVerify}
                                                    >
                                                        {loading ? "VERIFYING..." : "VERIFY OTP"}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    className="auth-button auth-button-primary login-button"
                                                    disabled={loading}
                                                >
                                                    {loading ? "LOGGING IN..." : "LOGIN"}
                                                </button>
                                            )}
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 100, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <form onSubmit={handleSignup} className="signup-form">
                                            {/* Row 1 */}
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email"
                                                className="auth-input"
                                                disabled={loading}
                                            />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Full Name"
                                                className="auth-input"
                                                disabled={loading}
                                            />

                                            {/* Row 2 */}
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password"
                                                className="auth-input"
                                                disabled={loading}
                                            />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm Password"
                                                className="auth-input"
                                                disabled={loading}
                                            />

                                            {password && (
                                                <div className="password-strength-wrapper">
                                                    <div className="strength-bar-bg">
                                                        <div
                                                            className="strength-bar-fill"
                                                            style={{
                                                                width: `${passwordStrength.score}%`,
                                                                backgroundColor: passwordStrength.color
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="strength-info" style={{ color: passwordStrength.color }}>
                                                        {passwordStrength.strength}
                                                        {passwordStrength.feedback.length > 0 && (
                                                            <div className="strength-feedback">
                                                                {passwordStrength.feedback.slice(0, 2).map((tip, i) => (
                                                                    <div key={i} className="feedback-tip">• {tip}</div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Signup button */}
                                            <button
                                                type="submit"
                                                className="auth-button auth-button-primary signup-button"
                                                disabled={loading || (password && passwordStrength.score < 50)}
                                            >
                                                {loading ? "SIGNING UP..." : "SIGN UP"}
                                            </button>
                                        </form>

                                        {otpSent && (
                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    if (!otp) return showToast("Enter OTP", "error");

                                                    try {
                                                        const csrfToken = await getCsrfToken();

                                                        const res = await fetch("https://localhost:2005/api/auth/verify-registration-otp", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "CSRF-Token": csrfToken,
                                                            },
                                                            credentials: "include",
                                                            body: JSON.stringify({ email, otp }),
                                                        });

                                                        const data = await res.json();
                                                        if (!res.ok) throw new Error(data.error || "OTP verification failed");

                                                        showToast("OTP verified! You can now log in.", "success");
                                                        setIsLogin(true);
                                                        setOtpSent(false);

                                                    } catch (err) {
                                                        console.error("OTP error:", err);
                                                        showToast(err.message || "An unexpected error occurred", "error");
                                                    }
                                                }}
                                                className="otp-form"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="auth-input otp-input"
                                                />
                                                <button
                                                    type="submit"
                                                    className="auth-button auth-button-primary"
                                                >
                                                    VERIFY OTP
                                                </button>
                                            </form>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {toast.show && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Toast message={toast.message} type={toast.type} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={handleChangePasswordClose}
            />
        </>
    );
}