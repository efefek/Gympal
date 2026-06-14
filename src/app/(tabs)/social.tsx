import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: Yatay pager (feed / events / find a pal), harita events bağlamında
export default function SocialScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Social</Text>
      </View>
    </SafeAreaView>
  );
}
