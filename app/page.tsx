import PhoneLookup from '@/components/PhoneLookup';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #0a1d35 0%, #061425 35%, #020b16 100%)',
      color: '#fff'
    }}>
      <header style={{
        borderBottom: '1px solid rgba(99,153,215,.18)',
        background: 'rgba(2,10,20,.76)',
        backdropFilter: 'blur(18px)'
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', minHeight: 82, padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24
        }}>
          <div style={{display:'flex',alignItems:'center',gap:13}}>
            <div style={{
              width:46,height:46,borderRadius:14,
              border:'1px solid rgba(60,156,255,.55)',
              display:'grid',placeItems:'center',
              background:'linear-gradient(145deg,rgba(30,167,255,.18),rgba(92,73,255,.12))',
              fontWeight:950,fontSize:22,color:'#42bfff'
            }}>A</div>
            <div>
              <div style={{fontSize:25,fontWeight:950,letterSpacing:'-.02em'}}>ALÔ <span style={{color:'#3e9cff'}}>ID</span></div>
              <div style={{fontSize:10,color:'#8da4be',letterSpacing:'.16em'}}>IDENTIFIQUE • PROTEJA • CONSULTE</div>
            </div>
          </div>

          <nav style={{display:'flex',alignItems:'center',gap:24,color:'#c5d1df',fontSize:14}}>
            <span>Como funciona</span><span>Privacidade</span><span>Sobre</span>
            <button style={{
              border:'1px solid #397fe8',background:'transparent',color:'#58bfff',
              borderRadius:12,padding:'10px 16px',fontWeight:800
            }}>Entrar</button>
          </nav>
        </div>
      </header>

      <section style={{maxWidth:1180,margin:'0 auto',padding:'48px 24px 34px'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <h1 style={{fontSize:'clamp(42px,6vw,68px)',lineHeight:1.02,margin:'0 0 14px',letterSpacing:'-.045em'}}>
            Saiba <span style={{background:'linear-gradient(90deg,#56a9ff,#6758ff)',WebkitBackgroundClip:'text',color:'transparent'}}>quem</span> chama.
          </h1>
          <p style={{fontSize:18,color:'#aebfd1',margin:0}}>
            Consulte números brasileiros e construa sua proteção contra chamadas indesejadas.
          </p>
        </div>

        <PhoneLookup />

        <div style={{
          marginTop:24,display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12
        }}>
          <Feature icon="✓" title="Proteja-se" text="Evite golpes e chamadas indesejadas." />
          <Feature icon="▣" title="Privacidade" text="Seus dados protegidos e acesso controlado." />
          <Feature icon="●" title="Informações confiáveis" text="Dados de múltiplas fontes verificadas." />
          <Feature icon="⚡" title="Resposta rápida" text="Resultados em segundos para você decidir." />
        </div>
      </section>

      <footer style={{textAlign:'center',padding:'12px 20px 28px',color:'#71879f',fontSize:13}}>
        © 2026 ALÔ ID. Todos os direitos reservados.
      </footer>
    </main>
  );
}

function Feature({icon,title,text}:{icon:string;title:string;text:string}) {
  return (
    <div style={{display:'flex',gap:13,alignItems:'center',padding:'14px 10px'}}>
      <div style={{
        width:48,height:48,borderRadius:13,border:'1px solid rgba(61,150,255,.35)',
        display:'grid',placeItems:'center',fontWeight:900,color:'#4bb7ff',
        background:'rgba(9,31,54,.7)',fontSize:19,flex:'0 0 auto'
      }}>{icon}</div>
      <div>
        <div style={{fontWeight:850,color:'#dcecff',marginBottom:4}}>{title}</div>
        <div style={{fontSize:13,color:'#8fa5bb',lineHeight:1.35}}>{text}</div>
      </div>
    </div>
  );
}
