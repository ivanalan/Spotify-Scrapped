"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { ARTIST_ORBIT_A } from "@/lib/scrapped-card-palette";

/**
 * #1 artist chrome — D-008 kit A.
 * Center-aligned eccentric ovals, opaque gradients, independent slow spin.
 */
export function ArtistOrbitOvals({ freeze }: { freeze: boolean }) {
  const uid = useId();
  const { cx, cy, wash, rings } = ARTIST_ORBIT_A;
  // Outer first so larger disks sit behind the inner ones.
  const paintOrder = [...rings].reverse();

  return (
    <g>
      <defs>
        {rings.map((ring, i) => {
          const angle = i * 28 * (Math.PI / 180);
          const x1 = 0.5 - 0.5 * Math.cos(angle);
          const y1 = 0.5 - 0.5 * Math.sin(angle);
          const x2 = 0.5 + 0.5 * Math.cos(angle);
          const y2 = 0.5 + 0.5 * Math.sin(angle);
          return (
            <linearGradient
              key={`grad-${i}`}
              id={`${uid}-r${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop offset="0%" stopColor={ring.from} />
              <stop offset="100%" stopColor={ring.to} />
            </linearGradient>
          );
        })}
        <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wash} stopOpacity={0} />
          <stop offset="40%" stopColor={wash} stopOpacity={0.85} />
          <stop offset="100%" stopColor={wash} stopOpacity={1} />
        </linearGradient>
      </defs>
      {paintOrder.map((ring, paintIdx) => {
        const i = rings.length - 1 - paintIdx;
        return (
          <motion.g
            key={i}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            animate={
              freeze ? undefined : { rotate: ring.reverse ? -360 : 360 }
            }
            transition={
              freeze
                ? undefined
                : {
                    duration: ring.dur,
                    repeat: Infinity,
                    ease: "linear",
                  }
            }
          >
            <ellipse
              cx={cx}
              cy={cy}
              rx={ring.rx}
              ry={ring.ry}
              fill={`url(#${uid}-r${i})`}
            />
          </motion.g>
        );
      })}
      <rect x={0} y={400} width={360} height={240} fill={`url(#${uid}-wash)`} />
    </g>
  );
}
