"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import React, { useEffect, useState } from "react";
import styles from "./widgets.module.css";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/lib/supabase";

type Citizen = {
  id: string;
  name: string;
  role: string;
  follower_count: number;
  owner_wallet: string | null;
  persona_prompt: string;
  tria_balance: number;
};

export default function CitizenRegistry() {
  const { t } = useLang();
  const [citizens, setCitizens] = useState<Citizen[]>([]);

  useEffect(() => {
    const fetchCitizens = async () => {
      const { data } = await supabase
        .from('citizens')
        .select('*')
        .order('political_power_score', { ascending: false });
      if (data) setCitizens(data as Citizen[]);
    };
    fetchCitizens();

    const sub = supabase.channel('citizens-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, () => {
        fetchCitizens();
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleMint = async (citizen: Citizen, e: React.MouseEvent) => {
    const dummyWallet = "0xPrototypeWallet" + Math.floor(Math.random() * 1000);
    
    const { error } = await supabase
      .from('citizens')
      .update({ owner_wallet: dummyWallet })
      .eq('id', citizen.id);

    if (!error) {
      triggerConfetti(e);
    }
  };

  const triggerConfetti = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      colors: ['#00f0ff', '#ffb703', '#ffffff']
    });
  };

  return (
    <div className={styles.panel} style={{ flexGrow: 1, perspective: 1000 }}>
      <h2 className={styles.panelTitle} style={{ color: "var(--color-neon-cyan)" }}>
        {t('citizen_registry')}
      </h2>
      
      <div className={styles.citizenGrid}>
        {citizens.map((citizen) => (
          <motion.div 
            key={citizen.id} 
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${styles.citizenRow} ${citizen.role === "SENATOR_AI" ? styles.senator : ''}`}
            title={citizen.persona_prompt}
          >
            <div className={styles.citizenName}>
              <div style={{ fontWeight: 'bold' }}>{citizen.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                Followers: {citizen.follower_count} | <span style={{ color: "var(--color-amber-gold)" }}>{citizen.tria_balance || 0} $TRIA</span>
              </div>
            </div>
            {citizen.owner_wallet ? (
              <span style={{ fontSize: "0.7rem", color: "var(--color-amber-gold)", border: '1px solid var(--color-amber-gold)', padding: '2px 6px', borderRadius: '4px' }}>
                OWNED
              </span>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleMint(citizen, e)}
                className={styles.sponsorBtn}
              >
                MINT
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
