'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

const categories = [
  ['confiavel','Confiável'],
  ['empresa','Empresa'],
  ['entrega','Entrega'],
  ['telemarketing','Telemarketing'],
  ['spam','Spam'],
  ['robocall','Chamada automática'],
  ['cobranca','Cobrança'],
  ['golpe','Golpe / fraude'],
  ['outros','Outros'],
] as const;

export default function ReportPanel({
  phone,
  onSubmitted,
}: {
  phone: string;
  onSubmitted?: () => void;
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit() {
    if (!category || sending) return;
    setSending(true);
    setMessage('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setMessage('Entre na sua conta para avaliar este número.');
        return;
      }

      const response = await fetch('/api/v1/phone/report', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({
          phone,
          category,
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Não foi possível registrar a avaliação.');
      }

      setMessage('Avaliação registrada. Obrigado por contribuir com a comunidade ALÔ ID.');
      setDescription('');
      onSubmitted?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao registrar avaliação.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{
      marginTop:16,padding:18,borderRadius:16,
      border:'1px solid rgba(70,140,205,.28)',
      background:'rgba(8,28,48,.62)'
    }}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:12,fontWeight:900,color:'#57c5ff',letterSpacing:'.06em'}}>
            CONTRIBUA COM A COMUNIDADE
          </div>
          <div style={{marginTop:5,fontWeight:850,fontSize:18}}>Como você classifica este número?</div>
        </div>
        <div style={{fontSize:12,color:'#8ea7bf'}}>
          {userEmail ? `Conectado como ${userEmail}` : 'É necessário entrar para avaliar'}
        </div>
      </div>

      <div style={{
        display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',
        gap:8,marginTop:15
      }}>
        {categories.map(([value,label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            style={{
              minHeight:42,borderRadius:10,cursor:'pointer',
              border: category===value ? '1px solid #4cbfff' : '1px solid rgba(82,137,190,.3)',
              background: category===value ? 'rgba(39,145,218,.2)' : 'rgba(8,25,43,.72)',
              color: category===value ? '#d9f2ff' : '#a9bdd0',
              fontWeight:750
            }}
          >{label}</button>
        ))}
      </div>

      {userEmail ? (
        <>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0,500))}
            placeholder="Comentário opcional (máx. 500 caracteres)"
            style={{
              width:'100%',boxSizing:'border-box',minHeight:82,resize:'vertical',
              marginTop:12,borderRadius:11,border:'1px solid rgba(85,140,190,.32)',
              background:'#07182a',color:'#fff',padding:12,fontFamily:'inherit'
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!category || sending}
            style={{
              marginTop:10,minHeight:44,padding:'0 18px',border:0,borderRadius:10,
              background: category ? 'linear-gradient(135deg,#20b9ef,#5b50ff)' : 'rgba(90,110,130,.35)',
              color:'#fff',fontWeight:900,cursor:category&&!sending?'pointer':'not-allowed'
            }}
          >
            {sending ? 'ENVIANDO...' : 'ENVIAR AVALIAÇÃO'}
          </button>
        </>
      ) : (
        <Link href="/entrar" style={{
          display:'inline-flex',marginTop:14,minHeight:44,padding:'0 18px',
          alignItems:'center',borderRadius:10,textDecoration:'none',
          background:'linear-gradient(135deg,#20b9ef,#5b50ff)',
          color:'#fff',fontWeight:900
        }}>ENTRAR PARA AVALIAR</Link>
      )}

      {message && (
        <div style={{marginTop:12,color:'#add8f5',fontSize:13,lineHeight:1.45}}>
          {message}
        </div>
      )}
    </div>
  );
}
