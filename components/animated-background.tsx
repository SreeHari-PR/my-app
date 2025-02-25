"use client"

import { motion } from "framer-motion"

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${50 + i * 10}% ${50 + i * 10}%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`,
            transform: `scale(${1 + i * 0.2})`,
          }}
          animate={{
            scale: [1 + i * 0.2, 1.2 + i * 0.2, 1 + i * 0.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

