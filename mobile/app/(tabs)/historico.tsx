import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Card from '@/components/Card';
import { apiFetch } from '@/lib/api';
import { formatBRPhone } from '@/lib/phone';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

type Item = {
  id: string;
  created_at: string;
  phone_numbers?: {
    e164?: string;
    line_type?: string;
    carrier_current?: string;
  } | null;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setItems([]);
        setLoading(false);
        return;
      }

      const response = await apiFetch('/api/v1/history');
      const dataJson = await response.json();
      if (!response.ok) throw new Error(dataJson?.error || 'Falha ao carregar histórico.');
      setItems(dataJson.history || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar histórico.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.colors.primary} />}
    >
      <Text style={styles.eyebrow}>HISTÓRICO</Text>
      <Text style={styles.title}>Suas consultas</Text>
      <Text style={styles.subtitle}>As consultas realizadas enquanto você estiver conectado aparecem aqui.</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {items.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Nenhuma consulta registrada</Text>
          <Text style={styles.subtitle}>Entre na sua conta e faça uma consulta para começar seu histórico.</Text>
          <Text onPress={() => router.push('/login')} style={styles.link}>Entrar na conta →</Text>
        </Card>
      ) : items.map(item => {
        const p = item.phone_numbers;
        return (
          <Card key={item.id}>
            <Text style={styles.phone}>{formatBRPhone(p?.e164 || '')}</Text>
            <Text style={styles.e164}>{p?.e164 || '—'}</Text>
            <View style={styles.metaRow}>
              <Meta label="TIPO" value={p?.line_type === 'mobile' ? 'Celular' : p?.line_type || '—'} />
              <Meta label="OPERADORA" value={p?.carrier_current || '—'} />
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <View style={{ flex: 1 }}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingTop: 54, paddingBottom: 30, gap: 12, backgroundColor: theme.colors.bg, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: theme.colors.danger },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  link: { color: theme.colors.primary, fontWeight: '900', marginTop: 12 },
  phone: { color: theme.colors.text, fontSize: 21, fontWeight: '900' },
  e164: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  metaLabel: { color: '#7890A6', fontSize: 9, fontWeight: '900' },
  metaValue: { color: theme.colors.text, fontSize: 14, fontWeight: '800', marginTop: 4 },
  date: { color: theme.colors.muted, fontSize: 11, marginTop: 14 },
});
