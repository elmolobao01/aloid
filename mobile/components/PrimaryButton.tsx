import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/lib/theme';

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        (disabled || pressed) && styles.dimmed,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary2,
    paddingHorizontal: 20,
  },
  dimmed: { opacity: 0.55 },
  text: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
