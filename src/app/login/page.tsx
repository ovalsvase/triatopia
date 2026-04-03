"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setMessage('❌ 비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        
        // 회원가입 (Sign Up)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setMessage('✅ 가입 성공! 작성하신 이메일로 인증 링크가 발송되었습니다. 이메일함을 확인하시고, 인증을 마친 뒤 로그인해 주세요.');
        } else {
          setMessage('✅ 회원가입 및 로그인 성공! 대시보드로 이동해주세요.');
        }
        
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
          <h1>{isSignUp ? '등록 (Sign Up)' : '로그인 (Sign In)'}</h1>
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
          {isSignUp && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              required
              className={styles.emailInput}
            />
          )}
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
