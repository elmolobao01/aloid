import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { apiFetch } from '@/lib/api';
import { formatBRPhone, digitsOnly } from '@/lib/phone';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

type Lookup = any;

export default function ConsultaScreen() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  useMemo(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  const digits = digitsOnly(phone);

  async function lookup() {
    if (digits.length < 10) {
      setError('Digite DDD + número.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiFetch('/api/v1/phone/lookup', {
        method: 'POST',
        body: JSON.stringify({ phone: `+55${digits}` }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || 'Falha ao consultar o número.');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir a consulta.');
    } finally {
      setLoading(false);
    }
  }

  const telecom = result?.telecom;
  const technicalRisk = result?.technicalRisk;
  const phoneInfo = result?.phone;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>ALÔ <Text style={styles.logoAccent}>ID</Text></Text>
            <Text style={styles.tagline}>IDENTIFIQUE • PROTEJA • CONSULTE</Text>
          </View>
          {!signedIn && <Link href="/login" style={styles.loginLink}>Entrar</Link>}
        </View>

        <Text style={styles.eyebrow}>CONSULTA RÁPIDA</Text>
        <Text style={styles.title}>Saiba quem chama.</Text>
        <Text style={styles.subtitle}>Consulte números brasileiros e veja sinais técnicos e comunitários.</Text>

        <Card style={styles.searchCard}>
          <View style={styles.countryRow}>
            <View style={styles.countryBadge}>
              <Text style={styles.countrySmall}>BR</Text>
              <Text style={styles.countryCode}>+55</Text>
            </View>
            <TextInput
              value={formatBRPhone(phone)}
              onChangeText={text => setPhone(digitsOnly(text))}
              placeholder="(71) 99999-9999"
              placeholderTextColor="#5E7890"
              keyboardType="phone-pad"
              maxLength={16}
              style={styles.input}
            />
          </View>

          <PrimaryButton
            label={loading ? 'IDENTIFICANDO...' : 'IDENTIFICAR'}
            onPress={lookup}
            disabled={loading || digits.length < 10}
          />
        </Card>

        {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 28 }} />}
        {!!error && <Text style={styles.error}>{error}</Text>}

        {result && (
          <View style={styles.results}>
            <Card>
              <View style={styles.resultTop}>
                <View>
                  <Text style={styles.eyebrow}>RESULTADO</Text>
                  <Text style={styles.number}>{phoneInfo?.national || formatBRPhone(digits)}</Text>
                  <Text style={styles.e164}>{phoneInfo?.e164 || `+55${digits}`}</Text>
                </View>
                <View style={styles.validBadge}>
                  <Text style={styles.validText}>✓ Número válido</Text>
                </View>
              </View>
            </Card>

            <View style={styles.grid}>
              <ResultCard label="TIPO DE LINHA" value={lineLabel(phoneInfo?.lineType)} sub={`DDD ${phoneInfo?.ddd || '—'}`} />
              <ResultCard label="LOCALIZAÇÃO" value={phoneInfo?.state || '—'} sub={phoneInfo?.region || 'Referência do DDD'} />
              <ResultCard label="OPERADORA" value={telecom?.carrierCurrent || 'Não identificada'} sub="Consulta telecom" />
              <ResultCard label="RISCO TÉCNICO" value={riskLabel(technicalRisk?.level)} sub={technicalRisk?.isVoip === false ? 'Não VoIP' : 'Sinal técnico'} />
            </View>

            {!signedIn && (
              <Card>
                <Text style={styles.accountTitle}>Crie sua conta ALÔ ID</Text>
                <Text style={styles.subtitle}>Com uma conta, suas consultas entram no histórico e você pode contribuir com a reputação comunitária.</Text>
                <Link href="/login" style={styles.accountLink}>Entrar ou criar conta →</Link>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResultCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card style={styles.resultCard}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      <Text style={styles.resultSub}>{sub}</Text>
    </Card>
  );
}

function lineLabel(value?: string) {
  if (value === 'mobile') return 'Celular';
  if (value === 'landline' || value === 'fixed_or_other') return 'Fixo';
  return value || 'Não identificado';
}

function riskLabel(value?: string) {
  if (value === 'low') return 'Baixo risco';
  if (value === 'medium') return 'Risco moderado';
  if (value === 'high') return 'Alto risco';
  return 'Não classificado';
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 18, paddingTop: 54, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  logo: { color: theme.colors.text, fontSize: 27, fontWeight: '900' },
  logoAccent: { color: theme.colors.primary },
  tagline: { color: '#7890A6', fontSize: 9, letterSpacing: 1.5, marginTop: 2 },
  loginLink: { color: theme.colors.primary, fontWeight: '900', fontSize: 14, padding: 10 },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 38, lineHeight: 43, fontWeight: '900', marginTop: -3 },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  searchCard: { gap: 14 },
  countryRow: { flexDirection: 'row', gap: 10 },
  countryBadge: { width: 76, borderRadius: 14, backgroundColor: theme.colors.panel2, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  countrySmall: { color: theme.colors.primary, fontSize: 10, fontWeight: '900' },
  countryCode: { color: theme.colors.text, fontSize: 18, fontWeight: '900' },
  input: { flex: 1, minHeight: 58, borderRadius: 14, paddingHorizontal: 14, backgroundColor: theme.colors.panel2, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  error: { color: theme.colors.danger, backgroundColor: '#321A25', borderRadius: 12, padding: 12 },
  results: { gap: 12 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  number: { color: theme.colors.text, fontSize: 27, fontWeight: '900', marginTop: 5 },
  e164: { color: theme.colors.muted, marginTop: 2 },
  validBadge: { backgroundColor: '#07382F', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  validText: { color: theme.colors.success, fontWeight: '900', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resultCard: { width: '48%', minHeight: 132 },
  resultLabel: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  resultValue: { color: theme.colors.text, fontSize: 20, fontWeight: '900', marginTop: 9 },
  resultSub: { color: theme.colors.muted, fontSize: 12, marginTop: 6 },
  accountTitle: { color: theme.colors.text, fontWeight: '900', fontSize: 17 },
  accountLink: { color: theme.colors.primary, fontWeight: '900', marginTop: 8 },
});
