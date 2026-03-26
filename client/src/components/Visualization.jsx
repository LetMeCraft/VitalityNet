import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaDownload } from "react-icons/fa6";

import agePlot from "../assets/plots/age_plot.png";
import BMIPlot from "../assets/plots/BMI_plot.png";
import BloodPressurePlot from "../assets/plots/bp_plot.png";
import CF from "../assets/plots/cf.png";
import DPF from "../assets/plots/dpf_plot.png";
import glucose from "../assets/plots/glucose_plot.png";
import insulin from "../assets/plots/insulin.png";
import pregnancies from "../assets/plots/pregnancies.png";
import skin from "../assets/plots/skin.png";

/* ---------------------------------------------
   Generate Example PPG Waveform (Simulated)
---------------------------------------------- */
function generateExamplePPG(samples = 2000, fs = 100) {
  const signal = [];
  for (let i = 0; i < samples; i++) {
    const t = i / fs;
    // Base pulse waveform (sinusoid + exponential decay)
    const beat = Math.sin(2 * Math.PI * 1.3 * t) * Math.exp(-2 * (t % 1)) * 0.8;
    // Add noise and baseline drift
    const noise = 0.05 * Math.random() - 0.025;
    const baseline = 0.05 * Math.sin(2 * Math.PI * 0.05 * t);
    signal.push(beat + noise + baseline);
  }
  return signal;
}

const VisualizationPage = () => {
  const [modalImage, setModalImage] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Load example PPG signal automatically
    const exampleSignal = {
      name: "Example_PPG_Signal",
      data: generateExamplePPG(),
    };
    setSelectedSignal(exampleSignal);
    calculateSummary(exampleSignal);
  }, []);

  const calculateSummary = (signal) => {
    if (!signal || !signal.data || signal.data.length === 0) return;
    const arr = signal.data;
    const meanAmp = arr.reduce((a, b) => a + b, 0) / arr.length;
    const maxAmp = Math.max(...arr);
    const minAmp = Math.min(...arr);
    const duration = arr.length / 100; // assuming 100 Hz sampling rate
    setSummary({
      meanAmp: meanAmp.toFixed(3),
      maxAmp: maxAmp.toFixed(3),
      minAmp: minAmp.toFixed(3),
      duration: duration.toFixed(2),
    });
  };

  const openModel = (image) => setModalImage(image);
  const closeModal = () => setModalImage(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-12 px-6">
      {/* PAGE TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-extrabold mb-12 text-center text-indigo-700 border-b-4 border-indigo-300 pb-3"
      >
        Diabetes Prediction Data Visualization
      </motion.h1>

      {/* PPG SIGNAL VISUALIZATION */}
      <section className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="bg-white/70 backdrop-blur-md shadow-xl rounded-3xl p-8 border border-indigo-100"
        >
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
            PPG Signal Analysis
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            This example photoplethysmogram (PPG) signal simulates pulse wave activity typically
            captured by optical sensors. Doctors can observe amplitude variations and rhythmic
            patterns to infer cardiovascular and diabetic conditions.
          </p>

          {/* Signal Info */}
          <div className="text-center mb-6">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-full shadow-sm">
              Example Signal Loaded Automatically
            </span>
          </div>

          {/* Graph & Summary */}
          {selectedSignal && (
            <div>
              <Plot
                data={[
                  {
                    y: selectedSignal.data,
                    type: "scatter",
                    mode: "lines",
                    line: { color: "#4F46E5", width: 2 },
                    name: "PPG Signal",
                  },
                ]}
                layout={{
                  title: {
                    text: `Example PPG Signal`,
                    font: { size: 20, color: "#312e81" },
                  },
                  xaxis: { title: "Sample", color: "#4b5563" },
                  yaxis: { title: "Amplitude", color: "#4b5563" },
                  paper_bgcolor: "rgba(0,0,0,0)",
                  plot_bgcolor: "rgba(0,0,0,0)",
                  margin: { l: 50, r: 20, t: 50, b: 50 },
                }}
                config={{ responsive: true }}
                style={{ width: "100%", height: "400px" }}
              />

              {/* Summary Table */}
              {summary && (
                <div className="mt-6 bg-indigo-50 p-4 rounded-xl shadow-md text-center max-w-lg mx-auto">
                  <h3 className="text-xl font-bold text-indigo-700 mb-3">Signal Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                    <p>
                      <strong>Mean Amplitude:</strong> {summary.meanAmp}
                    </p>
                    <p>
                      <strong>Max Amplitude:</strong> {summary.maxAmp}
                    </p>
                    <p>
                      <strong>Min Amplitude:</strong> {summary.minAmp}
                    </p>
                    <p>
                      <strong>Duration (s):</strong> {summary.duration}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* CLINICAL FEATURE VISUALIZATIONS */}
      <motion.h2
        initial={{ opacity: 0, y: -100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold text-indigo-700 mb-10 text-center"
      >
        Clinical Feature Insights
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          { img: agePlot, title: "Age Plot" },
          { img: BMIPlot, title: "BMI Plot" },
          { img: BloodPressurePlot, title: "Blood Pressure Plot" },
          { img: CF, title: "Cystic Fibrosis Plot" },
          { img: DPF, title: "Diabetes Pedigree Function Plot" },
          { img: glucose, title: "Glucose Plot" },
          { img: insulin, title: "Insulin Plot" },
          { img: pregnancies, title: "Pregnancies Plot" },
          { img: skin, title: "Skin Thickness Plot" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="bg-white/60 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-lg p-4 hover:shadow-2xl transition-transform hover:-translate-y-1 cursor-pointer"
            onClick={() => openModel(item.img)}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">{item.title}</h3>
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-2xl flex flex-col relative max-w-4xl">
            <div className="flex justify-end space-x-2">
              <a href={modalImage} download>
                <button className="p-2 text-indigo-600 hover:text-indigo-800 transition">
                  <FaDownload className="w-6 h-6" />
                </button>
              </a>
              <button
                onClick={closeModal}
                className="p-2 text-red-500 hover:text-red-700 transition"
              >
                <IoClose className="w-7 h-7" />
              </button>
            </div>
            <img
              src={modalImage}
              alt="Visualization"
              className="rounded-lg object-contain w-full max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationPage;
