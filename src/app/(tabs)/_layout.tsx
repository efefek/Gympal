import { Tabs, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import {
  House,
  HeartPulse,
  MessageCircle,
  Users,
  CircleUserRound,
} from 'lucide-react-native';
import { defaultTheme } from '@/lib/tokens';

const ICON_SIZE = 22;
const c = defaultTheme;

// Sağ üst profil ikonu — her sekmede sabit
function ProfileButton() {
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      style={{ paddingRight: 16, paddingVertical: 8 }}
      hitSlop={8}
    >
      <CircleUserRound size={22} color={c.fg} />
    </Pressable>
  );
}

// Sol/sağ ribbon placeholder — Faz 4'te açılır panel haline gelecek
// Kapalıyken köşede siyah blok olarak durur (DESIGN_SYSTEM.md §2)
function LeftRibbon() {
  return (
    <View
      style={{
        width: 8,
        height: 32,
        backgroundColor: c.bg,
        borderRadius: 2,
        marginLeft: 0,
      }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: c.bg },
        headerShadowVisible: false,
        headerLeft: () => <LeftRibbon />,
        headerRight: () => <ProfileButton />,
        headerTitle: '',
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
