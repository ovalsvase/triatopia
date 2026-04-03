"use client";

import { motion } from "framer-motion";

export default function TriatopiaLogo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '20px 0' }}>
      <motion.svg
        width="160"
        height="160"
        viewBox="-100 -100 200 200"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ rotate: -10, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 2, type: "spring", bounce: 0.3 }}
        style={{ filter: "drop-shadow(0 0 15px rgba(0, 240, 255, 0.4))" }}
      >
        {/* Outer Circle */}
        <motion.circle 
          cx="0" cy="0" r="70" 
          fill="none" 
          stroke="var(--color-neon-cyan)" 
          strokeWidth="3" 
          strokeDasharray="440"
          initial={{ strokeDashoffset: 440 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        
        {/* Overlapping Triangle: vertices at top-left, top-right, bottom */}
        {/* R = 85 to go slightly outside r=70 circle */}
        <motion.polygon 
          points="-73.6,-42.5 73.6,-42.5 0,85"
          fill="none" 
          stroke="var(--color-emerald)" 
          strokeWidth="3" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
        />

        {/* Center node */}
        <motion.circle 
          cx="0" cy="0" r="4" 
          fill="var(--color-amber-gold)" 
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1], filter: ["blur(0px)", "blur(4px)", "blur(0px)"] }}
          transition={{ delay: 2, duration: 1, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Inner Connections (Y shape) */}
        <motion.g 
          stroke="var(--color-amber-gold)" 
          strokeWidth="2" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
        >
          <line x1="0" y1="0" x2="-73.6" y2="-42.5" />
          <line x1="0" y1="0" x2="73.6" y2="-42.5" />
          <line x1="0" y1="0" x2="0" y2="85" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
