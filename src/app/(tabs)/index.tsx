import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: PanelPager (Reanimated 3 gesture) ile Dashboard + Program panelleri
export default function BunkerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Bunker</Text>
        <Text className="text-fg text-4xl font-black tracking-tighter mt-2">GymPal</Text>
      </View>
    </SafeAreaView>
  );
}
