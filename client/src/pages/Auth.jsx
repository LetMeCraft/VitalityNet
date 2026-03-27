import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
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
        await signupWithEmail(
          formState.name,
          formState.email,
          formState.password,
        );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-5 py-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-200">
            Secure Access
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            Sign up or log in to manage your diabetes prediction journey.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Firebase Authentication will handle email and Google sign-in, while
            MongoDB can store prediction history once you share your database
            connection string.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              title="Email Auth"
              description="Create an account with email and password."
            />
            <FeatureCard
              title="Google Login"
              description="Use Firebase Google sign-in for quick access."
            />
            <FeatureCard
              title="Mongo Ready"
              description="Prediction storage hooks are prepared for MongoDB."
            />
          </div>

          {!isFirebaseConfigured ? (
            <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-amber-100">
              <p className="font-semibold">
                Firebase config is still missing, so this page is in setup mode
                right now.
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-50/90">
                Add the missing Vite env keys in `client/.env` and enable the
                Email/Password and Google providers in Firebase Authentication.
              </p>
              <p className="mt-3 text-sm">
                Missing keys: {firebaseMissingKeys.join(", ")}
              </p>
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl"
        >
          <div className="mb-6 flex rounded-full bg-white/5 p-1">
            <ToggleButton
              active={mode === "login"}
              onClick={() => handleModeChange("login")}
            >
              Login
            </ToggleButton>
            <ToggleButton
              active={mode === "signup"}
              onClick={() => handleModeChange("signup")}
            >
              Sign Up
            </ToggleButton>
          </div>

          {loading ? (
            <p className="rounded-2xl bg-white/5 px-4 py-5 text-slate-300">
              Checking your authentication status...
            </p>
          ) : user ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
                  Signed In
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  {user.displayName || user.email}
                </h2>
                <p className="mt-2 text-slate-300">
                  {user.email || "Authenticated with Google"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing Out..." : "Sign Out"}
              </button>

              <Link
                to="/profile"
                className="block rounded-2xl bg-cyan-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Open Profile
              </Link>

              <Link
                to="/prediction"
                className="block rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/15"
              >
                Go To Prediction Page
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white">
                {mode === "signup" ? "Create account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-slate-400">
                {mode === "signup"
                  ? "Start with email and password, or continue with Google."
                  : "Log in to keep your future prediction history connected to your account."}
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
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {errorMessage}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || !isFirebaseConfigured}
                  className="w-full rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "signup"
                      ? "Create Account"
                      : "Login"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                Or
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || !isFirebaseConfigured}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
  </div>
);

const ToggleButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:text-white"
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
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
    />
  </label>
);

export default AuthPage;
