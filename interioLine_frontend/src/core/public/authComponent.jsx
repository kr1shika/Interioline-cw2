import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import illustration from "../../assets/images/authIllustration.png";
import logo from "../../assets/images/logo.png";
import ChangePasswordModal from "../../components/changePassword"; // Add this import
import Toast from "../../components/toastMessage";
import { useAuth } from "../../provider/authcontext";
import { getCsrfToken } from "../../provider/csrf";
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

export default async function AuthPopup({ onClose }) {
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false); // Add this state

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

        if (!email || !password) {
            return showToast("Please fill in all fields", "error");
        }

        setLoading(true);

        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch("https://localhost:2005/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.errors ? data.errors[0] : "Login failed");
            }

            if (data.message && data.message.includes("OTP sent")) {
                setOtpSent(true);
                showToast(data.message, "info");
            } else if (data.errors && Array.isArray(data.errors)) {
                showToast(data.errors[0], "error");
            } else if (data.message) {
                showToast(data.message, "error");
            } else {
                showToast("Unexpected server response", "error");
            }

        } catch (err) {
            console.error("Login error:", err);
            showToast(err.message || "An unexpected error occurred", "error");
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
                    "CSRF-Token": csrfToken, // ✅ REQUIRED
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

        // Enhanced validation
        if (!email || !fullName || !password) {
            return showToast("Please fill in all required fields", "error");
        }

        if (password !== confirmPassword) {
            return showToast("Passwords do not match", "error");
        }

        // Check password strength
        if (passwordStrength.score < 50) {
            return showToast("Please choose a stronger password", "error");
        }

        setLoading(true);

        try {
            const res = await fetch("https://localhost:2005/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    full_name: fullName.trim(),
                    password,
                    role: "client",
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.errors ? data.errors[0] : "Signup failed");
            }

            showToast("Account created successfully! You can now log in.", "success");

            setTimeout(() => {
                setIsLogin(true);
                setFullName("");
                setPassword("");
                setConfirmPassword("");
            }, 1500);

        } catch (err) {
            console.error("Signup error:", err);
            showToast(err.message || "An unexpected error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", }} className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 px-4">
                <div style={{ padding: "10px" }} className="bg-[#FCFCEC] border border-[#C2805A] rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.3)] w-180 h-120 flex flex-col md:flex-row overflow-hidden relative items-center justify-center">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-black font-bold z-10"
                    >
                        &times;
                    </button>

                    {/* Left Illustration */}
                    <div className="hidden md:flex md:w-[58%] items-center justify-center">
                        <img
                            src={illustration}
                            alt="Background"
                            className="w-200 object-contain"
                            style={{ maxHeight: "510px", marginLeft: "20px", marginRight: "0px" }}
                        />
                    </div>

                    {/* Right Auth Content */}
                    <div className="w-full md:w-[60%] p-8 flex flex-col items-center justify-center">
                        <div className="">
                            <img
                                src={logo}
                                alt="Background"
                                className="w-50 object-contain"
                                style={{ maxHeight: "30px", marginBottom: "5px" }}
                            />
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
                        <div className="w-full max-w-sm min-h-[270px] flex flex-col justify-center items-center">
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login"
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -100, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <form onSubmit={handleLogin} className="flex flex-col gap-2 mt-2">
                                            {/* Email Input */}
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={{ padding: "5px 12px", width: "290px" }}
                                                placeholder="Enter Email"
                                                className="text-[#BE7B5D] rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                disabled={loading || otpSent}
                                            />

                                            {/* Password Input */}
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                style={{ padding: "5px 12px", width: "290px" }}
                                                placeholder="Enter Password"
                                                className="text-[#BE7B5D] rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                disabled={loading || otpSent}
                                            />
                                            {/* Forgot Password Link */}
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                className="text-sm text-[#A75B2A] underline hover:text-[#BE7B5D] mb-2"
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
                                                        style={{ padding: "5px 12px", width: "290px" }}
                                                        placeholder="Enter OTP"
                                                        className="text-[#BE7B5D] rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="bg-[#C2805A] text-white py-2 px-4 rounded-md font-semibold disabled:opacity-50"
                                                        disabled={loading}
                                                        onClick={handleOtpVerify}
                                                    >
                                                        {loading ? "VERIFYING..." : "VERIFY OTP"}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    style={{ padding: "4px 12px", width: "130px" }}
                                                    type="submit"
                                                    className="bg-[#C2805A] text-white py-2 rounded-md font-semibold disabled:opacity-50"
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
                                        <form onSubmit={handleSignup} className="flex flex-col gap-6 justify-center items-center">
                                            <input
                                                style={{ padding: "4px 12px", marginTop: "-40px", width: "305px" }}
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="E-mail"
                                                className="text-[#BE7B5D] p-3 rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                disabled={loading}
                                            />
                                            <input
                                                style={{ padding: "4px 12px", width: "305px" }}
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Full Name"
                                                className="text-[#BE7B5D] p-3 rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                disabled={loading}
                                            />

                                            {/* Password with strength indicator */}
                                            <div className="password-field-container">
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Password"
                                                    className="text-[#BE7B5D] p-3 rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                    style={{ padding: "4px 12px", width: "305px" }}
                                                    disabled={loading}
                                                />

                                                {/* Password Strength Indicator */}
                                                {password && (
                                                    <div className="password-strength-container">
                                                        <div className="strength-bar-bg">
                                                            <div
                                                                className="strength-bar-fill"
                                                                style={{
                                                                    width: `${passwordStrength.score}%`,
                                                                    backgroundColor: passwordStrength.color
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="strength-info">
                                                            <span
                                                                className="strength-label"
                                                                style={{ color: passwordStrength.color }}
                                                            >
                                                                {passwordStrength.strength}
                                                            </span>
                                                            {passwordStrength.feedback.length > 0 && (
                                                                <div className="strength-feedback">
                                                                    {passwordStrength.feedback.slice(0, 2).map((tip, index) => (
                                                                        <span key={index} className="feedback-tip">{tip}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm Password"
                                                className="text-[#BE7B5D] p-3 rounded-md border border-gray-300 bg-[#f7f0e9]"
                                                style={{ padding: "4px 12px", width: "305px" }}
                                                disabled={loading}
                                            />

                                            <button
                                                style={{ padding: "4px 12px", width: "180px" }}
                                                type="submit"
                                                className="bg-[#C2805A] text-white py-2 rounded-md font-semibold disabled:opacity-50"
                                                disabled={loading || (password && passwordStrength.score < 50)}
                                            >
                                                {loading ? "SIGNING UP..." : "SIGN UP"}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Toast component */}
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

                <style jsx>{`
                    .auth-tab-container {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 24px;
                        padding: 12px;
                    }

                    .auth-tab-list {
                        background: #f3f4f6;
                        border-radius: 8px;
                        padding: 4px;
                        display: flex;
                        gap: 2px;
                        min-width: 200px;
                    }

                    .auth-tab {
                        flex: 1;
                        padding: 8px 16px;
                        border-radius: 6px;
                        border: none;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                        font-family: inherit;
                    }

                    .auth-tab-active {
                        background: #C2805A !important;
                        color: white !important;
                        box-shadow: 0 2px 4px rgba(194, 128, 90, 0.25);
                        transform: translateY(-1px);
                    }

                    .auth-tab-inactive {
                        background: transparent;
                        color: #6b7280;
                    }

                    .auth-tab-inactive:hover {
                        background: #e5e7eb;
                        color: #374151;
                    }

                    .auth-tab:focus {
                        outline: none;
                    }

                    .password-field-container {
                        width: 305px;
                    }

                    .password-strength-container {
                        margin-top: 8px;
                        width: 100%;
                    }

                    .strength-bar-bg {
                        width: 100%;
                        height: 4px;
                        background-color: #e5e7eb;
                        border-radius: 2px;
                        overflow: hidden;
                    }

                    .strength-bar-fill {
                        height: 100%;
                        transition: all 0.3s ease;
                        border-radius: 2px;
                    }

                    .strength-info {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 4px;
                        font-size: 12px;
                    }

                    .strength-label {
                        font-weight: 600;
                    }

                    .strength-feedback {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 2px;
                    }

                    .feedback-tip {
                        color: #6b7280;
                        font-size: 10px;
                        text-align: right;
                    }
                `}</style>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={handleChangePasswordClose}
            />
        </>
    );
}