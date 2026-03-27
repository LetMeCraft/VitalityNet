import { useState } from "react";

const faqs = [
  {
    header: "What does this diabetes prediction website do?",
    text: "This website helps users check their possible diabetes risk using health-related inputs and supportive project visuals. It is designed for self-awareness and early attention, not for final medical diagnosis.",
  },
  {
    header: "How is PPG related to this project?",
    text: "PPG, or photoplethysmography, is a light-based signal used to observe pulse-related changes in blood flow. In this project, the visualization side helps explain how signal-based health monitoring can support diabetes awareness, while the current prediction workflow focuses on the core clinical inputs used by the model.",
  },
  {
    header: "Is this prediction result a medical diagnosis?",
    text: "No. The result is only a machine-learning prediction to support self-checking and awareness. It should never replace a proper medical consultation, laboratory testing, or a doctor's diagnosis.",
  },
  {
    header: "What should I do if my result shows high risk?",
    text: "If the system shows a high-risk result, you should consult a qualified doctor as soon as possible. A high-risk prediction is a signal to seek professional advice and further medical evaluation, not to self-diagnose.",
  },
  {
    header: "Why are inputs like glucose, BMI, age, and blood pressure used?",
    text: "These inputs are commonly associated with diabetes risk and help the model estimate patterns linked to the condition. They give the system a basic clinical foundation for prediction, but real medical assessment still depends on a doctor's review and proper tests.",
  },
  {
    header: "Who should use this platform?",
    text: "This platform is best used by people who want a simple self-prediction and awareness tool. It can help users understand possible risk patterns, but all important health decisions should be made with medical guidance.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index) => {
    setActiveIndex((currentIndex) => (currentIndex === index ? -1 : index));
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <section className="surface-card px-6 py-8 md:px-8 md:py-10">
          <span className="eyebrow">FAQ</span>
          <div className="mt-4 max-w-3xl">
            <h1 className="section-title">Common questions about the prediction system</h1>
            <p className="section-copy mt-4">
              These answers explain how the current prediction flow, PPG-related context,
              and medical safety guidance fit together in the project.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {faqs.map((item, index) => (
            <AccordionItem
              key={item.header}
              active={activeIndex === index}
              header={item.header}
              onToggle={() => handleToggle(index)}
              text={item.text}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

const AccordionItem = ({ active, header, onToggle, text }) => (
  <div className="surface-card-soft overflow-hidden p-3 md:p-4">
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between rounded-[1.25rem] px-4 py-4 text-left transition ${
        active ? "bg-[var(--accent-soft)]" : "bg-white"
      }`}
    >
      <div className="pr-4">
        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">{header}</h2>
      </div>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-medium transition ${
          active ? "bg-[var(--accent)] text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {active ? "-" : "+"}
      </span>
    </button>

    {active ? (
      <div className="px-4 pb-3 pt-4">
        <p className="max-w-5xl text-sm leading-8 text-slate-600 md:text-base">{text}</p>
      </div>
    ) : null}
  </div>
);

export default FAQ;
