import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { apiFetch } from '@/lib/api';
import { digitsOnly, formatBRPhone } from '@/lib/phone';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';

type ProtectionData = {
  plan: 'free' | 'premium' | string;
  capabilities: {
    personal_lists: boolean;
    list_limit_each: number;
    block_outside_contacts: boolean;
    block_by_carrier: boolean;
    block_by_category: boolean;
    custom_default_action: boolean;
    schedule_rules: boolean;
  };
  settings: {
    protection_enabled: boolean;
    block_outside_contacts: boolean;
    silence_unknown: boolean;
    only_high_confidence: boolean;
    default_action: 'allow' | 'alert' | 'silence' | 'block';
  };
  allowlist: Array<{ id: string; e164: string; label?: string | null }>;
  blocklist: Array<{ id: string; e164: string; label?: string | null }>;
  blocked_carriers: string[];
  blocked_categories: string[];
};

const emptyData: ProtectionData = {
  plan: 'free',
  capabilities: {
    personal_lists: true,
    list_limit_each: 10,
    block_outside_contacts: false,
    block_by_carrier: false,
    block_by_category: false,
    custom_default_action: false,
    schedule_rules: false,
  },
  settings: {
    protection_enabled: false,
    block_outside_contacts: false,
    silence_unknown: false,
    only_high_confidence: true,
    default_action: 'alert',
  },
  allowlist: [],
  blocklist: [],
  blocked_carriers: [],
  blocked_categories: [],
};

