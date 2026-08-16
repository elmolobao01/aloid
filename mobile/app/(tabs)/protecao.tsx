import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import { theme } from '@/lib/theme';

export default function ProtectionScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.shield}><Text style={styles.shieldText}>◇</Text></View>
      <Text style={styles.eyebrow}>PROTEÇÃO</Text>
      <Text style={styles.title}>Proteção de chamadas</Text>
      <Text style={styles.subtitle}>
        Esta é a área que receberá identificação em tempo real, bloqueio e regras inteligentes de proteção.
      </Text>

      <Card>
        <Feature title="Identificação em tempo real" text="Exibir sinais do ALÔ ID durante a chamada recebida." />
        <Feature title="Bloqueio inteligente" text="Bloquear categorias e números definidos pelo usuário." />
        <Feature title="Listas pessoais" text="Permitir, bloquear e sinalizar números conhecidos." />
      </Card>

      <Card>
        <Text style={styles.noticeTitle}>Próxima fase nativa</Text>
        <Text style={styles.subtitle}>
          Para ativar proteção durante chamadas, o app precisará de um development build e integração nativa específica para Android e iOS.
        </Text>
      </Card>
    </ScrollView>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return <View style={styles.feature}>
    <View style={styles.dot} />
    <View style={{ flex: 1 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingTop: 54, paddingBottom: 30, gap: 14, backgroundColor: theme.colors.bg, flexGrow: 1 },
  shield: { width: 62, height: 62, borderRadius: 20, backgroundColor: '#0B2A46', borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  shieldText: { color: theme.colors.primary, fontSize: 29 },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  feature: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: theme.colors.primary, marginTop: 6 },
  featureTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
  featureText: { color: theme.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 3 },
  noticeTitle: { color: theme.colors.warning, fontSize: 15, fontWeight: '900', marginBottom: 5 },
});
