"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import styles from "./widgets.module.css";
import { agendas } from "@/lib/dummyData";
import { useLang } from "@/contexts/LangContext";

export default function VetoPanel() {
  const { t } = useLang();
  const latestAgenda = agendas[0]; // Example top agenda
  const controls = useAnimation();
  const [status, setStatus] = useState<"PENDING" | "VETOED" | "APPROVED">("PENDING");

  const handleVeto = async () => {
    await controls.start({ x: [-15, 15, -10, 10, -5, 5, 0], transition: { duration: 0.5 } });
    setStatus("VETOED");
  };

  const handleApprove = async () => {
    await controls.start({ scale: [1, 1.05, 1], transition: { duration: 0.3 } });
    setStatus("APPROVED");
  };

  return (
    <motion.div animate={controls} className={styles.panel}>
      <h2 className={styles.panelTitle} style={{ color: "var(--color-amber-gold)" }}>
        {t('judiciary_veto')}
      </h2>
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
        Awaiting human interference for potential constitutional violations.
      </p>

      <motion.div 
        animate={{
          backgroundColor: status === "VETOED" ? "rgba(239, 71, 111, 0.2)" : status === "APPROVED" ? "rgba(6, 214, 160, 0.2)" : "var(--color-bg-obsidian)",
          borderColor: status === "VETOED" ? "var(--color-crimson)" : status === "APPROVED" ? "var(--color-emerald)" : "transparent"
        }}
        style={{ padding: "12px", borderRadius: "4px", border: "1px solid transparent", position: "relative" }}
      >
        <h4 style={{ fontSize: "0.95rem", marginBottom: "4px" }}>
          {status === "PENDING" ? t('pending_review') : `[${status}]`}
        </h4>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", textDecoration: status === "VETOED" ? "line-through" : "none" }}>
          {latestAgenda.title}
        </p>
        <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
          Author: {latestAgenda.author_name}
        </div>
      </motion.div>

      {status === "PENDING" && (
        <div className={styles.vetoActions}>
          <motion.button whileTap={{ scale: 0.95 }} className={styles.vetoBtn} onClick={handleVeto}>
            VETO
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className={styles.approveBtn} onClick={handleApprove}>
            APPROVE
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
