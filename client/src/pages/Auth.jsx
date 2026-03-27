import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaGoogle,
  FaLinkedinIn,
  FaPhoneAlt,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AUTH_ERROR_MESSAGES = {
  "auth/account-exists-with-different-credential":
    "An account already exists with another sign-in method for this email.",
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/popup-closed-by-user": "The Google sign-in popup was closed before finishing.",
  "auth/too-many-requests": "Too many attempts. Please wait a bit and try again.",
  "auth/user-not-found": "No account was found with this email.",
  "auth/weak-password": "Use a stronger password with at least 6 characters.",
  "auth/wrong-password": "Incorrect password. Please try again.",
};

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const getAuthErrorMessage = (error) =>
  AUTH_ERROR_MESSAGES[error?.code] ||
  error?.message ||
  "Something went wrong while authenticating. Please try again.";

const quickLinks = [
  {
    href: "https://github.com/yourusername",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/yourprofile",
    icon: FaLinkedinIn,
    label: "LinkedIn",
  },
  {
    href: "tel:+1234567890",
    icon: FaPhoneAlt,
    label: "Call",
  },
  {
    href: "https://www.youtube.com/@yourchannel",
    icon: FaYoutube,
    label: "YouTube",
  },
  {
    href: "https://wa.me/1234567890",
    icon: FaWhatsapp,
    label: "WhatsApp",
  },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const {
    firebaseMissingKeys,
    isFirebaseConfigured,
    loading,
    loginWithEmail,
    loginWithGoogle,
    logout,
    signupWithEmail,
    user,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setFormState(initialFormState);
    resetMessages();
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    if (mode === "signup" && formState.password !== formState.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        await signupWithEmail(formState.name, formState.email, formState.password);
        setSuccessMessage("Account created successfully.");
      } else {
        await loginWithEmail(formState.email, formState.password);
        setSuccessMessage("Logged in successfully.");
      }

      navigate("/profile");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetMessages();
    setIsSubmitting(true);

    try {
      await loginWithGoogle();
      navigate("/profile");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    resetMessages();
    setIsSubmitting(true);

    try {
      await logout();
      setSuccessMessage("Signed out successfully.");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container grid gap-8 lg:items-start lg:grid-cols-[1fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-card self-start px-6 py-8 md:px-8 md:py-10"
        >
          <span className="eyebrow">Secure Access</span>
          <h1 className="section-title mt-4">
            Sign up or log in to save your prediction history.
          </h1>
          <p className="section-copy mt-4 max-w-2xl">
            Create an account if you want your prediction results to stay connected to
            your profile and be available when you return.
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5">
            <p className="text-base font-medium text-slate-900">Why log in?</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600 md:text-base">
              <li>Save your prediction history securely.</li>
              <li>Open your profile later and review past results anytime.</li>
            </ul>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Quick Links
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={item.label}
                    title={item.label}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:text-[var(--accent-dark)]"
                  >
                    <Icon className="text-lg" />
                  </a>
                );
              })}
            </div>
          </div>

          {!isFirebaseConfigured ? (
            <div className="mt-8 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-5 text-amber-800">
              <p className="font-semibold">
                Firebase config is still missing, so this page is in setup mode right now.
              </p>
              <p className="mt-2 text-sm leading-7">
                Add the missing Vite env keys in `client/.env` and enable the
                Email/Password and Google providers in Firebase Authentication.
              </p>
              <p className="mt-3 text-sm">Missing keys: {firebaseMissingKeys.join(", ")}</p>
            </div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="surface-card px-6 py-8 md:px-8"
        >
          <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1">
            <ToggleButton active={mode === "login"} onClick={() => handleModeChange("login")}>
              Login
            </ToggleButton>
            <ToggleButton active={mode === "signup"} onClick={() => handleModeChange("signup")}>
              Sign Up
            </ToggleButton>
          </div>

          {loading ? (
            <p className="surface-card-soft px-4 py-5 text-slate-600">
              Checking your authentication status...
            </p>
          ) : user ? (
            <div className="space-y-5">
              <div className="soft-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
                  Signed In
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  {user.displayName || user.email}
                </h2>
                <p className="mt-2 text-slate-600">
                  {user.email || "Authenticated with Google"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
                className={`secondary-btn w-full justify-center ${
                  isSubmitting ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {isSubmitting ? "Signing Out..." : "Sign Out"}
              </button>

              <Link to="/profile" className="primary-btn w-full justify-center">
                Open Profile
              </Link>

              <Link to="/prediction" className="secondary-btn w-full justify-center">
                Go To Prediction Page
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-semibold text-slate-900">
                {mode === "signup" ? "Create account" : "Welcome back"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                {mode === "signup"
                  ? "Create your account to save prediction history."
                  : "Log in to access your saved prediction history."}
              </p>

              <form className="mt-8 space-y-4" onSubmit={handleEmailSubmit}>
                {mode === "signup" ? (
                  <FormField
                    id="name"
                    label="Full Name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                ) : null}

                <FormField
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />

                <FormField
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />

                {mode === "signup" ? (
                  <FormField
                    id="confirmPassword"
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formState.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                  />
                ) : null}

                {errorMessage ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || !isFirebaseConfigured}
                  className={`primary-btn w-full justify-center ${
                    isSubmitting || !isFirebaseConfigured
                      ? "cursor-not-allowed opacity-60 hover:translate-y-0"
                      : ""
                  }`}
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "signup"
                      ? "Create Account"
                      : "Login"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                Or
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || !isFirebaseConfigured}
                className={`secondary-btn w-full justify-center gap-3 ${
                  isSubmitting || !isFirebaseConfigured
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
};

const ToggleButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
    }`}
  >
    {children}
  </button>
);

const FormField = ({
  id,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}) => (
  <label className="block" htmlFor={id}>
    <span className="field-label">{label}</span>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="field-input"
    />
  </label>
);

export default AuthPage;
