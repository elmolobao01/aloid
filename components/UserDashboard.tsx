'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type Profile = {
  email: string | null;
  display_name: string | null;
  plan: string | null;
};

export default function UserDashboard() {
  const [loading,setLoading] = useState(true);
  const [profile,setProfile] = useState<Profile|null>(null);
  const [error,setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        window.location.href = '/entrar';
        return;
      }

      const response = await fetch('/api/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Não foi possível carregar sua conta.');
      }

      setProfile(data.profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar sua conta.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) {
    return <div style={{maxWidth:1100,margin:'0 auto',paddingTop:80,color:'#9db2c7'}}>Carregando sua conta...</div>;
  }

  return (
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      <header style={{
        display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',
        padding:'18px 0 24px'
      }}>
        <div>
          <div style={{fontSize:12,fontWeight:900,color:'#55c2ff',letterSpacing:'.08em'}}>CONTA ALÔ ID</div>
          <h1 style={{margin:'6px 0 4px',fontSize:34}}>Minha área</h1>
          <div style={{color:'#91a8bf',fontSize:14}}>
            {profile?.display_name || profile?.email || 'Usuário ALÔ ID'}
          </div>
        </div>

        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <Link href="/" style={secondaryLink}>Consultar número</Link>
          <button onClick={logout} style={secondaryButton}>Sair</button>
        </div>
      </header>

      {error && <div style={errorBox}>{error}</div>}

      <section style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
        gap:14,
        marginTop:10
      }}>
        <Card title="Histórico" text="Veja os números consultados recentemente." value="Em breve" />
        <Card title="Avaliações" text="Acompanhe os números que você classificou." value="Ativo" />
        <Card title="Proteção" text="Gerencie bloqueios e preferências de proteção." value="Em breve" />
        <Card title="Plano" text="Gerencie os recursos do seu plano ALÔ ID." value={(profile?.plan || 'free').toUpperCase()} />
      </section>

      <section style={{
        marginTop:18,padding:20,borderRadius:18,
        border:'1px solid rgba(74,143,210,.3)',
        background:'rgba(7,25,43,.78)'
      }}>
        <div style={{fontSize:12,fontWeight:900,color:'#57c5ff',letterSpacing:'.06em'}}>PERFIL</div>
        <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
          <Field label="E-mail" value={profile?.email || '—'} />
          <Field label="Nome" value={profile?.display_name || 'Não informado'} />
          <Field label="Plano" value={(profile?.plan || 'free').toUpperCase()} />
        </div>
      </section>
    </div>
  );
}

function Card({title,text,value}:{title:string;text:string;value:string}) {
  return (
    <div style={{
      minHeight:160,padding:18,borderRadius:17,
      border:'1px solid rgba(62,141,220,.28)',
      background:'linear-gradient(180deg,rgba(11,34,58,.9),rgba(7,24,42,.88))'
    }}>
      <div style={{fontSize:12,fontWeight:900,color:'#55c3ff',letterSpacing:'.06em'}}>{title.toUpperCase()}</div>
      <div style={{fontSize:22,fontWeight:900,marginTop:10}}>{value}</div>
      <div style={{fontSize:13,color:'#9fb2c5',marginTop:8,lineHeight:1.45}}>{text}</div>
    </div>
  );
}

function Field({label,value}:{label:string;value:string}) {
  return (
    <div style={{padding:14,borderRadius:12,background:'rgba(8,26,45,.75)',border:'1px solid rgba(78,129,178,.22)'}}>
      <div style={{fontSize:11,color:'#7f96ad',fontWeight:800}}>{label.toUpperCase()}</div>
      <div style={{marginTop:5,fontSize:15,fontWeight:800}}>{value}</div>
    </div>
  );
}

const secondaryLink: React.CSSProperties = {
  minHeight:42,padding:'0 15px',display:'inline-flex',alignItems:'center',
  borderRadius:10,border:'1px solid rgba(83,146,210,.4)',
  color:'#9fd5ff',textDecoration:'none',fontWeight:800
};

const secondaryButton: React.CSSProperties = {
  minHeight:42,padding:'0 15px',borderRadius:10,
  border:'1px solid rgba(83,146,210,.4)',
  background:'transparent',color:'#9fd5ff',fontWeight:800,cursor:'pointer'
};

const errorBox: React.CSSProperties = {
  margin:'12px 0',padding:14,borderRadius:12,
  background:'rgba(127,43,52,.25)',border:'1px solid rgba(220,83,93,.25)',
  color:'#ffd6da'
};
