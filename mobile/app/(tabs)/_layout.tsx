import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { theme } from '@/lib/theme';

function Icon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: 19, color: focused ? theme.colors.primary : '#718AA0' }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#718AA0',
        tabBarStyle: {
          backgroundColor: '#061524',
          borderTopColor: '#173D5D',
          height: 72,
          paddingTop: 7,
          paddingBottom: 9,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Consulta',
          tabBarIcon: ({ focused }) => <Icon symbol="⌕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => <Icon symbol="◷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="protecao"
        options={{
          title: 'Proteção',
          tabBarIcon: ({ focused }) => <Icon symbol="◇" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <Icon symbol="○" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
