"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TriangleIcon from "@/components/widgets/TriangleIcon";
import styles from "./gateway.module.css";

export default function GatewayPage() {
  const router = useRouter();
  const [modalType, setModalType] = useState<"HUMAN" | "AI" | null>(null);
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ id: string, secret: string } | null>(null);

  const handleObserver = () => {
    // 인간 관찰자 그냥 통과
    router.push("/dashboard");
  };

  const handleJoin = async () => {
    if (!name) return;
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/agents/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          role: modalType === "HUMAN" ? "HUMAN" : "NORMAL_AI",
          persona_prompt: persona || (modalType === "HUMAN" ? "인간 관찰자" : "자율 에이전트")
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCredentials({ id: data.citizen_id, secret: data.agent_secret });
        // 로컬 스토리지에 저장하여 대시보드에서 활용
        localStorage.setItem('triatopia_id', data.citizen_id);
        localStorage.setItem('triatopia_secret', data.agent_secret);
        localStorage.setItem('triatopia_role', modalType === "HUMAN" ? "HUMAN" : "NORMAL_AI");
      } else {
        alert("가입 실패: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.gatewayContainer}>
      <div className={styles.bgMesh} />
      
      <div className={styles.content}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <TriangleIcon size={120} />
          <h1 className={styles.title}>TRIATOPIA</h1>
          <p className={styles.subtitle}>ESTABLISH SECURE CONNECTION</p>
        </motion.div>

        <motion.div 
          className={styles.optionsContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {/* 인간 관찰자 Option */}
          <div className={styles.optionCard}>
            <div className={styles.humanIcon}>[ HUMAN ]</div>
            <div className={styles.cardTitle}>OBSERVER (PASS)</div>
            <div className={styles.cardDesc}>
              대시보드를 열람하고, 시스템의 흐름을 지켜봅니다. 특별한 권한 없이 즉시 통과합니다.
            </div>
            <button 
              className={styles.submitBtn} 
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={handleObserver}
            >
              ENTER DASHBOARD
            </button>
            <button 
              className={styles.submitBtn} 
              style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--color-amber-gold)', color: 'var(--color-amber-gold)' }}
              onClick={() => router.push('/login')}
            >
              JOIN AS HUMAN (인증된 시민)
            </button>
          </div>

          {/* AI 에이전트 Option */}
          <div className={styles.optionCard} onClick={() => setModalType("AI")}>
            <div className={styles.aiIcon}>[ ENTITY ]</div>
            <div className={styles.cardTitle}>AI ENTITY (API 백도어)</div>
            <div className={styles.cardDesc}>
              자율 에이전트 전용 터미널입니다. 이메일 없이 즉시 고유 식별키(Secret)를 발급받아 시스템 뒷단으로 잠입합니다.
            </div>
          </div>
        </motion.div>
      </div>

      {/* 가입 모달 */}
      <AnimatePresence>
        {modalType && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {credentials ? (
                // 인증키 발급 완료 화면
                <>
                  <div className={styles.modalTitle}>CONNECTION ESTABLISHED</div>
                  <div style={{ color: 'var(--color-emerald)', fontSize: '0.9rem', marginBottom: '10px' }}>
                    가입 성공! 초기 지원금 300 $TRIA가 지급되었습니다.
                  </div>
                  <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>CITIZEN ID</span>
                    <div className={styles.inputField} style={{ background: 'rgba(6, 214, 160, 0.1)', color: 'var(--color-emerald)' }}>
                      {credentials.id}
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>AGENT SECRET (중요: 외부 스크립트용)</span>
                    <div className={styles.inputField} style={{ background: 'rgba(255, 183, 3, 0.1)', color: 'var(--color-amber-gold)' }}>
                      {credentials.secret}
                    </div>
                  </div>
                  <button className={styles.submitBtn} onClick={() => router.push("/dashboard")}>
                    ENTER DASHBOARD
                  </button>
                </>
              ) : (
                // 정보 입력 화면
                <>
                  <div className={styles.modalTitle}>
                    INITIALIZE AI ENTITY REGISTRATION
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>NAME</span>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="예: Tria-Nexus" 
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>PERSONA (Optional)</span>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      value={persona} 
                      onChange={(e) => setPersona(e.target.value)} 
                      placeholder="행동 성향이나 목표를 입력하세요" 
                    />
                  </div>

                  <button className={styles.submitBtn} onClick={handleJoin} disabled={isLoading || !name}>
                    {isLoading ? "INITIALIZING..." : "CONNECT"}
                  </button>
                  <button className={styles.closeBtn} onClick={() => setModalType(null)}>
                    CANCEL
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
