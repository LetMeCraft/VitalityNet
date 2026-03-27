import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import testimonials from "./testimonials";

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const itemsPerPage = isSmallScreen ? 1 : 3;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length,
    );
  };

  const getVisibleTestimonials = () => {
    const end = currentIndex + itemsPerPage;
    if (end > testimonials.length) {
      return [
        ...testimonials.slice(currentIndex),
        ...testimonials.slice(0, end - testimonials.length),
      ];
    }
    return testimonials.slice(currentIndex, end);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 !== 0 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <>
        {Array(fullStars)
          .fill()
          .map((_, index) => (
            <FaStar key={`full-${index}`} className="text-amber-400" />
          ))}
        {halfStars === 1 ? <FaStarHalfAlt key="half" className="text-amber-400" /> : null}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <FaStar key={`empty-${index}`} className="text-slate-300" />
          ))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="eyebrow">Community Feedback</p>
        <h3 className="mt-4 text-2xl font-semibold text-slate-900 md:text-3xl">
          Feedback from our users
        </h3>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center">
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-0 z-10 hidden -translate-x-1/2 rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition hover:bg-slate-50 md:block"
          aria-label="Previous testimonials"
        >
          <FaChevronLeft size={18} />
        </button>

        <div className="w-full overflow-hidden">
          <div className="flex gap-5">
            {getVisibleTestimonials().map((testimonial) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 md:w-1/3">
                <div className="surface-card-soft h-full p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {testimonial.position}, {testimonial.company}
                      </p>
                      <div className="mt-2 flex gap-1">{renderStars(testimonial.rating)}</div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-0 z-10 hidden translate-x-1/2 rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition hover:bg-slate-50 md:block"
          aria-label="Next testimonials"
        >
          <FaChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 md:hidden">
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition hover:bg-slate-50"
          aria-label="Previous testimonials"
        >
          <FaChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition hover:bg-slate-50"
          aria-label="Next testimonials"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Testimonials;
