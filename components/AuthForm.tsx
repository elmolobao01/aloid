'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedEmail(session?.user.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Acesso realizado com sucesso.');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          setMessage('Conta criada e acesso realizado.');
        } else {
          setMessage('Conta criada. Verifique seu e-mail para confirmar o cadastro.');
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir o acesso.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setMessage('Sessão encerrada.');
  }

  if (loggedEmail) {
    return (
      <div style={panel}>
        <div style={{fontSize:12,fontWeight:900,color:'#4ec6ff',letterSpacing:'.08em'}}>CONTA ALÔ ID</div>
        <h1 style={{margin:'10px 0 8px',fontSize:32}}>Você está conectado</h1>
        <p style={{color:'#9fb3c7',marginTop:0}}>{loggedEmail}</p>

        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:24}}>
          <Link href="/" style={primaryLink}>Voltar para consulta</Link>
          <button onClick={logout} style={secondaryButton}>Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div style={panel}>
      <div style={{fontSize:12,fontWeight:900,color:'#4ec6ff',letterSpacing:'.08em'}}>CONTA ALÔ ID</div>
      <h1 style={{margin:'10px 0 8px',fontSize:34}}>
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </h1>
      <p style={{color:'#9fb3c7',margin:'0 0 24px'}}>
        Entre para avaliar números e construir a reputação comunitária do ALÔ ID.
      </p>

      <form onSubmit={submit}>
        <label style={label}>E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          style={input}
        />

        <label style={label}>Senha</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          style={input}
        />

        <button disabled={loading} style={primaryButton}>
          {loading ? 'PROCESSANDO...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop:16,padding:'12px 14px',borderRadius:12,
          background:'rgba(25,87,130,.25)',border:'1px solid rgba(70,160,230,.25)',
          color:'#c7e8ff',fontSize:13,lineHeight:1.45
        }}>{message}</div>
      )}

      <div style={{marginTop:18,color:'#8fa5bb',fontSize:13}}>
        {mode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'}{' '}
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}
          style={{border:0,background:'transparent',color:'#58bfff',fontWeight:800,cursor:'pointer',padding:0}}
        >
          {mode === 'login' ? 'Criar conta' : 'Entrar'}
        </button>
      </div>

      <Link href="/" style={{display:'inline-block',marginTop:22,color:'#8ea6bd',textDecoration:'none',fontSize:13}}>
        ← Voltar ao ALÔ ID
      </Link>
    </div>
  );
}

const panel: React.CSSProperties = {
  width:'100%',maxWidth:520,padding:28,borderRadius:22,
  border:'1px solid rgba(73,145,215,.3)',
  background:'rgba(5,20,37,.9)',boxShadow:'0 30px 80px rgba(0,0,0,.22)'
};

const label: React.CSSProperties = {
  display:'block',margin:'14px 0 7px',fontSize:12,fontWeight:850,color:'#b9cada'
};

const input: React.CSSProperties = {
  width:'100%',boxSizing:'border-box',height:52,borderRadius:12,
  border:'1px solid rgba(91,145,195,.4)',background:'#08182b',
  color:'#fff',padding:'0 14px',fontSize:16,outline:'none'
};

const primaryButton: React.CSSProperties = {
  width:'100%',height:52,border:0,borderRadius:12,marginTop:20,
  color:'#fff',fontWeight:900,cursor:'pointer',
  background:'linear-gradient(135deg,#24bdf4,#5b50ff)'
};

const secondaryButton: React.CSSProperties = {
  height:46,padding:'0 18px',borderRadius:11,
  border:'1px solid rgba(85,145,210,.45)',background:'transparent',
  color:'#9dcbef',fontWeight:800,cursor:'pointer'
};

const primaryLink: React.CSSProperties = {
  minHeight:46,padding:'0 18px',borderRadius:11,
  display:'inline-flex',alignItems:'center',
  background:'linear-gradient(135deg,#24bdf4,#5b50ff)',
  color:'#fff',fontWeight:850,textDecoration:'none'
};
