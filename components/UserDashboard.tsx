'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type Profile = {
  email:string|null;
  display_name:string|null;
  plan:string|null;
};

type Usage = {
  lookups_this_month:number;
  reports_total:number;
  history_count:number;
};

type Entitlements = {
  history_limit:number|null;
  community_reports:boolean;
  advanced_lookup:boolean;
  protection:boolean;
};

type AccountSummary = {
  profile:Profile;
  usage:Usage;
  entitlements:Entitlements;
};

type HistoryItem = {
  id:string;
  status:string;
  lookup_type:string;
  created_at:string;
  phone_numbers:{
    e164?:string;
    ddd?:string|null;
    state?:string|null;
    line_type?:string|null;
    carrier_current?:string|null;
  } | null;
};

const formatPhone=(e164?:string)=>{
  const d=(e164||'').replace(/\D/g,'').replace(/^55/,'');
  if(d.length===11)return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if(d.length===10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return e164||'Número indisponível';
};

const lineLabel=(v?:string|null)=>
  v==='mobile'?'Celular':v==='landline'||v==='fixed_or_other'?'Fixo':v||'Não identificado';

export default function UserDashboard() {
  const [loading,setLoading]=useState(true);
  const [summary,setSummary]=useState<AccountSummary|null>(null);
  const [history,setHistory]=useState<HistoryItem[]>([]);
  const [error,setError]=useState('');
  const [editing,setEditing]=useState(false);
  const [displayName,setDisplayName]=useState('');
  const [saving,setSaving]=useState(false);
  const [success,setSuccess]=useState('');

  useEffect(()=>{ load(); },[]);

  async function sessionToken(){
    const {data}=await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function load(){
    setLoading(true);
    setError('');
    try{
      const token=await sessionToken();
      if(!token){ window.location.href='/entrar'; return; }

      const headers={Authorization:`Bearer ${token}`};
      const [meResponse,historyResponse]=await Promise.all([
        fetch('/api/v1/me',{headers}),
        fetch('/api/v1/history',{headers})
      ]);

      const meData=await meResponse.json();
      const historyData=await historyResponse.json();

      if(!meResponse.ok) throw new Error(meData?.error||'Não foi possível carregar sua conta.');

      setSummary(meData);
      setDisplayName(meData?.profile?.display_name||'');

      if(historyResponse.ok) setHistory(historyData.history||[]);
      else setError(historyData?.error||'Não foi possível carregar o histórico.');
    }catch(e){
      setError(e instanceof Error?e.message:'Falha ao carregar sua conta.');
    }finally{
      setLoading(false);
    }
  }

  async function saveProfile(event:FormEvent){
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try{
      const token=await sessionToken();
      if(!token){ window.location.href='/entrar'; return; }

      const response=await fetch('/api/v1/me',{
        method:'PATCH',
        headers:{
          Authorization:`Bearer ${token}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({display_name:displayName})
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data?.error||'Não foi possível atualizar seu perfil.');

      setSummary(current=>current?{...current,profile:data.profile}:current);
      setEditing(false);
      setSuccess('Perfil atualizado com sucesso.');
    }catch(e){
      setError(e instanceof Error?e.message:'Falha ao atualizar perfil.');
    }finally{
      setSaving(false);
    }
  }

  async function logout(){
    await supabase.auth.signOut();
    window.location.href='/';
  }

  if(loading){
    return <div style={{maxWidth:1100,margin:'0 auto',paddingTop:80,color:'#9db2c7'}}>Carregando sua conta...</div>;
  }

  const profile=summary?.profile;
  const usage=summary?.usage ?? {lookups_this_month:0,reports_total:0,history_count:history.length};
  const entitlements=summary?.entitlements ?? {history_limit:20,community_reports:true,advanced_lookup:false,protection:false};
  const plan=(profile?.plan||'free').toLowerCase();

  return <div style={{maxWidth:1100,margin:'0 auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',padding:'18px 0 24px'}}>
      <div>
        <div style={sectionLabel}>CONTA ALÔ ID</div>
        <h1 style={{margin:'6px 0 4px',fontSize:34}}>Minha área</h1>
        <div style={{color:'#91a8bf',fontSize:14}}>{profile?.display_name||profile?.email||'Usuário ALÔ ID'}</div>
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Link href="/" style={secondaryLink}>Consultar número</Link>
        <button onClick={logout} style={secondaryButton}>Sair</button>
      </div>
    </header>

    {error&&<div style={errorBox}>{error}</div>}
    {success&&<div style={successBox}>{success}</div>}

    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginTop:10}}>
      <Card title="Histórico" text="Consultas vinculadas à sua conta." value={String(usage.history_count)} />
      <Card title="Consultas no mês" text="Uso da conta no mês atual." value={String(usage.lookups_this_month)} />
      <Card title="Avaliações" text="Contribuições feitas à reputação comunitária." value={String(usage.reports_total)} />
      <Card title="Plano" text="Recursos atualmente liberados para sua conta." value={plan.toUpperCase()} />
    </section>

    <section style={panel}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div>
          <div style={sectionLabel}>SEU PLANO</div>
          <div style={{fontSize:24,fontWeight:900,marginTop:7}}>{plan==='premium'?'ALÔ ID Premium':'ALÔ ID Free'}</div>
          <div style={{color:'#91a8bf',fontSize:13,marginTop:5}}>
            A estrutura de planos já está preparada. A contratação Premium será ativada em uma etapa posterior.
          </div>
        </div>
        <div style={planBadge}>{plan.toUpperCase()}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10,marginTop:18}}>
        <Entitlement enabled label={`Histórico ${entitlements.history_limit===null?'ampliado':`até ${entitlements.history_limit} itens`}`} />
        <Entitlement enabled={entitlements.community_reports} label="Avaliações comunitárias" />
        <Entitlement enabled={entitlements.advanced_lookup} label="Consulta avançada" />
        <Entitlement enabled={entitlements.protection} label="Proteção avançada" />
      </div>
    </section>

    <section style={panel}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div>
          <div style={sectionLabel}>HISTÓRICO DE CONSULTAS</div>
          <div style={{color:'#91a8bf',fontSize:13,marginTop:5}}>As consultas mais recentes realizadas enquanto você estiver conectado.</div>
        </div>
        <button onClick={load} style={secondaryButton}>Atualizar</button>
      </div>
      {history.length===0 ?
        <div style={{padding:'28px 0 8px',color:'#9fb2c5'}}>Nenhuma consulta registrada nesta conta. Clique em “Consultar número” e faça a primeira.</div> :
        <div style={{display:'grid',gap:10,marginTop:18}}>{history.map(item=>{
          const phone=item.phone_numbers;
          return <div key={item.id} style={historyRow}>
            <div>
              <div style={{fontWeight:900,fontSize:17}}>{formatPhone(phone?.e164)}</div>
              <div style={{fontSize:12,color:'#7f96ad',marginTop:3}}>{phone?.e164||'—'}</div>
            </div>
            <Field label="Tipo" value={lineLabel(phone?.line_type)} bare />
            <Field label="Operadora" value={phone?.carrier_current||'—'} bare />
            <Field label="Data" value={new Date(item.created_at).toLocaleString('pt-BR')} bare />
          </div>;
        })}</div>
      }
    </section>

    <section style={panel}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div style={sectionLabel}>PERFIL</div>
        {!editing&&<button onClick={()=>setEditing(true)} style={secondaryButton}>Editar perfil</button>}
      </div>

      {editing ?
        <form onSubmit={saveProfile} style={{marginTop:14}}>
          <label style={{display:'block',fontSize:11,color:'#7f96ad',fontWeight:800,marginBottom:7}}>NOME DE EXIBIÇÃO</label>
          <input
            value={displayName}
            onChange={e=>setDisplayName(e.target.value.slice(0,80))}
            placeholder="Como deseja ser chamado"
            style={inputStyle}
          />
          <div style={{display:'flex',gap:10,marginTop:12,flexWrap:'wrap'}}>
            <button type="submit" disabled={saving} style={primaryButton}>{saving?'SALVANDO...':'SALVAR PERFIL'}</button>
            <button type="button" onClick={()=>{setEditing(false);setDisplayName(profile?.display_name||'');}} style={secondaryButton}>Cancelar</button>
          </div>
        </form> :
        <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
          <Field label="E-mail" value={profile?.email||'—'} />
          <Field label="Nome" value={profile?.display_name||'Não informado'} />
          <Field label="Plano" value={plan.toUpperCase()} />
        </div>
      }
    </section>
  </div>;
}

function Card({title,text,value}:{title:string;text:string;value:string}){
  return <div style={{minHeight:150,padding:18,borderRadius:17,border:'1px solid rgba(62,141,220,.28)',background:'linear-gradient(180deg,rgba(11,34,58,.9),rgba(7,24,42,.88))'}}>
    <div style={sectionLabel}>{title.toUpperCase()}</div>
    <div style={{fontSize:22,fontWeight:900,marginTop:10}}>{value}</div>
    <div style={{fontSize:13,color:'#9fb2c5',marginTop:8,lineHeight:1.45}}>{text}</div>
  </div>;
}

function Entitlement({enabled,label}:{enabled:boolean;label:string}){
  return <div style={{padding:13,borderRadius:12,background:'rgba(8,26,45,.75)',border:'1px solid rgba(78,129,178,.22)',display:'flex',gap:9,alignItems:'center'}}>
    <span style={{fontWeight:900,color:enabled?'#50e5b2':'#70879d'}}>{enabled?'✓':'○'}</span>
    <span style={{fontSize:13,color:enabled?'#cfe7f7':'#748ba1',fontWeight:750}}>{label}</span>
  </div>;
}

function Field({label,value,bare=false}:{label:string;value:string;bare?:boolean}){
  return <div style={bare?{}:{padding:14,borderRadius:12,background:'rgba(8,26,45,.75)',border:'1px solid rgba(78,129,178,.22)'}}>
    <div style={{fontSize:11,color:'#7f96ad',fontWeight:800}}>{label.toUpperCase()}</div>
    <div style={{marginTop:5,fontSize:15,fontWeight:800}}>{value}</div>
  </div>;
}

const sectionLabel:React.CSSProperties={fontSize:12,fontWeight:900,color:'#55c3ff',letterSpacing:'.06em'};
const panel:React.CSSProperties={marginTop:18,padding:20,borderRadius:18,border:'1px solid rgba(74,143,210,.3)',background:'rgba(7,25,43,.78)'};
const secondaryLink:React.CSSProperties={minHeight:42,padding:'0 15px',display:'inline-flex',alignItems:'center',borderRadius:10,border:'1px solid rgba(83,146,210,.4)',color:'#9fd5ff',textDecoration:'none',fontWeight:800};
const secondaryButton:React.CSSProperties={minHeight:42,padding:'0 15px',borderRadius:10,border:'1px solid rgba(83,146,210,.4)',background:'transparent',color:'#9fd5ff',fontWeight:800,cursor:'pointer'};
const primaryButton:React.CSSProperties={minHeight:44,padding:'0 18px',border:0,borderRadius:10,color:'#fff',fontWeight:900,cursor:'pointer',background:'linear-gradient(135deg,#20b9ef,#5b50ff)'};
const inputStyle:React.CSSProperties={width:'100%',maxWidth:520,boxSizing:'border-box',height:50,borderRadius:11,border:'1px solid rgba(85,140,190,.32)',background:'#07182a',color:'#fff',padding:'0 13px',fontSize:15,outline:'none'};
const errorBox:React.CSSProperties={margin:'12px 0',padding:14,borderRadius:12,background:'rgba(127,43,52,.25)',border:'1px solid rgba(220,83,93,.25)',color:'#ffd6da'};
const successBox:React.CSSProperties={margin:'12px 0',padding:14,borderRadius:12,background:'rgba(29,105,83,.25)',border:'1px solid rgba(67,190,148,.25)',color:'#c9ffea'};
const planBadge:React.CSSProperties={padding:'9px 14px',borderRadius:999,border:'1px solid rgba(79,174,245,.35)',background:'rgba(35,122,192,.14)',color:'#68c8ff',fontWeight:900,fontSize:12};
const historyRow:React.CSSProperties={display:'grid',gridTemplateColumns:'minmax(180px,1.4fr) repeat(3,minmax(100px,1fr))',gap:12,alignItems:'center',padding:14,borderRadius:13,background:'rgba(8,26,45,.75)',border:'1px solid rgba(78,129,178,.22)'};
