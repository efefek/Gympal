import { Tabs } from 'expo-router';
import { House, HeartPulse, MessageCircle, Users } from 'lucide-react-native';
import { Fonts } from '@/lib/tokens';
import { useTheme } from '@/lib/theme-context';

const ICON_SIZE = 22;

export default function TabsLayout() {
  const { theme: c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.bg },
        tabBarStyle: {
          backgroundColor: c.surface1,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
        },
        // Aktif sekme accent renkte (tek-az-renk), gradient yok
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontFamily: Fonts.mono,
          fontSize: 10,
          letterSpacing: 1,
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
