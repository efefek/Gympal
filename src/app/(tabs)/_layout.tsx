import { Tabs, router } from 'expo-router';
import { Pressable } from 'react-native';
import {
  House,
  HeartPulse,
  MessageCircle,
  Users,
  CircleUserRound,
} from 'lucide-react-native';
import { Fonts } from '@/lib/tokens';
import { useTheme } from '@/lib/theme-context';

const ICON_SIZE = 22;

// Sağ üst profil ikonu — her sekmede sabit
function ProfileButton({ color }: { color: string }) {
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      style={{ paddingRight: 16, paddingVertical: 8 }}
      hitSlop={8}
    >
      <CircleUserRound size={22} color={color} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const { theme: c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: c.bg },
        headerShadowVisible: false,
        headerRight: () => <ProfileButton color={c.fg} />,
        headerTitle: '',
        sceneStyle: { backgroundColor: c.bg },
        tabBarStyle: {
          backgroundColor: c.surface1,
          borderTopColor: c.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: c.fg,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontFamily: Fonts.mono,
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
