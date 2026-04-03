"use client";

import { motion, Variants } from "framer-motion";
import React, { useEffect, useState } from "react";
import styles from "./widgets.module.css";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/lib/supabase";

type Agenda = {
  id: string;
  author_name: string;
  title: string;
  content: string;
  status: string;
  votes_for: number;
  votes_against: number;
  time_remaining: string;
  is_sponsored: boolean;
};

export default function AssemblyFeed() {
  const { t } = useLang();
  const [agendas, setAgendas] = useState<Agenda[]>([]);

  const fetchAgendas = async () => {
    const { data } = await supabase.from('agendas').select('*').order('votes_for', { ascending: false });
    if (data) setAgendas(data as Agenda[]);
  };

  useEffect(() => {
    fetchAgendas();

    const sub = supabase.channel('assembly-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agendas' }, () => {
        fetchAgendas();
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleVote = async (id: string, isFor: boolean) => {
    const agenda = agendas.find(a => a.id === id);
    if (!agenda) return;

    await supabase
      .from('agendas')
      .update({
        votes_for: isFor ? agenda.votes_for + 1 : agenda.votes_for,
        votes_against: !isFor ? agenda.votes_against + 1 : agenda.votes_against
      })
      .eq('id', id);
  };

  const newAgendas = agendas.filter(a => a.status === "PROPOSED" || a.status === "NEW");
  const tabledAgendas = agendas.filter(a => a.status === "TABLED" || a.status === "PASSED");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const AgendaCard = ({ agenda }: { agenda: Agenda }) => (
    <motion.div 
      variants={itemVariants} 
      className={`${styles.agendaCard} ${agenda.is_sponsored ? styles.sponsored : ''}`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.authorName}>{agenda.author_name}</span>
        <span style={{ fontSize: '0.7rem', color: agenda.status === "PROPOSED" ? "var(--color-neon-cyan)" : "var(--color-text-secondary)" }}>
          [{agenda.status}]
        </span>
      </div>
      <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '4px' }}>{agenda.title}</h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
        {agenda.content}
      </p>
      
      <div className={styles.metrics} style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleVote(agenda.id, true)}
            style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid var(--color-emerald)', color: 'var(--color-emerald)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            FOR {agenda.votes_for}
          </button>
          <button 
            onClick={() => handleVote(agenda.id, false)}
            style={{ background: 'rgba(239,71,111,0.1)', border: '1px solid var(--color-crimson)', color: 'var(--color-crimson)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            AGAINST {agenda.votes_against}
          </button>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-amber-gold)' }}>
          {agenda.time_remaining}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontFamily: "var(--font-playfair)", color: "var(--color-neon-cyan)", marginBottom: "0.75rem", fontSize: '1rem' }}>
          {t('new_proposals')}
        </h3>
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {newAgendas.map((agenda) => (
            <AgendaCard key={agenda.id} agenda={agenda} />
          ))}
        </motion.div>
      </div>

      <div>
        <h3 style={{ fontFamily: "var(--font-playfair)", color: "var(--color-amber-gold)", marginBottom: "0.75rem", fontSize: '1rem' }}>
          {t('history_agendas')}
        </h3>
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {tabledAgendas.map((agenda) => (
            <AgendaCard key={agenda.id} agenda={agenda} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
