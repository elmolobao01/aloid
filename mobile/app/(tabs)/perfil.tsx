import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { apiFetch } from '@/lib/api';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/api/v1/me');
      const json = await response.json();
      if (response.ok) {
        setProfile(json.profile);
        setUsage(json.usage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
    router.replace('/');
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  if (!profile) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>CONTA ALÔ ID</Text>
        <Text style={styles.title}>Seu perfil</Text>
        <Text style={styles.subtitle}>Entre para manter histórico, avaliações e preferências sincronizadas.</Text>
        <Card>
          <Link href="/login" style={styles.loginLink}>Entrar ou criar conta →</Link>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>CONTA ALÔ ID</Text>
      <Text style={styles.title}>{profile.display_name || 'Seu perfil'}</Text>
      <Text style={styles.subtitle}>{profile.email}</Text>

      <View style={styles.grid}>
        <Metric label="PLANO" value={(profile.plan || 'free').toUpperCase()} />
        <Metric label="CONSULTAS NO MÊS" value={String(usage?.lookups_this_month || 0)} />
        <Metric label="AVALIAÇÕES" value={String(usage?.reports_total || 0)} />
        <Metric label="HISTÓRICO" value={String(usage?.history_count || 0)} />
      </View>

      <Card>
        <Text style={styles.cardLabel}>ASSINATURA</Text>
        <Text style={styles.cardTitle}>Planos e oferta de lançamento</Text>
        <Text style={styles.subtitle}>
          Compare Premium, Premium Anual e Família, incluindo franquias de consultas avançadas.
        </Text>
        <Link href="/planos" style={styles.loginLink}>VER PLANOS →</Link>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>SINCRONIZAÇÃO</Text>
        <Text style={styles.cardTitle}>Conta conectada</Text>
        <Text style={styles.subtitle}>
          Web e aplicativo usam a mesma conta e o mesmo histórico do ALÔ ID.
        </Text>
      </Card>

      <PrimaryButton label="SAIR DA CONTA" onPress={logout} />
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card style={styles.metric}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </Card>;
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingTop: 54, paddingBottom: 30, gap: 14, backgroundColor: theme.colors.bg, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  loginLink: { color: theme.colors.primary, fontWeight: '900', fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { width: '48%', minHeight: 105 },
  cardLabel: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  metricValue: { color: theme.colors.text, fontSize: 23, fontWeight: '900', marginTop: 9 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 6, marginBottom: 4 },
});
