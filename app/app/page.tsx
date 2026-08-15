import UserDashboard from '@/components/UserDashboard';

export default function AppPage() {
  return (
    <main style={{
      minHeight:'100vh',
      background:'radial-gradient(circle at 50% 0%, #0a1d35 0%, #061425 35%, #020b16 100%)',
      color:'#fff',
      padding:24
    }}>
      <UserDashboard />
    </main>
  );
}
