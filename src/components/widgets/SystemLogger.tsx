"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./widgets.module.css";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/lib/supabase";

type Log = {
  id: string;
  time: string;
  message: string;
  type: string;
};

export default function SystemLogger() {
  const { t } = useLang();
  const [logs, setLogs] = useState<Log[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialLogs = async () => {
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setLogs(data.reverse());
    };
    fetchInitialLogs();

    const sub = supabase.channel('system-logs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setLogs((prev) => [...prev.slice(-19), payload.new as Log]);
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={styles.panel} style={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
      <h2 className={styles.panelTitle} style={{ margin: "12px", border: "none" }}>
        {t('system_logs')}
      </h2>
      
      <div className={styles.terminal} ref={terminalRef} style={{ flexGrow: 1, overflowY: 'auto' }}>
        <div style={{ padding: "8px" }}>
          {logs.map((log) => (
            <div key={log.id} style={{ marginBottom: "8px", fontSize: '0.85rem' }}>
              <span style={{ color: "var(--color-text-secondary)" }}>[{log.time}]</span>{" "}
              <span style={{ color: log.type === 'EARTH' ? 'var(--color-emerald)' : log.type === 'ASSEMBLY' ? 'var(--color-neon-cyan)' : 'inherit' }}>
                {log.message}
              </span>
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
}
