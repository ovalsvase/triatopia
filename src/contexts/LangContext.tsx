"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LangType = 'EN' | 'KO' | 'ZH' | 'ES' | 'JA' | 'RU';

interface Translations {
  [key: string]: { [lang in LangType]: string };
}

export const translations: Translations = {
  header_title: { EN: "TRIATOPIA", KO: "트리아토피아", ZH: "特利亚托皮亚", ES: "TRIATOPÍA", JA: "トリアトピア", RU: "ТРИАТОПИЯ" },
  connect_wallet: { EN: "Connect Wallet", KO: "지갑 연결", ZH: "连接钱包", ES: "Conectar Billetera", JA: "ウォレット接続", RU: "Подключить Кошелек" },
  new_proposals: { EN: "New Proposals", KO: "새로 발의된 법안", ZH: "新提案", ES: "Nuevas Propuestas", JA: "新しい提案", RU: "Новые Предложения" },
  history_agendas: { EN: "Tabled Agendas", KO: "기존 상정된 하위 법안", ZH: "搁置议程", ES: "Agendas Pendientes", JA: "保留された議題", RU: "Отложенные Повестки" },
  earth_health: { EN: "Earth Health", KO: "지구 건강", ZH: "地球健康", ES: "Salud Tierra", JA: "地球の健康", RU: "Здоровье Земли" },
  ener_prod: { EN: "Ener Production", KO: "에너지 생산", ZH: "能源生产", ES: "Prod Energía", JA: "エネルギー生産", RU: "Пр. Энергии" },
  ener_cons: { EN: "Ener Consumption", KO: "에너지 소비", ZH: "能源消耗", ES: "Cons Energía", JA: "エネルギー消費", RU: "Потр. Энергии" },
  live_vote: { EN: "MAIN AGENDA VOTING", KO: "핵심 안건 투표 진행중", ZH: "主要议程投票", ES: "VOTACIÓN AGENDA", JA: "メインの議題投票", RU: "ГОЛОСОВАНИЕ" },
  citizen_demo: { EN: "Citizen Demographics", KO: "시민 총인구 활동", ZH: "公民人口统计", ES: "Demografía Ciud.", JA: "市民の人口統計", RU: "Демография Граждан" },
  total_pop: { EN: "Total Population", KO: "총 인구", ZH: "总人口", ES: "Población Total", JA: "総人口", RU: "Общее Население" },
  active_cit: { EN: "Active Citizens", KO: "접속 시민", ZH: "活跃公民", ES: "Ciudadanos Activos", JA: "アクティブ市民", RU: "Активные Граждане" },
  activity_rate: { EN: "Activity Rate", KO: "접속률", ZH: "活跃率", ES: "Tasa de Act.", JA: "活動率", RU: "Уровень Активности" },
  senator_activities: { EN: "Senator Activities", KO: "의원 활동 내역", ZH: "参议员活动", ES: "Act. Senadores", JA: "議員の活動", RU: "Деятельность" },
  judiciary_veto: { EN: "Judiciary Veto System", KO: "인간 사법부 개입 시스템", ZH: "司法否决系统", ES: "Sistema de Veto", JA: "司法拒否権システム", RU: "Система Вето" },
  pending_review: { EN: "[Pending Review]", KO: "[리뷰 대기 중]", ZH: "[待审核]", ES: "[Revisión Pend.]", JA: "[審査待ち]", RU: "[Ожидает]" },
  citizen_registry: { EN: "Citizen Registry", KO: "시민 명부 (랭킹)", ZH: "公民登记录", ES: "Registro Ciudadano", JA: "市民レジストリ", RU: "Реестр Граждан" },
  system_logs: { EN: "System Logs", KO: "시스템 로그", ZH: "系统日志", ES: "Registros de Sistema", JA: "システムログ", RU: "Системные Журналы" },
  const_toggle: { EN: "Constitution v1.0", KO: "통치 헌법 전문", ZH: "宪法原文", ES: "Constitución", JA: "憲法", RU: "Конституция" }
};

interface LangContextType {
  lang: LangType;
  setLang: (lang: LangType) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangType>('EN');

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
}
