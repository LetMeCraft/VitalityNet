import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="flex h-64 flex-col items-center justify-center">
      <motion.div
        className="h-14 w-14 rounded-full border-4 border-cyan-100 border-t-cyan-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, ease: "linear", repeat: Infinity }}
      />
      <p className="mt-4 text-sm font-medium text-slate-600 md:text-base">
        Loading data...
      </p>
    </div>
  );
};

export default Loader;
