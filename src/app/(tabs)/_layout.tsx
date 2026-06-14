import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import {
  House,
  HeartPulse,
  MessageCircle,
  Users,
} from 'lucide-react-native';
import { defaultTheme } from '@/lib/tokens';

const ICON_SIZE = 22;
const c = defaultTheme;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface1,
          borderTopColor: c.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: c.fg,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontFamily: 'GeistMono',
          fontSize: 10,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bunker',
          tabBarIcon: ({ color }) => <House size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vitals"
        options={{
          title: 'Vitals',
          tabBarIcon: ({ color }) => <HeartPulse size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="buddy"
        options={{
          title: 'Buddy',
          tabBarIcon: ({ color }) => <MessageCircle size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <Users size={ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}
