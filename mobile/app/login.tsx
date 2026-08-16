import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit() {
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: 'aloid://login' },
        });
        if (error) throw error;
        if (data.session) router.replace('/');
        else setMessage('Conta criada. Confirme o cadastro no seu e-mail.');
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Não foi possível concluir o acesso.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>CONTA ALÔ ID</Text>
        <Text style={styles.title}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
        <Text style={styles.subtitle}>Use a mesma conta do ALÔ ID web.</Text>

        <Card style={styles.form}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={styles.input}
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            style={styles.input}
          />

          <PrimaryButton
            label={loading ? 'PROCESSANDO...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            onPress={submit}
            disabled={loading || !email.trim() || password.length < 6}
          />

          {!!message && <Text style={styles.message}>{message}</Text>}

          <Text
            onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}
            style={styles.switch}
          >
            {mode === 'login' ? 'Ainda não tem conta? Criar conta' : 'Já possui conta? Entrar'}
          </Text>
        </Card>

        <Text onPress={() => router.back()} style={styles.back}>← Voltar</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 18, paddingTop: 72, gap: 14, backgroundColor: theme.colors.bg, flexGrow: 1 },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 35, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14 },
  form: { gap: 10, marginTop: 8 },
  label: { color: '#91A8BF', fontSize: 10, fontWeight: '900', marginTop: 5 },
  input: { minHeight: 52, borderRadius: 13, paddingHorizontal: 13, backgroundColor: theme.colors.panel2, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 16 },
  message: { color: theme.colors.primary, fontSize: 13, lineHeight: 19 },
  switch: { color: theme.colors.primary, textAlign: 'center', fontWeight: '900', paddingVertical: 8 },
  back: { color: theme.colors.muted, fontWeight: '800', paddingVertical: 12 },
});
