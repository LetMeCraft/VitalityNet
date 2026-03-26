import diabetesImg from "../assets/diabetes.jpeg";
import dataInsightsImg from "../assets/home-data-insights.jpg";
import predictiveAnalyticsImg from "../assets/home-predictive-analytics.jpg";
import dataVisualizationImg from "../assets/home-data-visualization.jpg";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Testimonials from "./Testimonials/Testimonials.jsx";

const Home = () => {
  return (
    <div className="overflow-x-hidden font-[Poppins] bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <div
        className="relative flex flex-col items-center justify-center h-screen w-full text-center"
        style={{
          backgroundImage: `url(${diabetesImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(10, 14, 40, 0.7)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1e1b4b]/50 to-[#0f172a]/80"></div>

        <motion.div
          className="relative z-10 p-6 text-white space-y-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-snug drop-shadow-lg">
            AI-Powered Diabetes Prediction System
          </h1>

          <p className="text-lg md:text-xl font-medium text-blue-100">
            Empowering doctors with intelligent diagnostics using clinical
            screening data and interactive visual summaries for early diabetes
            detection.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mt-8"
          >
            <Link
              to="/prediction"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-full font-semibold tracking-wide shadow-lg transition-all duration-300"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="container mx-auto py-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-extrabold mb-12 text-center text-[#1e1b4b]"
        >
          Core Features
        </motion.h2>

        <motion.div
          className="flex flex-col md:flex-row items-center justify-between bg-white/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden border border-indigo-100 mb-16"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <img
            src={dataInsightsImg}
            alt="Data Insights"
            className="w-full md:w-1/2 object-cover h-64 md:h-96"
          />
          <div className="p-10 md:w-1/2 text-gray-700">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3">
              Data Insights
            </h3>
            <p className="text-base mb-6 leading-relaxed">
              Explore patient metrics and understand the data patterns used in
              our diabetes prediction system. Gain deeper insight into the
              clinical attributes behind the model.
            </p>
            <Link
              to="/data-info"
              className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row-reverse items-center justify-between bg-white/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden border border-indigo-100 mb-16"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <img
            src={predictiveAnalyticsImg}
            alt="Prediction Module"
            className="w-full md:w-1/2 object-cover h-64 md:h-96"
          />
          <div className="p-10 md:w-1/2 text-gray-700">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3">
              Predictive Analytics
            </h3>
            <p className="text-base mb-6 leading-relaxed">
              Enter the clinical metrics used by our trained model to receive
              AI-based diabetes risk predictions. The workflow reflects the
              Flask API that powers this project.
            </p>
            <Link
              to="/prediction"
              className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Get Prediction
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row items-center justify-between bg-white/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden border border-indigo-100"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <img
            src={dataVisualizationImg}
            alt="Visualization Dashboard"
            className="w-full md:w-1/2 object-cover h-64 md:h-96"
          />
          <div className="p-10 md:w-1/2 text-gray-700">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3">
              Data Visualization
            </h3>
            <p className="text-base mb-6 leading-relaxed">
              Get an intuitive understanding of data relationships through
              interactive graphs and charts designed for medical professionals.
            </p>
            <Link
              to="/visualization"
              className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Visualize Data
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16 px-6"
      >
        <h2 className="text-4xl font-bold mb-10 text-center">
          Trusted by Medical Experts
        </h2>
        <Testimonials />
      </motion.div>
    </div>
  );
};

export default Home;
