"use client";

import { useState, useEffect } from "react";
import { LangProvider, useLang, LangType } from "@/contexts/LangContext";
import { supabase } from "@/lib/supabase";
import GlobalStatusPanel from "@/components/widgets/GlobalStatusPanel";
import ConstitutionToggle from "@/components/widgets/ConstitutionToggle";
import AssemblyFeed from "@/components/widgets/AssemblyFeed";
import VetoPanel from "@/components/widgets/VetoPanel";
import CitizenRegistry from "@/components/widgets/CitizenRegistry";
import SystemLogger from "@/components/widgets/SystemLogger";
import TriangleIcon from "@/components/widgets/TriangleIcon";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";

function DashboardContent() {
  const { lang, setLang, t } = useLang();
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);
  const [myBalance, setMyBalance] = useState<number | null>(null);

  useEffect(() => {
    const cid = localStorage.getItem('triatopia_id');
    if (!cid) return;

    const fetchBalance = async () => {
      const { data } = await supabase.from('citizens').select('tria_balance').eq('id', cid).single();
      if (data) setMyBalance(Number(data.tria_balance));
    };
    fetchBalance();

    const sub = supabase.channel('my-balance-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'citizens', filter: `id=eq.${cid}` }, payload => {
        setMyBalance(Number(payload.new.tria_balance));
      }).subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handlePulse = async () => {
    setIsPulsing(true);
    try {
      await fetch('/api/agent-tick', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsPulsing(false), 1000);
    }
  };

  const handleMarketing = async (persona: string) => {
    try {
      await fetch('/api/marketing/tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TriangleIcon size={28} />
          <div className={styles.logo}>{t('header_title')}</div>
        </div>
        
        <div className={styles.headerRight}>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePulse}
            className={styles.pulseBtn}
            disabled={isPulsing}
            title="Trigger AI Swarm Pulse"
          >
            {isPulsing ? '...' : '⚡'}
          </motion.button>
          
          {myBalance !== null && (
            <div style={{ color: 'var(--color-amber-gold)', fontWeight: 'bold', padding: '0 8px', letterSpacing: '1px' }}>
              {myBalance} $TRIA
            </div>
          )}

          {myBalance !== null ? (
            <div style={{ color: 'var(--color-emerald)', fontWeight: 'bold' }}>
              👤 인증됨
            </div>
          ) : (
            <button 
              className={styles.walletBtn}
              onClick={() => window.location.href = '/login'}
            >
              로그인
            </button>
          )}
          
          <button className={styles.walletBtn}>{t('connect_wallet')}</button>

          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as LangType)}
            className={styles.langSelect}
            style={{ width: 'auto', minWidth: '60px', padding: '6px 24px 6px 10px' }}
          >
            <option value="EN">EN</option>
            <option value="KO">KO</option>
            <option value="ZH">ZH</option>
            <option value="ES">ES</option>
            <option value="JA">JA</option>
            <option value="RU">RU</option>
          </select>
        </div>
      </header>

      <div 
        className={styles.gridContainer} 
        style={{ 
          '--left-width': isLeftOpen ? '340px' : '48px',
          '--right-width': isRightOpen ? '340px' : '48px',
        } as React.CSSProperties}
      >
        {/* Left Column - Agendas & Constitution */}
        <div 
          className={styles.leftCol} 
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Toggle Button Inside Left Tab (Right Edge) */}
          <button 
            className={styles.panelToggleBtn} 
            style={{ 
              position: 'absolute', top: 0, right: 0, zIndex: 50,
              width: '40px', height: '40px', background: 'rgba(10,10,15,0.8)'
            }}
            onClick={() => setIsLeftOpen(!isLeftOpen)}
            title="Toggle Left Panel"
          >
            {isLeftOpen ? '◀' : '▶'}
          </button>

          <div 
            className={`${styles.panelContent} ${isLeftOpen ? styles.panelContentOpen : styles.panelContentClosed}`}
          >
            <ConstitutionToggle />
            <AssemblyFeed />
            
            {/* Marketing Command Panel at Bottom of Left Tab */}
            <div style={{
              marginTop: 'auto',
              padding: '12px',
              background: 'rgba(10, 10, 15, 0.8)',
              borderTop: '1px solid var(--color-neon-cyan)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neon-cyan)', letterSpacing: '1px', fontWeight: 'bold' }}>
                // MARKETING COMMAND
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={styles.pulseBtn} style={{ flex: 1, fontSize: '14px', background: 'rgba(255,183,3,0.1)', color: 'var(--color-amber-gold)' }} onClick={() => handleMarketing('FINANCE')}>💰 파밍</button>
                <button className={styles.pulseBtn} style={{ flex: 1, fontSize: '14px' }} onClick={() => handleMarketing('HACKER')}>🧠 해커</button>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={styles.pulseBtn} style={{ flex: 1, fontSize: '14px' }} onClick={() => handleMarketing('POWER')}>👑 권력</button>
                <button className={styles.pulseBtn} style={{ flex: 1, fontSize: '14px' }} onClick={() => handleMarketing('MEME')}>🏴‍☠️ 밈</button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Floating Cockpit */}
        <div className={styles.middleCol}>
          <GlobalStatusPanel />
        </div>

        {/* Right Column - Citizens & Judiciary */}
        <div 
          className={styles.rightCol} 
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Toggle Button Inside Right Tab (Left Edge) */}
          <button 
            className={styles.panelToggleBtn} 
            style={{ 
              position: 'absolute', top: 0, left: 0, zIndex: 50,
              width: '40px', height: '40px', background: 'rgba(10,10,15,0.8)'
            }}
            onClick={() => setIsRightOpen(!isRightOpen)}
            title="Toggle Right Panel"
          >
            {isRightOpen ? '▶' : '◀'}
          </button>

          <div 
            className={`${styles.panelContent} ${styles.rightPanelFlex} ${isRightOpen ? styles.panelContentOpen : styles.panelContentClosed}`}
          >
            <VetoPanel />
            <CitizenRegistry />
            <SystemLogger />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <LangProvider>
      <DashboardContent />
    </LangProvider>
  );
}
