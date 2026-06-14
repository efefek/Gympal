import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: Body Count (BMI), çoklu seri trend, vital log'ları
export default function VitalsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Vitals</Text>
      </View>
    </SafeAreaView>
  );
}
