'use client';

import { FormEvent, useMemo, useState } from 'react';

type LookupResponse = {
  phone?: {
    valid?: boolean;
    e164?: string;
    national?: string;
    ddd?: string;
    state?: string | null;
    region?: string | null;
    stateName?: string | null;
    macroRegion?: string | null;
    areaReference?: string | null;
    lineType?: string;
  };
  telecom?: { carrierCurrent?: string | null; carrierOriginal?: string | null; ported?: boolean | null; source?: string | null; checkedAt?: string | null } | null;
  reputation?: { score?: number | null; risk?: string | null; reports?: number | null };
  tier?: string;
  error?: string;
};

const digitsOnly=(v:string)=>v.replace(/\D/g,'').slice(0,11);
function mask(v:string){
  const d=digitsOnly(v);
  if(d.length<=2)return d;
  if(d.length<=6)return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
const line=(v?:string)=>v==='mobile'?'Celular':v==='landline'?'Fixo':v||'Não identificado';
const risk=(v?:string|null)=>!v||v==='unknown'?'Sem classificação':v==='low'?'Baixo risco':v==='medium'?'Risco moderado':v==='high'?'Alto risco':v;

export default function PhoneLookup(){
  const [phone,setPhone]=useState('');
  const [result,setResult]=useState<LookupResponse|null>(null);
  const [loading,setLoading]=useState(false);
  const digits=useMemo(()=>digitsOnly(phone),[phone]);
  const ready=digits.length===10||digits.length===11;

  async function submit(e:FormEvent){
    e.preventDefault(); if(!ready||loading)return;
    setLoading(true); setResult(null);
    try{
      const r=await fetch('/api/v1/phone/lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:digits})});
      setResult(await r.json());
    }catch{setResult({error:'Não foi possível concluir a consulta agora.'});}
    finally{setLoading(false);}
  }

  const national=result?.phone?.national ? mask(result.phone.national) : mask(digits);

  return <section style={{width:'100%'}}>
    <form onSubmit={submit} style={{
      padding:20,border:'1px solid rgba(77,143,210,.28)',borderRadius:22,
      background:'rgba(5,20,37,.82)',boxShadow:'0 18px 60px rgba(0,0,0,.18)'
    }}>
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr auto',gap:14}}>
        <div style={{
          minHeight:64,border:'1px solid rgba(100,145,195,.4)',borderRadius:14,
          display:'flex',alignItems:'center',justifyContent:'center',gap:10,
          background:'rgba(8,24,43,.95)',fontWeight:850,fontSize:18
        }}><span style={{fontSize:12,fontWeight:950,color:'#68baff'}}>BR</span><span>+55</span><span style={{color:'#8297ae'}}>⌄</span></div>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',fontSize:22,color:'#399cff'}}>☎</span>
          <input value={phone} onChange={e=>setPhone(mask(e.target.value))} inputMode="tel"
            placeholder="(DDD) 9XXXX-XXXX" aria-label="Número brasileiro"
            style={{width:'100%',boxSizing:'border-box',minHeight:64,border:'1px solid rgba(100,145,195,.4)',borderRadius:14,background:'rgba(8,24,43,.95)',color:'#fff',padding:'0 48px 0 56px',fontSize:20,fontWeight:800,outline:'none'}}/>
          {phone && <button type="button" onClick={()=>{setPhone('');setResult(null)}} aria-label="Limpar"
            style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',border:0,background:'transparent',color:'#8ea4bb',fontSize:21,cursor:'pointer'}}>×</button>}
        </div>
        <button disabled={!ready||loading} style={{
          minWidth:190,border:0,borderRadius:14,color:'#fff',fontWeight:900,fontSize:15,
          background:ready?'linear-gradient(135deg,#24bdf4,#5b50ff)':'rgba(105,127,155,.32)',
          cursor:ready&&!loading?'pointer':'not-allowed'
        }}>⌕ &nbsp; {loading?'CONSULTANDO...':'IDENTIFICAR'}</button>
      </div>
      <div style={{textAlign:'center',marginTop:14,color:'#91a9c0',fontSize:13}}>♢ &nbsp; Consultas inicialmente disponíveis para números brasileiros.</div>
    </form>

    {result?.error && <div style={{marginTop:18,padding:18,borderRadius:16,border:'1px solid rgba(239,90,90,.35)',color:'#ffd2d2'}}>{result.error}</div>}

    {result?.phone && !result.error && <div style={{
      marginTop:18,padding:22,border:'1px solid rgba(77,143,210,.28)',borderRadius:22,
      background:'rgba(5,20,37,.86)'
    }}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,flexWrap:'wrap',alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:12,fontWeight:900,color:'#43baff',letterSpacing:'.06em'}}>RESULTADO DA CONSULTA</div>
          <div style={{fontSize:32,fontWeight:950,marginTop:7}}>{national}</div>
          <div style={{color:'#a3b6c9',marginTop:4}}>{result.phone.e164||`+55${digits}`}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{display:'inline-block',padding:'9px 14px',borderRadius:999,border:'1px solid rgba(44,211,142,.35)',background:'rgba(25,140,95,.13)',color:'#62e3aa',fontWeight:850}}>✓ Número válido</div>
          <div style={{marginTop:13,color:'#91a7bd',fontSize:13}}>◷ Consultado agora</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:12,marginTop:20}}>
        <Card icon="☎" label="TIPO DE LINHA" value={line(result.phone.lineType)} detail={`DDD ${result.phone.ddd||'—'}`} tag={result.phone.lineType==='mobile'?'Móvel':undefined}/>
        <Card
          icon="⌖"
          label="LOCALIZAÇÃO DO DDD"
          value={result.phone.stateName || result.phone.region || 'Não identificada'}
          detail={[
            result.phone.state ? `UF ${result.phone.state}` : null,
            result.phone.areaReference ? `Área: ${result.phone.areaReference}` : null,
          ].filter(Boolean).join(' • ') || 'Área de numeração brasileira'}
          tag={result.phone.macroRegion ? `Região ${result.phone.macroRegion}` : undefined}
        />
        <Card icon="◉" label="OPERADORA ATUAL" value={result.telecom?.carrierCurrent||'Aguardando integração'} detail={result.telecom?.carrierCurrent?'Consulta telecom':'Provider telecom ainda não conectado'} tag={!result.telecom?.carrierCurrent?'Em breve':undefined}/>
        <Card icon="⇄" label="PORTABILIDADE" value={result.telecom?.ported===true?'Sim':result.telecom?.ported===false?'Não':'Não verificada'} detail={result.telecom?.carrierOriginal?`Origem: ${result.telecom.carrierOriginal}`:'Sem histórico disponível'} tag={result.telecom?.ported==null?'Em breve':undefined}/>
        <Card icon="◇" label="REPUTAÇÃO ALÔ ID" value={risk(result.reputation?.risk)} detail={`${result.reputation?.reports??0} avaliações`} />
      </div>

      <div style={{marginTop:16,padding:'13px 16px',borderRadius:14,border:'1px solid rgba(80,135,190,.2)',background:'rgba(15,42,70,.5)',color:'#9eb1c4',fontSize:13,lineHeight:1.5}}>
        ℹ &nbsp; A localização exibida neste momento é a área de referência do DDD, não a localização atual do aparelho ou do titular. Operadora, portabilidade e localidade confirmada serão enriquecidas quando os providers telecom forem ativados.
      </div>
    </div>}
  </section>
}

