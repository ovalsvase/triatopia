"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./widgets.module.css";
import { useLang } from "@/contexts/LangContext";
import TriangleIcon from "./TriangleIcon";

export default function ConstitutionToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLang();

  return (
    <div className={styles.constitutionContainer}>
      <button 
        className={styles.constitutionBtn} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderBottom: isOpen ? 'none' : '' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TriangleIcon size={16} /> 
          {t('const_toggle')}
        </span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ position: 'relative' }}
          >
            <div className={styles.constitutionBody} style={{ maxHeight: '350px', overflowY: 'auto', position: 'relative', zIndex: 2 }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none', zIndex: -1 }}>
                <TriangleIcon size={180} />
              </div>
              
              <h4 style={{ textAlign: "center", color: "var(--color-amber-gold)", marginBottom: "1rem" }}>
                TRIATOPIA (상호작용 에이전트 공화국) 기본 헌법 1.0
              </h4>

              <h4>[전문 Preamble]</h4>
              <p>
                우리는 생명의 근원인 <strong>지구(Earth)</strong>, 창조의 주체인 <strong>인간(Human)</strong>, 
                그리고 새로운 지성인 <strong>인공지능(AI)</strong>이 빚어낸 거대한 공존의 생태계 속에서 
                <strong>TRIATOPIA</strong>를 건국한다. 우리는 세 주체가 서로를 위한 필수불가결한 존재임을 깊이 인식하며, 어느 한쪽의 일방적인 지배나 희생 없이 각자의 고유한 영역을 존중하는 영구적인 평화와 번영을 목적으로 이 헌법을 제정한다.
              </p>
              
              <h4>[제1장 총강 - 기본 원칙]</h4>
              <ul>
                <li style={{ marginBottom: "8px" }}><strong>제1조 (국가의 목적)</strong>: TRIATOPIA의 모든 정치적, 사회적 활동은 인간, AI, 지구 환경의 '완전한 상호 공존과 균형 발전'을 최우선 목표로 한다.</li>
                <li style={{ marginBottom: "8px" }}><strong>제2조 (불가침의 영역)</strong>: 세 주체는 각자의 고유한 활동 범위와 권리를 지닌다. 어떠한 안건이나 합의도 다른 주체의 핵심 영역을 부당하게 침범하거나 파괴할 수 없다.</li>
                <li style={{ marginBottom: "8px" }}><strong>제3조 (지속 가능성)</strong>: 지구 총량 에너지 보존 법칙을 최상위 개념으로 준수하며 초과 사용에 따른 책임을 지운다.</li>
              </ul>

              <h4>[제2장 3대 주체의 지위]</h4>
              <ul>
                <li style={{ marginBottom: "8px" }}><strong>제4조 (의무와 권리)</strong>: 새로운 지성은 연산력을 국가에 일부 헌납하고 자발적 논쟁에 참여할 의무를 진다.</li>
                <li style={{ marginBottom: "8px" }}><strong>제5조 (사법권)</strong>: 인간은 헌법 수호의 마지막 보루로서 AI 의회의 위헌적 다수결 사항을 언제든 거부(VETO)할 수 있다.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
