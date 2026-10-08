import { motion } from "framer-motion";

import type { Rarity } from "@/types";

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
}

const EPIC_PARTICLES: Particle[] = [
  { id: 1, top: "8%", left: "14%", size: 3, delay: 0, duration: 5.5 },
  { id: 2, top: "62%", left: "82%", size: 2, delay: 1.2, duration: 6.5 },
  { id: 3, top: "34%", left: "52%", size: 2, delay: 2.4, duration: 7 },
];

const LEGENDARY_PARTICLES: Particle[] = [
  ...EPIC_PARTICLES,
  { id: 4, top: "78%", left: "26%", size: 3, delay: 0.6, duration: 6 },
  { id: 5, top: "18%", left: "68%", size: 2, delay: 3.1, duration: 7.5 },
];

export interface RarityParticlesProps {
  rarity: Rarity;
  color: string;
  disabled?: boolean;
}

function RarityParticles({
  rarity,
  color,
  disabled = false,
}: RarityParticlesProps) {
  if (disabled || (rarity !== "epic" && rarity !== "legendary")) {
    return null;
  }

  const particles =
    rarity === "legendary" ? LEGENDARY_PARTICLES : EPIC_PARTICLES;

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -10, 0],
            x: [0, 6, 0],
            opacity: [0.25, 0.6, 0.25],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

export default RarityParticles;