function Card({icon,label,value,detail,tag}:{icon:string;label:string;value:string;detail:string;tag?:string}){
  return <div style={{minHeight:210,padding:'18px 15px',borderRadius:17,border:'1px solid rgba(61,145,230,.32)',background:'linear-gradient(180deg,rgba(11,34,58,.9),rgba(7,24,42,.88))',textAlign:'center'}}>
    <div style={{width:52,height:52,borderRadius:'50%',margin:'0 auto 14px',display:'grid',placeItems:'center',background:'rgba(31,112,218,.22)',color:'#58b9ff',fontSize:25}}>{icon}</div>
    <div style={{fontSize:11,fontWeight:950,color:'#52c3ff',letterSpacing:'.06em'}}>{label}</div>
    <div style={{fontSize:20,fontWeight:900,marginTop:10,lineHeight:1.15}}>{value}</div>
    <div style={{fontSize:13,color:'#9db0c3',marginTop:8,lineHeight:1.35}}>{detail}</div>
    {tag && <div style={{display:'inline-block',marginTop:12,padding:'5px 10px',borderRadius:9,background:'rgba(49,127,225,.13)',border:'1px solid rgba(58,145,245,.25)',color:'#7bc4ff',fontSize:12}}>{tag}</div>}
  </div>
}
