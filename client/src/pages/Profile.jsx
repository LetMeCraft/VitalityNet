import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatFeatureLabel = (value) =>
  value.replace(/([A-Z])/g, " $1").trim();

const ProfilePage = () => {
  const { loading, logout, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user?.uid && !user?.email) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const response = await axios.get(`${API_BASE_URL}/predictions/history`, {
          params: {
            limit: 12,
            userId: user?.uid,
            userEmail: user?.email,
          },
        });
        setHistory(response.data?.history || []);
      } catch (error) {
        const apiError =
          error.response?.data?.error ||
          "We couldn't load your prediction history right now.";
        setHistoryError(apiError);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

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
      <div className="min-h-screen bg-slate-100 px-5 py-12 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 px-5 py-12 text-slate-900">
        <div className="mx-auto grid max-w-5xl gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-600">
              Profile Access
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
              Sign in to unlock your personal dashboard.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Once you log in, you will see your account details and the
              prediction records saved for your profile.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <p className="text-sm font-medium text-slate-500">
              Not Signed In
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Your profile is ready when you are.
            </h2>
            <p className="mt-3 text-slate-600">
              Log in with email or Google to view your saved prediction
              activity.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              Go To Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profileName =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "VitalityNet User";
  const firstName = profileName.split(" ")[0] || profileName;
  const profileEmail = user.email || "Signed in with Google";
  const profileInitial = profileName.charAt(0).toUpperCase();
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
    <div className="min-h-screen bg-slate-100 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.8fr] lg:px-8">
            <div>
              <div className="mt-6 flex items-center gap-5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={profileName}
                    className="h-20 w-20 rounded-3xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-400 text-3xl font-bold text-slate-950">
                    {profileInitial}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-500">Profile</p>
                  <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                    {profileName}
                  </h1>
                  <p className="mt-2 text-lg text-slate-600">
                    {profileEmail}
                  </p>
                </div>
              </div>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600">
                Welcome back, {firstName}. This page keeps your account details
                together and shows the predictions you made while signed in.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ProfileStat
                  label="Recent Predictions"
                  value={historyLoading ? "..." : String(history.length)}
                />
                <ProfileStat
                  label="Providers"
                  value={providerLabel}
                />
                <ProfileStat
                  label="Account"
                  value={user.emailVerified ? "Verified" : "Active"}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Account details
              </h2>
              <dl className="mt-6 space-y-5">
                <DetailRow label="Full name" value={profileName} />
                <DetailRow label="Email" value={profileEmail} />
                <DetailRow label="Provider" value={providerLabel} />
                <DetailRow label="Member since" value={joinedAt} />
                <DetailRow label="User ID" value={user.uid} breakValue />
              </dl>

              <div className="mt-8 space-y-3">
                <Link
                  to="/prediction"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  <span>Create new prediction</span>
                  <span className="text-slate-400">/</span>
                </Link>
                <Link
                  to="/visualization"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  <span>Explore visualizations</span>
                  <span className="text-slate-400">/</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signOutLoading}
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {signOutLoading ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recent prediction history
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Only predictions created while you were signed in are shown
                here.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              {historyLoading ? "Loading..." : `${history.length} saved`}
            </p>
          </div>

          <div className="px-6 py-6">
            {historyError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
                {historyError}
              </div>
            ) : null}

            {historyLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
            ) : history.length ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 px-5 py-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              entry.result === "High Risk"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {entry.result}
                          </span>
                          <span className="text-sm text-slate-500">
                            {dateFormatter.format(new Date(entry.createdAt))}
                          </span>
                        </div>
                        <p className="mt-3 text-base font-medium text-slate-900">
                          {entry.prediction}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(entry.features || {}).slice(0, 8).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                        >
                          {formatFeatureLabel(key)}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-2xl font-semibold text-slate-900">
                  No saved predictions yet
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                  Once you submit a prediction while signed in, it will appear
                  here automatically.
                </p>
                <Link
                  to="/prediction"
                  className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
                >
                  Create first prediction
                </Link>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

const ProfileStat = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

const DetailRow = ({ breakValue = false, label, value }) => (
  <div>
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd
      className={`mt-1 text-sm font-medium text-slate-900 ${
        breakValue ? "break-all" : ""
      }`}
    >
      {value}
    </dd>
  </div>
);

export default ProfilePage;
