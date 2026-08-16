import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { API_URL } from '@/lib/api';
import { theme } from '@/lib/theme';

type Plan = {
  code: string; name: string; billing_period: string; price_cents: number;
  launch_price_cents: number | null; launch_first_period_only: boolean;
  weekly_advanced_limit: number; extra_lookup_price_cents: number;
  family_seats: number; protection_advanced: boolean;
};

const money = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PlansScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/plans`)
      .then(r => r.json())
      .then(j => setPlans(j.plans || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>PLANOS ALÔ ID</Text>
      <Text style={styles.title}>Proteção do seu jeito.</Text>
      <Text style={styles.subtitle}>Oferta de lançamento válida para o primeiro período contratado. A renovação segue o preço vigente do plano.</Text>

      {plans.map(plan => {
        const promo = plan.launch_price_cents != null;
        const free = plan.code === 'free';
        return (
          <Card key={plan.code}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.plan}>{plan.name}</Text>
                {promo && !free ? <Text style={styles.promo}>OFERTA DE LANÇAMENTO · 1º PERÍODO</Text> : null}
              </View>
              <View style={styles.priceBox}>
                {promo && !free ? <Text style={styles.old}>{money(plan.price_cents)}</Text> : null}
                <Text style={styles.price}>{free ? 'Grátis' : money(promo ? plan.launch_price_cents! : plan.price_cents)}</Text>
                {!free ? <Text style={styles.period}>{plan.billing_period === 'annual' ? '/ano' : '/mês'}</Text> : null}
              </View>
            </View>

            <Text style={styles.item}>• {plan.weekly_advanced_limit === 0 ? 'Sem consultas avançadas incluídas' : `${plan.weekly_advanced_limit} consultas avançadas por semana`}</Text>
            <Text style={styles.item}>• Consulta extra: {money(plan.extra_lookup_price_cents)}</Text>
            {plan.family_seats > 1 ? <Text style={styles.item}>• Até {plan.family_seats} pessoas · franquia compartilhada</Text> : null}
            <Text style={styles.item}>• {plan.protection_advanced ? 'Proteção avançada e regras personalizadas' : 'Proteção básica'}</Text>

            {!free ? <PrimaryButton label="ESCOLHER PLANO" onPress={() => {}} /> : null}
          </Card>
        );
      })}

      <Text style={styles.note}>As franquias semanais não acumulam. Créditos comprados ficam separados. A compra dentro do Android será ativada na integração com Google Play Billing.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingTop: 54, paddingBottom: 34, gap: 14, backgroundColor: theme.colors.bg, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  plan: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
  promo: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', marginTop: 6 },
  priceBox: { alignItems: 'flex-end' },
  old: { color: theme.colors.muted, textDecorationLine: 'line-through', fontSize: 12 },
  price: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
  period: { color: theme.colors.muted, fontSize: 11 },
  item: { color: theme.colors.muted, fontSize: 13, lineHeight: 21, marginTop: 5 },
  note: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
});
