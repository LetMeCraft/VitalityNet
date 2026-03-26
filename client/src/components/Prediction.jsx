import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const Prediction = () => {
  const [userInput, setUserInput] = useState({
    Age: "",
    Pregnancies: "",
    BloodPressure: "",
    BMI: "",
  });
  const [ppgFile, setPpgFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPpgFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);

    const formData = new FormData();
    Object.keys(userInput).forEach((key) => formData.append(key, userInput[key]));
    if (ppgFile) formData.append("ppg_file", ppgFile);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error while predicting. Please check backend connection or data format.");
    }
    setButtonDisabled(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 flex flex-col items-center justify-center py-10">
      <div className="flex flex-col sm:flex-row items-center justify-center w-full max-w-7xl px-5">
        {/* LEFT CARD - INPUT FORM */}
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
          <h1 className="text-3xl font-extrabold mb-8 text-center text-white drop-shadow-lg">
            PPG & Clinical Diabetes Predictor
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Object.keys(userInput).map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-white font-semibold mb-2 tracking-wide"
                  >
                    {field}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={userInput[field]}
                    onChange={handleChange}
                    className="w-full bg-white/70 border border-purple-200 text-gray-800 rounded-md px-3 py-2 
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ))}

              {/* File Upload Field */}
              <div className="sm:col-span-2 mt-3">
                <label
                  htmlFor="ppg_file"
                  className="block text-white font-semibold mb-2 tracking-wide"
                >
                  Upload PPG Signal (.csv / .txt)
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="w-full bg-white/80 border border-purple-200 text-gray-700 rounded-md px-3 py-2 
                             cursor-pointer hover:border-purple-400 transition duration-300"
                />
              </div>
            </div>

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

        {/* RIGHT CARD - RESULT OR INFO */}
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
                About This Model
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-white/90 text-justify">
                <li>
                  This model uses <strong>clinical data</strong> such as Age, BMI, 
                  and Blood Pressure along with <strong>PPG waveform analysis</strong> 
                  for diabetes prediction.
                </li>
                <li>
                  The uploaded PPG signal is processed to detect patterns in blood 
                  flow, waveform shape, and variability that correlate with diabetic 
                  physiology.
                </li>
                <li>
                  AI extracts features like <strong>pulse interval</strong>, 
                  <strong> amplitude variance</strong>, <strong>skewness</strong>, 
                  and <strong>kurtosis</strong> for prediction.
                </li>
              </ul>
            </>
          ) : (
            <div
              className={`mx-auto flex flex-col gap-5 py-6 px-4 rounded-xl text-center ${
                prediction.result === "Diabetic"
                  ? "bg-red-100 border border-red-500 text-red-700"
                  : "bg-green-100 border border-green-500 text-green-700"
              }`}
            >
              <h2 className="text-3xl font-extrabold">
                Prediction Result: {prediction.result}
              </h2>
              <p className="text-md font-medium">
                {prediction.result === "Diabetic"
                  ? "⚠️ The results indicate a high likelihood of diabetes based on your data."
                  : "✅ Your data suggests non-diabetic characteristics."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Prediction;