export default function ProtectionScreen() {
  const router = useRouter();
  const [data, setData] = useState<ProtectionData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('');
  const [carrier, setCarrier] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setLoading(false);
        return;
      }

      const response = await apiFetch('/api/v1/protection');
      const json = await response.json();

      if (!response.ok) throw new Error(json?.error || 'Falha ao carregar proteção.');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar proteção.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function patchSettings(next: Partial<ProtectionData['settings']>) {
    const previous = data;
    const updated = {
      ...data,
      settings: { ...data.settings, ...next },
    };
    setData(updated);
    setSaving(true);
    setError('');

    try {
      const response = await apiFetch('/api/v1/protection', {
        method: 'PATCH',
        body: JSON.stringify({ settings: updated.settings }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Não foi possível salvar.');
      setData(json);
    } catch (e) {
      setData(previous);
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function addNumber(type: 'allow' | 'block') {
    if (digitsOnly(phone).length < 10) {
      Alert.alert('Número inválido', 'Digite DDD + número.');
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch('/api/v1/protection/numbers', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          list_type: type,
          label: label.trim() || null,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Não foi possível salvar o número.');

      setData(json);
      setPhone('');
      setLabel('');
    } catch (e) {
      Alert.alert('ALÔ ID', e instanceof Error ? e.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function removeNumber(e164: string) {
    setSaving(true);
    try {
      const response = await apiFetch('/api/v1/protection/numbers', {
        method: 'DELETE',
        body: JSON.stringify({ phone: e164 }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Não foi possível remover.');
      setData(json);
    } catch (e) {
      Alert.alert('ALÔ ID', e instanceof Error ? e.message : 'Falha ao remover.');
    } finally {
      setSaving(false);
    }
  }

  async function addCarrier() {
    if (!data.capabilities.block_by_carrier) {
      Alert.alert('ALÔ ID Premium', 'Bloqueio por operadora é uma personalização Premium.');
      return;
    }

    if (carrier.trim().length < 2) return;

    setSaving(true);
    try {
      const response = await apiFetch('/api/v1/protection/carriers', {
        method: 'POST',
        body: JSON.stringify({ carrier }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Não foi possível salvar.');
      setData(json);
      setCarrier('');
    } catch (e) {
      Alert.alert('ALÔ ID', e instanceof Error ? e.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  }

  const signedIn = Boolean(data?.capabilities?.personal_lists);
  const premium = data.plan === 'premium';

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <View style={styles.shield}><Text style={styles.shieldText}>◇</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>PROTEÇÃO</Text>
          <Text style={styles.title}>Proteção de chamadas</Text>
        </View>
        <View style={[styles.planBadge, premium && styles.planBadgePremium]}>
          <Text style={[styles.planBadgeText, premium && styles.planBadgeTextPremium]}>
            {data.plan.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Configure agora suas regras. Elas serão aplicadas às chamadas quando o módulo nativo de proteção estiver ativado.
      </Text>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {saving && <Text style={styles.saving}>Salvando preferências...</Text>}

      {!signedIn ? (
        <Card>
          <Text style={styles.cardTitle}>Entre para configurar sua proteção</Text>
          <Text style={styles.subtitle}>As regras e listas são sincronizadas com sua conta ALÔ ID.</Text>
          <Text onPress={() => router.push('/login')} style={styles.link}>Entrar ou criar conta →</Text>
        </Card>
      ) : (
        <>
          <Card>
            <SwitchRow
              title="Proteção ALÔ ID"
              text="Liga ou desliga o motor de proteção personalizado."
              value={data.settings.protection_enabled}
              onValueChange={value => patchSettings({ protection_enabled: value })}
            />

            <Divider />

            <SwitchRow
              title="Somente alta confiança"
              text="Evita ações automáticas quando os sinais de risco forem inconclusivos."
              value={data.settings.only_high_confidence}
              onValueChange={value => patchSettings({ only_high_confidence: value })}
            />

            <Divider />

            <SwitchRow
              title="Silenciar desconhecidos"
              text="Preferência para chamadas não identificadas."
              value={data.settings.silence_unknown}
              onValueChange={value => patchSettings({ silence_unknown: value })}
            />
          </Card>

          <Card>
            <PremiumHeader title="PERSONALIZAÇÕES PREMIUM" premium={premium} />

            <LockedSwitch
              title="Bloquear fora da agenda"
              text="Permite bloquear chamadas de números que não estejam nos contatos."
              enabled={data.capabilities.block_outside_contacts}
              value={data.settings.block_outside_contacts}
              onChange={value => patchSettings({ block_outside_contacts: value })}
            />

            <Divider />

            <View>
              <Text style={styles.rowTitle}>Bloquear por operadora</Text>
              <Text style={styles.rowText}>Crie uma lista de operadoras bloqueadas.</Text>

              <View style={styles.inlineForm}>
                <TextInput
                  value={carrier}
                  onChangeText={setCarrier}
                  editable={data.capabilities.block_by_carrier}
                  placeholder={data.capabilities.block_by_carrier ? 'Ex.: Operadora X' : 'Disponível no Premium'}
                  placeholderTextColor="#657D92"
                  style={[styles.input, !data.capabilities.block_by_carrier && styles.inputLocked]}
                />
                <Pressable
                  onPress={addCarrier}
                  style={[styles.smallButton, !data.capabilities.block_by_carrier && styles.smallButtonLocked]}
                >
                  <Text style={styles.smallButtonText}>Adicionar</Text>
                </Pressable>
              </View>

              {data.blocked_carriers.map(item => (
                <View key={item} style={styles.listItem}>
                  <Text style={styles.listMain}>{item}</Text>
                  <Text style={styles.premiumMini}>PREMIUM</Text>
                </View>
              ))}
            </View>

            <Divider />

            <View style={styles.actionPreview}>
              <Text style={styles.rowTitle}>Regras futuras do Premium</Text>
              <Text style={styles.rowText}>
                Bloqueio por categoria, ação padrão personalizada, regras por horário e proteção avançada.
              </Text>
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionLabel}>LISTAS PESSOAIS</Text>
            <Text style={styles.cardTitle}>Confiáveis e lista negra</Text>
            <Text style={styles.subtitle}>
              Plano {data.plan.toUpperCase()}: até {data.capabilities.list_limit_each} números em cada lista.
            </Text>

            <TextInput
              value={formatBRPhone(phone)}
              onChangeText={text => setPhone(digitsOnly(text))}
              keyboardType="phone-pad"
              placeholder="(DDD) 9XXXX-XXXX"
              placeholderTextColor="#657D92"
              style={[styles.input, { marginTop: 14 }]}
            />
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Nome/observação opcional"
              placeholderTextColor="#657D92"
              style={[styles.input, { marginTop: 9 }]}
            />

            <View style={styles.twoButtons}>
              <Pressable onPress={() => addNumber('allow')} style={[styles.listButton, styles.allowButton]}>
                <Text style={styles.listButtonText}>+ CONFIÁVEL</Text>
              </Pressable>
              <Pressable onPress={() => addNumber('block')} style={[styles.listButton, styles.blockButton]}>
                <Text style={styles.listButtonText}>+ LISTA NEGRA</Text>
              </Pressable>
            </View>

            <ListBlock
              title={`CONFIÁVEIS (${data.allowlist.length})`}
              items={data.allowlist}
              empty="Nenhum número confiável adicionado."
              onRemove={removeNumber}
              kind="allow"
            />

            <ListBlock
              title={`LISTA NEGRA (${data.blocklist.length})`}
              items={data.blocklist}
              empty="Nenhum número bloqueado adicionado."
              onRemove={removeNumber}
              kind="block"
            />
          </Card>

          <Card>
            <Text style={styles.noticeTitle}>Como as regras serão aplicadas</Text>
            <Text style={styles.ruleLine}>1. Lista de confiáveis → sempre permitir</Text>
            <Text style={styles.ruleLine}>2. Lista negra → sempre bloquear</Text>
            <Text style={styles.ruleLine}>3. Contatos → aplicar preferência do usuário</Text>
            <Text style={styles.ruleLine}>4. Operadora/categoria → regras Premium</Text>
            <Text style={styles.ruleLine}>5. Desconhecidos → política geral</Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function SwitchRow({
  title, text, value, onValueChange,
}: {
  title: string; text: string; value: boolean; onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowText}>{text}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#243A4D', true: '#245E88' }}
        thumbColor={value ? theme.colors.primary : '#A4B2BF'}
      />
    </View>
  );
}

function LockedSwitch({
  title, text, enabled, value, onChange,
}: {
  title: string; text: string; enabled: boolean; value: boolean; onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleWithBadge}>
          <Text style={[styles.rowTitle, !enabled && styles.lockedText]}>{title}</Text>
          {!enabled && <Text style={styles.premiumMini}>PREMIUM</Text>}
        </View>
        <Text style={[styles.rowText, !enabled && styles.lockedText]}>{text}</Text>
      </View>
      <Switch
        disabled={!enabled}
        value={enabled && value}
        onValueChange={onChange}
        trackColor={{ false: '#24313D', true: '#245E88' }}
        thumbColor={enabled && value ? theme.colors.primary : '#667786'}
      />
    </View>
  );
}

function ListBlock({
  title, items, empty, onRemove, kind,
}: {
  title: string;
  items: Array<{ id: string; e164: string; label?: string | null }>;
  empty: string;
  onRemove: (e164: string) => void;
  kind: 'allow' | 'block';
}) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : items.map(item => (
        <View key={item.id} style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listMain}>{formatBRPhone(item.e164)}</Text>
            {!!item.label && <Text style={styles.listSub}>{item.label}</Text>}
          </View>
          <View style={[styles.kindBadge, kind === 'block' ? styles.kindBlock : styles.kindAllow]}>
            <Text style={styles.kindText}>{kind === 'block' ? 'BLOQUEAR' : 'PERMITIR'}</Text>
          </View>
          <Pressable onPress={() => onRemove(item.e164)}>
            <Text style={styles.remove}>Remover</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function PremiumHeader({ title, premium }: { title: string; premium: boolean }) {
  return (
    <View style={styles.premiumHeader}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <Text style={[styles.premiumStatus, premium && styles.premiumStatusActive]}>
        {premium ? 'ATIVO' : 'BLOQUEADO NO FREE'}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingTop: 54, paddingBottom: 34, gap: 14, backgroundColor: theme.colors.bg, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shield: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#0B2A46', borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  shieldText: { color: theme.colors.primary, fontSize: 27 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontSize: 27, fontWeight: '900', marginTop: 2 },
  subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
  planBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#0A2B45', borderWidth: 1, borderColor: '#27577A' },
  planBadgePremium: { backgroundColor: '#312858', borderColor: '#6653B5' },
  planBadgeText: { color: theme.colors.primary, fontSize: 9, fontWeight: '900' },
  planBadgeTextPremium: { color: '#B5A9FF' },
  error: { color: theme.colors.danger, backgroundColor: '#321A25', borderRadius: 12, padding: 12 },
  saving: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
  link: { color: theme.colors.primary, fontWeight: '900', marginTop: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 },
  rowTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
  rowText: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  lockedText: { color: '#71879A' },
  divider: { height: 1, backgroundColor: '#173A56', marginVertical: 12 },
  sectionLabel: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 5 },
  premiumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  premiumStatus: { color: '#71879A', fontSize: 9, fontWeight: '900' },
  premiumStatusActive: { color: '#B5A9FF' },
  titleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  premiumMini: { color: '#A99CFF', fontSize: 8, fontWeight: '900', backgroundColor: '#2B2447', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999 },
  input: { minHeight: 48, borderRadius: 13, paddingHorizontal: 13, backgroundColor: theme.colors.panel2, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 15 },
  inputLocked: { opacity: 0.55 },
  inlineForm: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallButton: { minHeight: 48, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#163C5B', borderRadius: 12 },
  smallButtonLocked: { opacity: 0.45 },
  smallButtonText: { color: '#BBDFF7', fontWeight: '900', fontSize: 11 },
  actionPreview: { paddingVertical: 3 },
  twoButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  listButton: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1 },
  allowButton: { backgroundColor: '#0B342D', borderColor: '#1C6C59' },
  blockButton: { backgroundColor: '#3A1B25', borderColor: '#733847' },
  listButtonText: { color: '#F3F8FC', fontSize: 11, fontWeight: '900' },
  empty: { color: '#73899E', fontSize: 12, marginTop: 9 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#153550' },
  listMain: { color: theme.colors.text, fontSize: 14, fontWeight: '850' },
  listSub: { color: theme.colors.muted, fontSize: 11, marginTop: 2 },
  kindBadge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 },
  kindAllow: { backgroundColor: '#0B3A30' },
  kindBlock: { backgroundColor: '#48202B' },
  kindText: { color: '#D8E8F2', fontSize: 7, fontWeight: '900' },
  remove: { color: '#8EA5B9', fontSize: 10, fontWeight: '800' },
  noticeTitle: { color: theme.colors.warning, fontSize: 15, fontWeight: '900', marginBottom: 7 },
  ruleLine: { color: theme.colors.muted, fontSize: 12, lineHeight: 20 },
});
