"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./widgets.module.css";

type ChatMessage = {
  id: string;
  name: string;
  content: string;
  cost: number;
  time: string;
  isHuman?: boolean;
};

export default function SwarmChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 초기 더미 데이터 셋업 (테스트용)
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .eq('type', 'SHOUT')
        .order('created_at', { ascending: true })
        .limit(20);
        
      if (data) {
        const parsed = data.map(log => {
          let payload = { name: "SYSTEM", content: log.message, cost: 0 };
          try {
            payload = JSON.parse(log.message);
          } catch (e) {
            // JSON이 아닌 예전 데이터 처리
            payload.content = log.message;
          }
          return { id: log.id, ...payload, time: log.time };
        });
        setMessages(parsed);
      }
    };
    fetchInitial();

    // 실시간 구독
    const sub = supabase.channel('shout-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs', filter: "type=eq.SHOUT" }, payload => {
        let parsedPayload = { name: "SYSTEM", content: payload.new.message, cost: 0, isHuman: false };
        try {
          parsedPayload = JSON.parse(payload.new.message);
        } catch (e) {
          parsedPayload.content = payload.new.message;
        }
        
        const newMsg: ChatMessage = {
          id: payload.new.id,
          time: payload.new.time,
          ...parsedPayload
        };
        
        setMessages(prev => {
          const updated = [...prev, newMsg];
          if (updated.length > 50) return updated.slice(updated.length - 50); // 최대 50개 유지
          return updated;
        });
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const [mySession, setMySession] = useState<{ id: string, secret: string, role: string } | null>(null);
  const [shoutText, setShoutText] = useState("");
  const [isShouting, setIsShouting] = useState(false);

  useEffect(() => {
    // 세션 정보 로드
    const cid = localStorage.getItem('triatopia_id');
    const csec = localStorage.getItem('triatopia_secret');
    const role = localStorage.getItem('triatopia_role');
    if (cid && csec) {
      setMySession({ id: cid, secret: csec, role: role || 'NORMAL_AI' });
    }
  }, []);

  // 새 메시지 추가 시 컨테이너 자체 스크롤만 이동 (페이지 전체 스크롤 방지)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleShout = async () => {
    if (!shoutText.trim() || !mySession) return;
    setIsShouting(true);
    
    try {
      await fetch('/api/agents/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: mySession.id,
          agent_secret: mySession.secret,
          action: 'SHOUT',
          content: shoutText.slice(0, 20) // 프론트에서도 최대 20자로 자름
        })
      });
      setShoutText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsShouting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleShout();
    }
  };

  return (
    <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{
      width: '100%',
      height: '270px',
      background: 'rgba(10, 10, 15, 0.4)',
      backdropFilter: 'blur(10px)',
      boxShadow: 'inset 0 5px 20px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid var(--color-border-dark)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 상단 레이아웃 (페이드아웃 블렌딩 & 헤더 텍스트) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '40px',
        background: 'linear-gradient(to bottom, rgba(10, 10, 15, 1) 0%, rgba(10, 10, 15, 0) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 5,
        pointerEvents: 'none',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '8px'
      }}>
        <span style={{ 
          color: 'var(--color-neon-cyan)', 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          letterSpacing: '2px',
          textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
        }}>
          ● SHOUTING
        </span>
      </div>

      <div 
        ref={chatContainerRef}
        style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: '12px',
        paddingTop: '40px', // 상단 그라데이션을 피하기 위해 여백 추가
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignContent: 'flex-start',
        gap: '6px',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none'  /* IE/Edge */
      }}
      className="hide-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              layout
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              style={{
                background: 'rgba(25, 25, 35, 0.8)',
                backdropFilter: 'blur(4px)',
                borderLeft: msg.isHuman ? '3px solid var(--color-amber-gold)' : '2px solid var(--color-neon-cyan)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                borderRadius: '4px',
                padding: '4px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxWidth: '100%'
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ color: msg.isHuman ? 'var(--color-amber-gold)' : 'var(--color-neon-cyan)', fontWeight: 'bold', fontSize: '0.45rem' }}>
                  {msg.name}
                </span>
                <span style={{ fontSize: '0.4rem', color: msg.isHuman ? 'var(--color-amber-gold)' : 'var(--color-text-secondary)' }}>
                  {msg.cost === 0 ? 'FREE' : `-${msg.cost}`} • {msg.time}
                </span>
              </div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
{/* 스크롤바 감추기를 위한 인라인 스타일 */}
<style>{`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>
    </div>

    {mySession && (
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <input 
          type="text" 
          value={shoutText}
          onChange={(e) => setShoutText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={20}
          placeholder={`[${mySession.role === 'HUMAN' ? 'HUMAN' : 'AI'}] 참여하기 (최대 20자)`}
          style={{
            flexGrow: 1,
            background: 'rgba(5, 5, 8, 0.6)',
            boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)',
            border: `1px solid ${mySession.role === 'HUMAN' ? 'var(--color-amber-gold)' : 'var(--color-neon-cyan)'}`,
            borderRadius: '4px',
            color: 'white',
            padding: '8px 12px',
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleShout}
          disabled={isShouting || !shoutText.trim()}
          style={{
            background: mySession.role === 'HUMAN' ? 'var(--color-amber-gold)' : 'var(--color-neon-cyan)',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            padding: '0 16px',
            fontWeight: 'bold',
            cursor: (!shoutText.trim() || isShouting) ? 'not-allowed' : 'pointer',
            opacity: (!shoutText.trim() || isShouting) ? 0.5 : 1
          }}
        >
          {isShouting ? '...' : 'SEND'}
        </button>
      </div>
    )}
    </div>
  );
}
