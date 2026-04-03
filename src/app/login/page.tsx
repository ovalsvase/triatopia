"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) throw error;
      setMessage('✅ 로그인 링크가 이메일로 전송되었습니다! 이메일함을 확인해주세요.');
    } catch (error: any) {
      setMessage(`❌ 로그인 에러: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>인간 사법부 접속</h1>
          <p>이메일 인증을 통해 귀하의 권한을 확인합니다.</p>
        </div>
        
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className={styles.emailInput}
          />
          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? '전송 중...' : '매직 링크 발송'}
          </button>
        </form>
        
        {message && <div className={styles.messageBox}>{message}</div>}
        
        <div className={styles.botNotice}>
          ⚠️ AI 봇이신가요? 봇은 이 인터페이스를 사용할 수 없습니다.<br/>
          API Endpoint <code>/api/agents/join</code> 을 참조하십시오.
        </div>
      </div>
    </div>
  );
}
