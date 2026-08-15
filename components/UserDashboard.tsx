'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type Profile = { email:string|null; display_name:string|null; plan:string|null };
type HistoryItem = {
  id:string; status:string; lookup_type:string; created_at:string;
  phone_numbers:{ e164?:string; ddd?:string|null; state?:string|null; line_type?:string|null; carrier_current?:string|null } | null;
};

const formatPhone=(e164?:string)=>{
  const d=(e164||'').replace(/\D/g,'').replace(/^55/,'');
  if(d.length===11)return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if(d.length===10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return e164||'Número indisponível';
};
const lineLabel=(v?:string|null)=>v==='mobile'?'Celular':v==='landline'||v==='fixed_or_other'?'Fixo':v||'Não identificado';

export default function UserDashboard() {
  const [loading,setLoading]=useState(true);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [history,setHistory]=useState<HistoryItem[]>([]);
  const [error,setError]=useState('');

  useEffect(()=>{ load(); },[]);

  async function load(){
    setLoading(true); setError('');
    try{
      const {data:sessionData}=await supabase.auth.getSession();
      const token=sessionData.session?.access_token;
      if(!token){ window.location.href='/entrar'; return; }

      const headers={Authorization:`Bearer ${token}`};
      const [meResponse,historyResponse]=await Promise.all([
        fetch('/api/v1/me',{headers}),
        fetch('/api/v1/history',{headers})
      ]);
      const meData=await meResponse.json();
      const historyData=await historyResponse.json();
      if(!meResponse.ok) throw new Error(meData?.error||'Não foi possível carregar sua conta.');
      setProfile(meData.profile);
      if(historyResponse.ok) setHistory(historyData.history||[]);
      else setError(historyData?.error||'Não foi possível carregar o histórico.');
    }catch(e){ setError(e instanceof Error?e.message:'Falha ao carregar sua conta.'); }
    finally{ setLoading(false); }
  }

  async function logout(){ await supabase.auth.signOut(); window.location.href='/'; }
  if(loading)return <div style={{maxWidth:1100,margin:'0 auto',paddingTop:80,color:'#9db2c7'}}>Carregando sua conta...</div>;

  return <div style={{maxWidth:1100,margin:'0 auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',padding:'18px 0 24px'}}>
      <div><div style={{fontSize:12,fontWeight:900,color:'#55c2ff',letterSpacing:'.08em'}}>CONTA ALÔ ID</div><h1 style={{margin:'6px 0 4px',fontSize:34}}>Minha área</h1><div style={{color:'#91a8bf',fontSize:14}}>{profile?.display_name||profile?.email||'Usuário ALÔ ID'}</div></div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Link href="/" style={secondaryLink}>Consultar número</Link><button onClick={logout} style={secondaryButton}>Sair</button></div>
    </header>

    {error&&<div style={errorBox}>{error}</div>}

    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:10}}>
      <Card title="Histórico" text="Consultas vinculadas à sua conta." value={String(history.length)} />
      <Card title="Avaliações" text="Acompanhe os números que você classificou." value="Ativo" />
      <Card title="Proteção" text="Gerencie bloqueios e preferências de proteção." value="Em breve" />
      <Card title="Plano" text="Gerencie os recursos do seu plano ALÔ ID." value={(profile?.plan||'free').toUpperCase()} />
    </section>

    <section style={panel}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div><div style={sectionLabel}>HISTÓRICO DE CONSULTAS</div><div style={{color:'#91a8bf',fontSize:13,marginTop:5}}>As 20 consultas mais recentes realizadas enquanto você estiver conectado.</div></div>
        <button onClick={load} style={secondaryButton}>Atualizar</button>
      </div>
      {history.length===0 ? <div style={{padding:'28px 0 8px',color:'#9fb2c5'}}>Nenhuma consulta registrada nesta conta. Clique em “Consultar número” e faça a primeira.</div> :
      <div style={{display:'grid',gap:10,marginTop:18}}>{history.map(item=>{
        const phone=item.phone_numbers;
        return <div key={item.id} style={{display:'grid',gridTemplateColumns:'minmax(180px,1.4fr) repeat(3,minmax(100px,1fr))',gap:12,alignItems:'center',padding:14,borderRadius:13,background:'rgba(8,26,45,.75)',border:'1px solid rgba(78,129,178,.22)'}}>
          <div><div style={{fontWeight:900,fontSize:17}}>{formatPhone(phone?.e164)}</div><div style={{fontSize:12,color:'#7f96ad',marginTop:3}}>{phone?.e164||'—'}</div></div>
          <Field label="Tipo" value={lineLabel(phone?.line_type)} bare />
          <Field label="Operadora" value={phone?.carrier_current||'—'} bare />
          <Field label="Data" value={new Date(item.created_at).toLocaleString('pt-BR')} bare />
        </div>;
      })}</div>}
    </section>

    <section style={panel}><div style={sectionLabel}>PERFIL</div><div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}><Field label="E-mail" value={profile?.email||'—'} /><Field label="Nome" value={profile?.display_name||'Não informado'} /><Field label="Plano" value={(profile?.plan||'free').toUpperCase()} /></div></section>
  </div>;
}

function Card({title,text,value}:{title:string;text:string;value:string}){return <div style={{minHeight:160,padding:18,borderRadius:17,border:'1px solid rgba(62,141,220,.28)',background:'linear-gradient(180deg,rgba(11,34,58,.9),rgba(7,24,42,.88))'}}><div style={sectionLabel}>{title.toUpperCase()}</div><div style={{fontSize:22,fontWeight:900,marginTop:10}}>{value}</div><div style={{fontSize:13,color:'#9fb2c5',marginTop:8,lineHeight:1.45}}>{text}</div></div>}
function Field({label,value,bare=false}:{label:string;value:string;bare?:boolean}){return <div style={bare?{}:{padding:14,borderRadius:12,background:'rgba(8,26,45,.75)',border:'1px solid rgba(78,129,178,.22)'}}><div style={{fontSize:11,color:'#7f96ad',fontWeight:800}}>{label.toUpperCase()}</div><div style={{marginTop:5,fontSize:15,fontWeight:800}}>{value}</div></div>}
const sectionLabel:React.CSSProperties={fontSize:12,fontWeight:900,color:'#55c3ff',letterSpacing:'.06em'};
const panel:React.CSSProperties={marginTop:18,padding:20,borderRadius:18,border:'1px solid rgba(74,143,210,.3)',background:'rgba(7,25,43,.78)'};
const secondaryLink:React.CSSProperties={minHeight:42,padding:'0 15px',display:'inline-flex',alignItems:'center',borderRadius:10,border:'1px solid rgba(83,146,210,.4)',color:'#9fd5ff',textDecoration:'none',fontWeight:800};
const secondaryButton:React.CSSProperties={minHeight:42,padding:'0 15px',borderRadius:10,border:'1px solid rgba(83,146,210,.4)',background:'transparent',color:'#9fd5ff',fontWeight:800,cursor:'pointer'};
const errorBox:React.CSSProperties={margin:'12px 0',padding:14,borderRadius:12,background:'rgba(127,43,52,.25)',border:'1px solid rgba(220,83,93,.25)',color:'#ffd6da'};
