import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const [userInput, setUserInput] = useState(initialUserInput);
  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

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

    const payload = {
      ...Object.fromEntries(
        Object.entries(userInput).map(([key, value]) => [key, Number(value)]),
      ),
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isHighRisk = prediction?.result === "High Risk";

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 flex flex-col items-center justify-center py-10">
      <div className="flex flex-col sm:flex-row items-start justify-center w-full max-w-7xl px-5">
        <motion.div
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            type: "spring",
            stiffness: 100,
            delay: 0.3,
          }}
          className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-10 w-full sm:w-1/2 border border-white/40"
        >
          <h1 className="text-3xl font-extrabold mb-3 text-center text-white drop-shadow-lg">
            Clinical Diabetes Predictor
          </h1>
          <p className="text-center text-white/90 mb-8">
            Enter the eight clinical values used by the Flask model to get a
            diabetes risk prediction.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {fieldDefinitions.map(({ name, label, step }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block text-white font-semibold mb-2 tracking-wide"
                  >
                    {label}
                  </label>
                  <input
                    id={name}
                    type="number"
                    name={name}
                    step={step}
                    min="0"
                    required
                    value={userInput[name]}
                    onChange={handleChange}
                    className="w-full bg-white/70 border border-purple-200 text-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {errorMessage ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={buttonDisabled}
                className={`py-3 px-6 rounded-xl shadow-lg text-lg font-semibold transition-all duration-300 ${
                  buttonDisabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-purple-700 hover:bg-purple-900 text-white hover:shadow-xl hover:scale-105"
                }`}
              >
                {buttonDisabled ? "Analyzing..." : "Predict"}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            type: "spring",
            stiffness: 100,
            delay: 0.3,
          }}
          className="w-full sm:w-1/2 mt-10 sm:mt-0 sm:ml-10 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl shadow-2xl p-8"
        >
          {!prediction ? (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                How This Page Works
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-white/90 text-justify">
                <li>
                  The frontend sends clinical values as JSON to the Flask API at
                  `/predict`.
                </li>
                <li>
                  The server scales the values with `scaler.pkl` and predicts
                  with `nb.pkl`.
                </li>
                <li>
                  This page now reflects the real backend behavior and no longer
                  asks for unsupported PPG file uploads.
                </li>
              </ul>
            </>
          ) : (
            <div
              className={`mx-auto flex flex-col gap-5 py-6 px-4 rounded-xl text-center ${
                isHighRisk
                  ? "bg-red-100 border border-red-500 text-red-700"
                  : "bg-green-100 border border-green-500 text-green-700"
              }`}
            >
              <h2 className="text-3xl font-extrabold">
                Prediction Result: {prediction.result}
              </h2>
              <p className="text-md font-medium">{prediction.prediction}</p>
              {prediction.gif_url ? (
                <img
                  src={prediction.gif_url}
                  alt={prediction.result}
                  className="mx-auto rounded-xl max-h-64 object-contain"
                />
              ) : null}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Prediction;
