import { useState } from "react";
import axios from "axios";
import contactBackground from "../assets/contact-bg.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

const ContactUs = () => {
  const [formState, setFormState] = useState(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await axios.post(
        `${API_BASE_URL}/contact`,
        {
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setFormState(initialFormState);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "We could not send your message right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="surface-card overflow-hidden">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className="relative min-h-[320px] bg-cover bg-center"
              style={{ backgroundImage: `url(${contactBackground})` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(19,38,63,0.88)_0%,rgba(47,136,151,0.6)_100%)]" />
              <div className="relative flex h-full flex-col px-6 py-8 text-white md:px-8 md:py-10">
                <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-cyan-100">
                  Contact
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                  Every prediction is a small step toward better care.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-8 text-slate-200 md:text-lg">
                  Share your thoughts or questions anytime. We want this experience to
                  feel clear, supportive, and easy to trust.
                </p>
              </div>
            </div>

            <div className="px-6 py-8 md:px-8 md:py-10">
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Get in touch
              </h2>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block" htmlFor="name">
                  <span className="field-label">Name</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    className="field-input"
                    value={formState.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="block" htmlFor="email">
                  <span className="field-label">Email</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    className="field-input"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="block" htmlFor="message">
                  <span className="field-label">Message</span>
                  <textarea
                    rows="7"
                    id="message"
                    name="message"
                    placeholder="Tell us what you need help with"
                    className="field-input min-h-[180px] resize-none"
                    value={formState.message}
                    onChange={handleChange}
                    required
                  />
                </label>

                {errorMessage ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`primary-btn w-full sm:w-auto ${
                    isSubmitting ? "cursor-not-allowed opacity-60 hover:translate-y-0" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
