import { useEffect, useState } from "react";
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

function generateExamplePPG(samples = 2000, fs = 100) {
  const signal = [];
  for (let i = 0; i < samples; i += 1) {
    const t = i / fs;
    const beat = Math.sin(2 * Math.PI * 1.3 * t) * Math.exp(-2 * (t % 1)) * 0.8;
    const noise = 0.05 * Math.random() - 0.025;
    const baseline = 0.05 * Math.sin(2 * Math.PI * 0.05 * t);
    signal.push(beat + noise + baseline);
  }
  return signal;
}

const featurePlots = [
  { img: agePlot, title: "Age Plot" },
  { img: BMIPlot, title: "BMI Plot" },
  { img: BloodPressurePlot, title: "Blood Pressure Plot" },
  { img: CF, title: "Cystic Fibrosis Plot" },
  { img: DPF, title: "Diabetes Pedigree Function Plot" },
  { img: glucose, title: "Glucose Plot" },
  { img: insulin, title: "Insulin Plot" },
  { img: pregnancies, title: "Pregnancies Plot" },
  { img: skin, title: "Skin Thickness Plot" },
];

const VisualizationPage = () => {
  const [modalImage, setModalImage] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const exampleSignal = {
      name: "Example_PPG_Signal",
      data: generateExamplePPG(),
    };
    setSelectedSignal(exampleSignal);
    calculateSummary(exampleSignal);
  }, []);

  const calculateSummary = (signal) => {
    if (!signal || !signal.data || signal.data.length === 0) {
      return;
    }

    const arr = signal.data;
    const meanAmp = arr.reduce((a, b) => a + b, 0) / arr.length;
    const maxAmp = Math.max(...arr);
    const minAmp = Math.min(...arr);
    const duration = arr.length / 100;

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
    <div className="page-shell">
      <div className="page-container space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-card px-6 py-8 md:px-8 md:py-10"
        >
          <span className="eyebrow">Visual Review</span>
          <div className="mt-4 max-w-3xl">
            <h1 className="section-title">Diabetes prediction data visualization</h1>
            <p className="section-copy mt-4">
              This page combines a simulated PPG waveform with static feature charts so
              the full project keeps one visual language while still presenting detailed
              medical context.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="surface-card px-6 py-8 md:px-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                PPG signal analysis
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                This example photoplethysmogram signal simulates pulse-wave activity. It
                gives the dashboard a realistic monitoring view without requiring upload
                support on the frontend.
              </p>
            </div>
            <span className="eyebrow">Example signal loaded automatically</span>
          </div>

          {selectedSignal ? (
            <div className="mt-8 space-y-6">
              <div className="soft-panel p-3 md:p-5">
                <Plot
                  data={[
                    {
                      y: selectedSignal.data,
                      type: "scatter",
                      mode: "lines",
                      line: { color: "#2f8897", width: 2 },
                      name: "PPG Signal",
                    },
                  ]}
                  layout={{
                    title: {
                      text: "Example PPG Signal",
                      font: { size: 20, color: "#13263f" },
                    },
                    xaxis: { title: "Sample", color: "#556a80" },
                    yaxis: { title: "Amplitude", color: "#556a80" },
                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                    margin: { l: 50, r: 20, t: 50, b: 50 },
                  }}
                  config={{ responsive: true }}
                  style={{ width: "100%", height: "400px" }}
                />
              </div>

              {summary ? (
                <div className="grid gap-4 md:grid-cols-4">
                  <SummaryCard label="Mean Amplitude" value={summary.meanAmp} />
                  <SummaryCard label="Max Amplitude" value={summary.maxAmp} />
                  <SummaryCard label="Min Amplitude" value={summary.minAmp} />
                  <SummaryCard label="Duration (s)" value={summary.duration} />
                </div>
              ) : null}
            </div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-5"
        >
          <div className="max-w-3xl">
            <span className="eyebrow">Feature Charts</span>
            <h2 className="section-title mt-4">Clinical feature insights</h2>
            <p className="section-copy mt-4">
              Open any chart to view it in a larger modal and download the underlying
              image.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featurePlots.map((item, index) => (
              <motion.button
                key={item.title}
                type="button"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="surface-card overflow-hidden text-left transition-transform hover:-translate-y-1"
                onClick={() => openModel(item.img)}
              >
                <img src={item.img} alt={item.title} className="h-64 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </div>

      {modalImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-5xl p-4 md:p-6">
            <div className="mb-4 flex justify-end gap-2">
              <a
                href={modalImage}
                download
                className="secondary-btn rounded-full p-3"
                aria-label="Download visualization"
              >
                <FaDownload className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={closeModal}
                className="secondary-btn rounded-full p-3"
                aria-label="Close visualization modal"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
            <img
              src={modalImage}
              alt="Visualization"
              className="max-h-[80vh] w-full rounded-[1.5rem] object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="surface-card-soft p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

export default VisualizationPage;
