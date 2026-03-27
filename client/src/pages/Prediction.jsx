import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { saveLocalPredictionEntry } from "../lib/predictionHistory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const fieldDefinitions = [
  { name: "Pregnancies", label: "Pregnancies", step: "1" },
  { name: "Glucose", label: "Glucose", step: "0.1" },
  { name: "BloodPressure", label: "Blood Pressure", step: "0.1" },
  { name: "SkinThickness", label: "Skin Thickness", step: "0.1" },
  { name: "Insulin", label: "Insulin", step: "0.1" },
  { name: "BMI", label: "BMI", step: "0.1" },
  {
    name: "DiabetesPedigreeFunction",
    label: "Diabetes Pedigree Function",
    step: "0.01",
  },
  { name: "Age", label: "Age", step: "1" },
];

const initialUserInput = Object.fromEntries(
  fieldDefinitions.map(({ name }) => [name, ""]),
);

const Prediction = () => {
  const { loading, user } = useAuth();
  const [userInput, setUserInput] = useState(initialUserInput);
  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserInput((currentInput) => ({
      ...currentInput,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setButtonDisabled(true);
    setErrorMessage("");

    if (loading) {
      setErrorMessage("Please wait a moment while your account is being loaded.");
      setButtonDisabled(false);
      return;
    }

    const features = Object.fromEntries(
      Object.entries(userInput).map(([key, value]) => [key, Number(value)]),
    );

    const clientPredictionId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `prediction-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const payload = {
      ...features,
      clientPredictionId,
      ...(user
        ? {
            userId: user.uid,
            userEmail: user.email,
          }
        : {}),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setPrediction(response.data);

      if (user) {
        saveLocalPredictionEntry(user, {
          clientPredictionId,
          features,
          result: response.data,
        });
      }
    } catch (error) {
      const apiError =
        error.response?.data?.error ||
        "Prediction failed. Please check the backend server and your input values.";
      setPrediction(null);
      setErrorMessage(apiError);
    } finally {
      setButtonDisabled(false);
    }
  };

  const isHighRisk = prediction?.result === "High Risk";

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-card px-6 py-8 md:px-8 md:py-10"
        >
          <span className="eyebrow">Prediction Workflow</span>
          <div className="mt-4 max-w-3xl">
            <h1 className="section-title">Clinical diabetes predictor</h1>
            <p className="section-copy mt-4">
              Enter the eight clinical values used by the model. The form sends the
              input to the Flask backend and keeps signed-in prediction history connected
              to your profile.
            </p>
          </div>
        </motion.section>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="surface-card px-6 py-8 md:px-8"
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {fieldDefinitions.map(({ label, name, step }) => (
                  <label key={name} htmlFor={name}>
                    <span className="field-label">{label}</span>
                    <input
                      id={name}
                      type="number"
                      name={name}
                      step={step}
                      min="0"
                      required
                      value={userInput[name]}
                      onChange={handleChange}
                      className="field-input"
                    />
                  </label>
                ))}
              </div>

              {errorMessage ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={buttonDisabled || loading}
                  className={`primary-btn w-full sm:w-auto ${
                    buttonDisabled || loading
                      ? "cursor-not-allowed opacity-60 hover:translate-y-0"
                      : ""
                  }`}
                >
                  {buttonDisabled ? "Analyzing..." : loading ? "Preparing..." : "Predict"}
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="surface-card px-6 py-8 md:px-8"
          >
            {!prediction ? (
              <div className="space-y-5">
                <span className="eyebrow">How It Works</span>
                <h2 className="text-2xl font-semibold text-slate-900">What happens next</h2>
                <div className="space-y-4 text-sm leading-7 text-slate-600 md:text-base">
                  <p>The frontend sends the clinical values to the Flask API at `/predict`.</p>
                  <p>The backend scales the values with `scaler.pkl` and predicts with `nb.pkl`.</p>
                  <p>
                    If you are signed in, the prediction is also attached to your account
                    history for the profile page.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <span className={isHighRisk ? "status-chip-high" : "status-chip-low"}>
                  {prediction.result}
                </span>
                <h2 className="text-3xl font-bold text-slate-900">
                  Prediction Result: {prediction.result}
                </h2>
                <p className="text-base leading-8 text-slate-600">{prediction.prediction}</p>

                {prediction.gif_url ? (
                  <div className="soft-panel p-4">
                    <img
                      src={prediction.gif_url}
                      alt={prediction.result}
                      className="mx-auto max-h-72 rounded-2xl object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
