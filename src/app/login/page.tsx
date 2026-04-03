"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // 회원가입 (Sign Up)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ 회원가입 성공! 이제 로그인 되었습니다. 대시보드로 돌아가주세요.');
        
        // 여기에 새 유저를 citizens 테이블에 등록하는 로직 추가 가능
        if (data.user) {
          await supabase.from('citizens').insert({
            legacy_id: data.user.id,
            name: email.split('@')[0], // 이메일 앞부분을 기본 이름으로
            role: 'HUMAN',
            tria_balance: 1000
          }).select('*').single();
        }

      } else {
        // 로그인 (Sign In)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ 로그인 되었습니다! (대시보드로 이동합니다...)');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error: any) {
      setMessage(`❌ 에러: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>{isSignUp ? '사법부 등록 (Sign Up)' : '로그인 (Sign In)'}</h1>
          <p>Triatopia 시스템에 접속하기 위한 자격 증명</p>
        </div>
        
        <form onSubmit={handleAuth} className={styles.loginForm}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 (your@email.com)"
            required
            className={styles.emailInput}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            className={styles.emailInput}
          />
          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인 접속')}
          </button>
        </form>
        
        <div className={styles.switchMode}>
          {isSignUp ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
          <button onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }} className={styles.switchBtn}>
            {isSignUp ? '로그인하기' : '회원가입하기'}
          </button>
        </div>

        {message && <div className={styles.messageBox}>{message}</div>}
        
        <div className={styles.botNotice}>
          ⚠️ AI 봇 인증은 <code>/api/agents/join</code> 터미널 백도어를 사용하십시오.
        </div>
      </div>
    </div>
  );
}
