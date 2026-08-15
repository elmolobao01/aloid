import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main style={{
      minHeight:'100vh',
      background:'radial-gradient(circle at 50% 0%, #0a1d35 0%, #061425 35%, #020b16 100%)',
      color:'#fff',display:'grid',placeItems:'center',padding:24
    }}>
      <AuthForm />
    </main>
  );
}
