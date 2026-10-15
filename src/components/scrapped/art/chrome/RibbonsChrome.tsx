"use client";

import { motion, useReducedMotion } from "motion/react";

/** SVG gradient ribbons drifting around the frame — closest to Wrapped ribbons. */
export function RibbonsChrome() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 bg-[#2a1458]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="art-ribbon-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d8d" />
            <stop offset="45%" stopColor="#ffc93c" />
            <stop offset="100%" stopColor="#3de0ff" />
          </linearGradient>
          <linearGradient id="art-ribbon-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b44dff" />
            <stop offset="50%" stopColor="#ff6b3d" />
            <stop offset="100%" stopColor="#ffe66d" />
          </linearGradient>
          <linearGradient id="art-ribbon-c" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3de0ff" />
            <stop offset="55%" stopColor="#ff4d8d" />
            <stop offset="100%" stopColor="#7cff6b" />
          </linearGradient>
        </defs>

        <motion.path
          d="M-40 120 C 40 40, 120 200, 200 80 S 340 20, 420 140"
          fill="none"
          stroke="url(#art-ribbon-a)"
          strokeWidth="56"
          strokeLinecap="round"
          opacity={0.92}
          style={{ originX: "50%", originY: "40%" }}
          animate={
            reduce
              ? undefined
              : { rotate: [0, 8, -4, 0], y: [0, -12, 8, 0] }
          }
          transition={
            reduce
              ? undefined
              : { duration: 14, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.path
          d="M-60 360 C 80 280, 160 420, 260 300 S 380 240, 460 380"
          fill="none"
          stroke="url(#art-ribbon-b)"
          strokeWidth="72"
          strokeLinecap="round"
          opacity={0.85}
          style={{ originX: "40%", originY: "55%" }}
          animate={
            reduce
              ? undefined
              : { rotate: [0, -10, 6, 0], x: [0, 10, -6, 0] }
          }
          transition={
            reduce
              ? undefined
              : { duration: 18, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.path
          d="M-20 540 C 100 480, 180 620, 300 500 S 400 460, 440 580"
          fill="none"
          stroke="url(#art-ribbon-c)"
          strokeWidth="48"
          strokeLinecap="round"
          opacity={0.88}
          style={{ originX: "60%", originY: "80%" }}
          animate={
            reduce
              ? undefined
              : { rotate: [0, 6, -8, 0], scale: [1, 1.06, 0.98, 1] }
          }
          transition={
            reduce
              ? undefined
              : { duration: 16, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.ellipse
          cx="300"
          cy="160"
          rx="36"
          ry="28"
          fill="#ffe66d"
          opacity={0.75}
          animate={
            reduce ? undefined : { y: [0, 14, -8, 0], x: [0, -6, 4, 0] }
          }
          transition={
            reduce
              ? undefined
              : { duration: 11, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.ellipse
          cx="70"
          cy="480"
          rx="28"
          ry="22"
          fill="#ff4d8d"
          opacity={0.7}
          animate={
            reduce ? undefined : { y: [0, -10, 12, 0], x: [0, 8, -4, 0] }
          }
          transition={
            reduce
              ? undefined
              : { duration: 13, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </svg>
      {/* Soft vignette so opener copy stays readable */}
      <div className="absolute inset-[12%] rounded-xl bg-white/88 backdrop-blur-[2px]" />
    </div>
  );
}
