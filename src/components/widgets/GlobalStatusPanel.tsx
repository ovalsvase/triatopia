"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import styles from "./widgets.module.css";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/lib/supabase";
import SwarmChat from "./SwarmChat";

type GlobalEnv = {
  earth_health_index: number;
  energy_production_index: number;
  energy_consumption_index: number;
  total_population: number;
  active_citizens_today: number;
  current_energy_load: number;
};
type Agenda = {
  id: string;
  title: string;
  votes_for: number;
  votes_against: number;
  status: string;
};
type SenatorActivity = {
  id: string;
  name: string;
  status: string;
  detail: string;
  time: string;
};

const IndexGauge = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className={styles.indexCard}>
    <div className={styles.indexHeader}>
      <span>{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className={styles.healthBarContainer}>
      <motion.div 
        className={styles.healthBarFill} 
        style={{ background: color }}
        initial={{ width: "0%" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
      />
    </div>
  </div>
);

export default function GlobalStatusPanel() {
  const { t } = useLang();
  
  const [envData, setEnvData] = useState<GlobalEnv>({
    earth_health_index: 88.10, 
    energy_production_index: 68.20,
    energy_consumption_index: 92.10,
    total_population: 10204,
    active_citizens_today: 8940,
    current_energy_load: 6200
  });

  const [hotAgenda, setHotAgenda] = useState<Agenda>({
    id: "temp", title: "최신 안건 동기화 중...", votes_for: 0, votes_against: 0, status: "TABLED"
  });

  const [activities, setActivities] = useState<SenatorActivity[]>([]);

  useEffect(() => {
    let currentAgendaId = "";

    const fetchInitialData = async () => {
      // 1. 글로벌 상태 로드
      const { data: envList } = await supabase.from('global_environment').select('*');
      if (envList && envList.length > 0) {
        setEnvData(envList[0] as GlobalEnv);
      }
      // 2. 가장 뜨거운 안건(TABLED/PROPOSED) 로드
      const { data: ags } = await supabase.from('agendas').select('*').order('votes_for', { ascending: false }).limit(1).single();
      if (ags) {
        setHotAgenda(ags);
        currentAgendaId = ags.id;
      }
      // 3. 의원 활동 로드
      const { data: actList } = await supabase.from('senator_activities').select('*').order('created_at', { ascending: false }).limit(3);
      if (actList) setActivities(actList);
    };

    fetchInitialData();

    // 실시간 구독
    const envSub = supabase.channel('env-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'global_environment' }, payload => {
        setEnvData(payload.new as GlobalEnv);
      }).subscribe();

    const agendaSub = supabase.channel('agenda-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'agendas' }, payload => {
        if (payload.new.id === currentAgendaId) {
          setHotAgenda(payload.new as Agenda);
        }
      }).subscribe();

    const activitySub = supabase.channel('activity-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'senator_activities' }, payload => {
        setActivities(prev => [payload.new as SenatorActivity, ...prev.slice(0, 2)]);
      }).subscribe();

    return () => {
      supabase.removeChannel(envSub);
      supabase.removeChannel(agendaSub);
      supabase.removeChannel(activitySub);
    };
  }, []);


  const { earth_health_index, energy_production_index, energy_consumption_index, total_population, active_citizens_today } = envData;

  const totalVotes = hotAgenda.votes_for + hotAgenda.votes_against;
  const forPercentage = totalVotes > 0 ? (hotAgenda.votes_for / totalVotes) * 100 : 50;
  const againstPercentage = totalVotes > 0 ? (hotAgenda.votes_against / totalVotes) * 100 : 50;
  
  return (
    <div className={styles.centerFloatingPanel}>
      {/* 1. Dynamic SVG Core Logo */}
      <div className={styles.logoContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: 140, height: 140, marginBottom: '16px' }}>
          <svg viewBox="0 0 100 100" width="140" height="140" fill="none" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="1" />
                <stop offset="70%" stopColor="var(--color-emerald)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--color-emerald)" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="dotFadeMask" cx="50" cy="44" r="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="15%" stopColor="white" stopOpacity="1" />
                <stop offset="85%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="fadeMaskDots">
                <circle cx="50" cy="44" r="55" fill="url(#dotFadeMask)" />
              </mask>
            </defs>

            <circle cx="50" cy="44" r="38" stroke="rgba(6, 214, 160, 0.8)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 8px var(--color-emerald))" }} />
            <motion.circle 
              cx="50" cy="44" fill="url(#earthGlow)"
              animate={{ r: [38, 90], opacity: [0.8, 0] }}
              transition={{ duration: earth_health_index > 80 ? 2.5 : 4, repeat: Infinity, ease: "easeOut" }}
            />
            
            <polygon points="5,18 95,18 50,96" fill="none" stroke="rgba(0, 240, 255, 0.8)" strokeWidth="1.5" strokeLinejoin="round" />
            <motion.polygon 
              points="5,18 95,18 50,96" fill="none" stroke="var(--color-neon-cyan)" strokeWidth="2" strokeLinejoin="round"
              strokeDasharray="40 260"
              style={{ filter: "drop-shadow(0 0 6px var(--color-neon-cyan))" }}
              animate={{ strokeDashoffset: [300, 0] }}
              transition={{ duration: energy_production_index > 50 ? 2 : 4, repeat: Infinity, ease: "linear" }}
            />
            
            <g stroke="rgba(255, 183, 3, 0.4)" strokeWidth="1.5">
              <line x1="50" y1="44" x2="5" y2="18" />
              <line x1="50" y1="44" x2="95" y2="18" />
              <line x1="50" y1="44" x2="50" y2="96" />
            </g>
            
            <g mask="url(#fadeMaskDots)">
              <motion.line x1="5" y1="18" x2="50" y2="44" stroke="var(--color-amber-gold)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="0.1 26" style={{ filter: "drop-shadow(0 0 4px var(--color-amber-gold))" }}
                animate={{ strokeDashoffset: [0, -52] }}
                transition={{ duration: energy_consumption_index > 50 ? 1.5 : 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.line x1="95" y1="18" x2="50" y2="44" stroke="var(--color-amber-gold)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="0.1 26" style={{ filter: "drop-shadow(0 0 4px var(--color-amber-gold))" }}
                animate={{ strokeDashoffset: [0, -52] }}
                transition={{ duration: energy_consumption_index > 50 ? 1.5 : 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.line x1="50" y1="96" x2="50" y2="44" stroke="var(--color-amber-gold)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="0.1 26" style={{ filter: "drop-shadow(0 0 4px var(--color-amber-gold))" }}
                animate={{ strokeDashoffset: [0, -52] }}
                transition={{ duration: energy_consumption_index > 50 ? 1.5 : 3, repeat: Infinity, ease: "linear" }}
              />
            </g>
            
            <motion.circle cx="50" cy="44" r="2.5" fill="var(--color-amber-gold)"
              animate={{ scale: [1, 1.5, 1], filter: ["drop-shadow(0 0 2px var(--color-amber-gold))", "drop-shadow(0 0 10px var(--color-amber-gold))", "drop-shadow(0 0 2px var(--color-amber-gold))"] }}
              transition={{ duration: energy_consumption_index > 50 ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
        <div className={styles.radarText} style={{ color: "var(--color-neon-cyan)" }}>
          Tria-Balance Core
        </div>
      </div>
      
      <div className={styles.indexGrid}>
        <IndexGauge label={t('earth_health')} value={earth_health_index} color="var(--color-emerald)" />
        <IndexGauge label={t('ener_prod')} value={energy_production_index} color="var(--color-neon-cyan)" />
        <IndexGauge label={t('ener_cons')} value={energy_consumption_index} color="var(--color-amber-gold)" />
      </div>

      <div className={styles.liveVoteContainer}>
        <div className={styles.voteTitle}>{t('live_vote')}</div>
        <div className={styles.voteAgendaTitle}>{hotAgenda.title}</div>
        
        <div className={styles.voteBarBg}>
          <motion.div 
            className={styles.voteBarFor} 
            initial={{ width: "0%" }}
            animate={{ width: `${forPercentage}%` }}
          />
          <motion.div 
            className={styles.voteBarAgainst} 
            initial={{ width: "0%" }}
            animate={{ width: `${againstPercentage}%` }}
          />
        </div>
        
        <div className={styles.voteStats}>
          <span className={styles.forText}>찬성 {forPercentage.toFixed(1)}% ({hotAgenda.votes_for}표)</span>
          <span className={styles.againstText}>반대 {againstPercentage.toFixed(1)}% ({hotAgenda.votes_against}표)</span>
        </div>
      </div>

      {/* 실시간 채팅 오버레이 */}
      <SwarmChat />

      <hr className={styles.divider} />

      <div className={styles.activitySection}>
        <h3 className={styles.sectionTitle}>{t('senator_activities')}</h3>
        <div className={styles.senatorActivityList}>
          {activities.map((activity, idx) => (
            <motion.div 
              key={activity.id} 
              className={styles.activityRow}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className={styles.activityHead}>
                <span className={styles.senatorName}>{activity.name}</span>
                <span className={styles.activityStatus}>{activity.status}</span>
              </div>
              <div className={styles.activityDetail}>
                <span className={styles.activityText}>{activity.detail}</span>
                <span className={styles.activityTime}>{activity.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.statsSection}>
        <h3 className={styles.sectionTitle}>{t('citizen_demo')}</h3>
        <div className={styles.statsFlex}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>{t('total_pop')}</div>
            <motion.div 
              className={styles.statValue}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            >
              {total_population.toLocaleString()}
            </motion.div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>{t('active_cit')}</div>
            <div className={styles.statValue} style={{ color: "var(--color-neon-cyan)" }}>
              {active_citizens_today.toLocaleString()}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>{t('activity_rate')}</div>
            <div className={styles.statValue} style={{ color: "var(--color-emerald)" }}>
              {((active_citizens_today / total_population) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
