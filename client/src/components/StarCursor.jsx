import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const TRAIL_COUNT = 10;

const StarCursor = () => {
  const location = useLocation();
  const [enabled, setEnabled] = useState(false);
  const segmentRefs = useRef([]);
  const frameRef = useRef(null);
  const stateRef = useRef({
    headX: 0,
    headY: 0,
    targetX: 0,
    targetY: 0,
    visible: false,
    points: Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 })),
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(pointer:fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!mediaQuery.matches || reducedMotionQuery.matches) {
      return undefined;
    }

    setEnabled(true);
    document.body.classList.add("star-cursor-active");

    const animate = () => {
      const state = stateRef.current;
      state.headX += (state.targetX - state.headX) * 0.24;
      state.headY += (state.targetY - state.headY) * 0.24;

      let followX = state.headX;
      let followY = state.headY;

      state.points.forEach((point, index) => {
        const ease = Math.max(0.14, 0.34 - index * 0.03);
        point.x += (followX - point.x) * ease;
        point.y += (followY - point.y) * ease;
        followX = point.x;
        followY = point.y;
      });

      state.points.forEach((point, index) => {
        const segment = segmentRefs.current[index];
        if (!segment) {
          return;
        }

        const opacity = state.visible ? Math.max(0.08, 0.84 - index * 0.09) : 0;
        const scale = Math.max(0.34, 1 - index * 0.08);

        segment.style.opacity = String(opacity);
        segment.style.transform =
          `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) scale(${scale})`;
      });

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handleMove = (event) => {
      const state = stateRef.current;

      if (!state.visible) {
        state.headX = event.clientX;
        state.headY = event.clientY;
        state.points.forEach((point) => {
          point.x = event.clientX;
          point.y = event.clientY;
        });
      }

      state.targetX = event.clientX;
      state.targetY = event.clientY;
      state.visible = true;
    };

    const handleLeave = () => {
      stateRef.current.visible = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove("star-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleMove);
      document.removeEventListener("mouseleave", handleLeave);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`star-cursor-layer ${
        location.pathname === "/profile" ? "cursor-theme-profile" : "cursor-theme-default"
      }`}
    >
      {Array.from({ length: TRAIL_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(element) => {
            segmentRefs.current[index] = element;
          }}
          className="cursor-tail-dot"
        />
      ))}
    </div>
  );
};

export default StarCursor;
