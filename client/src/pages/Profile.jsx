import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { Link } from "react-router-dom";
import ProfileStarfield from "../components/ProfileStarfield";
import { useAuth } from "../context/AuthContext";
import {
  getLocalPredictionHistory,
  mergePredictionHistories,
  PREDICTION_HISTORY_UPDATED_EVENT,
} from "../lib/predictionHistory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatFeatureLabel = (value) => value.replace(/([A-Z])/g, " $1").trim();

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/yourprofile",
    icon: FaLinkedinIn,
    label: "LinkedIn",
  },
  {
    href: "https://github.com/yourusername",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://leetcode.com/yourusername",
    icon: SiLeetcode,
    label: "LeetCode",
  },
  {
    href: "https://www.instagram.com/yourusername",
    icon: FaInstagram,
    label: "Instagram",
  },
];

const ProfilePage = () => {
  const { loading, logout, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user?.uid && !user?.email) {
      setHistory([]);
      setHistoryError("");
      return false;
    }

    const localHistory = getLocalPredictionHistory(user);
    setHistoryLoading(true);
    setHistoryError("");
    setHistory(localHistory);

    try {
      const response = await axios.get(`${API_BASE_URL}/predictions/history`, {
        params: {
          limit: 12,
          userId: user?.uid,
          userEmail: user?.email,
        },
      });
      setHistory(mergePredictionHistories(response.data?.history || [], localHistory));
      return true;
    } catch (error) {
      const apiError =
        error.response?.data?.error ||
        "We couldn't load your prediction history right now.";
      if (!localHistory.length) {
        setHistoryError(apiError);
      }
      return false;
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleHistoryUpdate = () => {
      loadHistory();
    };

    const handleWindowFocus = () => {
      loadHistory();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadHistory();
      }
    };

    window.addEventListener(PREDICTION_HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    window.addEventListener("storage", handleHistoryUpdate);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(PREDICTION_HISTORY_UPDATED_EVENT, handleHistoryUpdate);
      window.removeEventListener("storage", handleHistoryUpdate);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadHistory]);

  const handleLogout = async () => {
    setSignOutLoading(true);

    try {
      await logout();
    } finally {
      setSignOutLoading(false);
    }
  };

  if (loading) {
    return (
      <CosmicFrame>
        <div className="page-container">
          <div className="cosmic-card px-6 py-8 md:px-8">
            <p className="text-lg cosmic-copy">Loading your profile...</p>
          </div>
        </div>
      </CosmicFrame>
    );
  }

  if (!user) {
    return (
      <CosmicFrame>
        <div className="page-container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="cosmic-card px-6 py-8 md:px-8 md:py-10">
            <span className="cosmic-badge">Profile Access</span>
            <h1 className="section-title cosmic-title mt-4">
              Sign in to unlock your personal dashboard.
            </h1>
            <p className="section-copy cosmic-copy mt-4 max-w-2xl">
              Once you log in, you will see your account details and the prediction
              records saved for your profile.
            </p>
          </section>

          <section className="cosmic-card px-6 py-8 md:px-8">
            <p className="text-sm font-medium cosmic-label">Not Signed In</p>
            <h2 className="mt-3 text-2xl font-semibold cosmic-title">
              Your profile is ready when you are.
            </h2>
            <p className="mt-3 cosmic-copy">
              Log in with email or Google to view your saved prediction activity.
            </p>
            <Link to="/auth" className="primary-btn mt-8">
              Go To Login
            </Link>
          </section>
        </div>
      </CosmicFrame>
    );
  }

  const profileName =
    user.displayName?.trim() || user.email?.split("@")[0] || "VitalityNet User";
  const firstName = profileName.split(" ")[0] || profileName;
  const profileEmail = user.email || "Signed in with Google";
  const providerNames = (user.providerData || [])
    .map((provider) => {
      if (provider.providerId === "google.com") {
        return "Google";
      }
      if (provider.providerId === "password") {
        return "Email & Password";
      }
      return provider.providerId;
    })
    .filter(Boolean);
  const joinedAt = user.metadata?.creationTime
    ? dateFormatter.format(new Date(user.metadata.creationTime))
    : "Recently";
  const providerLabel = providerNames.length ? providerNames.join(", ") : "Firebase";

  return (
    <CosmicFrame>
      <div className="page-container space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="cosmic-card px-6 py-8 md:px-8 md:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr]">
            <div>
              <span className="cosmic-badge">Profile</span>
              <div className="mt-6">
                <h1 className="text-4xl font-bold tracking-tight cosmic-title md:text-5xl">
                  {profileName}
                </h1>
                <p className="mt-2 text-lg cosmic-copy">{profileEmail}</p>
              </div>

              <p className="mt-8 max-w-3xl text-base leading-8 cosmic-copy md:text-lg">
                Welcome back, {firstName}. This space keeps your account details together
                and lets you revisit the predictions you saved while signed in.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ProfileStat
                  label="Recent Predictions"
                  value={historyLoading ? "..." : String(history.length)}
                />
                <ProfileStat label="Providers" value={providerLabel} />
                <ProfileStat
                  label="Account"
                  value={user.emailVerified ? "Verified" : "Active"}
                />
              </div>

              <div className="mt-8 cosmic-card-soft p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
                      Connect with Owner
                    </p>
                    <p className="mt-2 text-sm cosmic-copy">
                      Reach out or check out my work through these platforms. 
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {socialLinks.map((item) => (
                    <SocialLink
                      key={item.label}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="cosmic-card-soft p-6">
              <h2 className="text-xl font-semibold cosmic-title">Account details</h2>
              <dl className="mt-6 space-y-5">
                <DetailRow label="Full name" value={profileName} />
                <DetailRow label="Email" value={profileEmail} />
                <DetailRow label="Provider" value={providerLabel} />
                <DetailRow label="Member since" value={joinedAt} />
                <DetailRow label="User ID" value={user.uid} breakValue />
              </dl>

              <div className="mt-8 space-y-3">
                <Link to="/prediction" className="primary-btn w-full justify-center">
                  Create new prediction
                </Link>
                <Link to="/visualization" className="cosmic-action-btn">
                  Explore visualizations
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signOutLoading}
                  className={`cosmic-action-btn ${signOutLoading ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {signOutLoading ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="cosmic-card overflow-hidden"
        >
          <div className="border-b border-white/10 px-6 py-5 md:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold cosmic-title">
                  Recent prediction history
                </h2>
                <p className="mt-1 text-sm cosmic-copy">
                  Only predictions created while you were signed in are shown here.
                </p>
              </div>
              <p className="text-sm cosmic-label">
                {historyLoading ? "Loading..." : `${history.length} saved`}
              </p>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8">
            {historyError ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-rose-100">
                {historyError}
              </div>
            ) : null}

            {historyLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : history.length ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <article key={entry.id} className="cosmic-card-soft p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={
                              entry.result === "High Risk"
                                ? "status-chip-high"
                                : "status-chip-low"
                            }
                          >
                            {entry.result}
                          </span>
                          <span className="text-sm cosmic-label">
                            {dateFormatter.format(new Date(entry.createdAt))}
                          </span>
                        </div>
                        <p className="mt-3 text-base font-medium cosmic-title">
                          {entry.prediction}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(entry.features || {})
                        .slice(0, 8)
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100"
                          >
                            {formatFeatureLabel(key)}: {String(value)}
                          </span>
                        ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cosmic-card-soft px-6 py-10 text-center">
                <h3 className="text-2xl font-semibold cosmic-title">
                  No saved predictions yet
                </h3>
                <p className="mx-auto mt-3 max-w-2xl cosmic-copy">
                  Once you submit a prediction while signed in, it will appear here
                  automatically.
                </p>
                <Link to="/prediction" className="primary-btn mt-6">
                  Create first prediction
                </Link>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </CosmicFrame>
  );
};

const CosmicFrame = ({ children }) => (
  <div className="cosmic-page min-h-screen">
    <ProfileStarfield />
    <div className="cosmic-page-shell">{children}</div>
  </div>
);

const ProfileStat = ({ label, value }) => (
  <div className="cosmic-card-soft p-4">
    <p className="text-sm cosmic-label">{label}</p>
    <p className="mt-3 text-2xl font-semibold cosmic-title">{value}</p>
  </div>
);

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/8"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/12 text-cyan-100">
      <Icon className="text-lg" />
    </span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

const DetailRow = ({ breakValue = false, label, value }) => (
  <div>
    <dt className="text-sm cosmic-label">{label}</dt>
    <dd
      className={`mt-1 text-sm font-medium cosmic-value ${
        breakValue ? "break-all" : ""
      }`}
    >
      {value}
    </dd>
  </div>
);

export default ProfilePage;
