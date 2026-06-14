import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 3'te: Groq provider + tool calling + preview/onay akışı
export default function BuddyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Buddy</Text>
        <Text className="text-fg text-lg font-semibold mt-2">AI Companion</Text>
      </View>
    </SafeAreaView>
  );
}
