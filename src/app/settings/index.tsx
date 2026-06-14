import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: Clear data (tüm gympal-* key), Google Health dummy, AI Companion (Groq key/model), tema seçimi
export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Settings</Text>
      </View>
    </SafeAreaView>
  );
}
