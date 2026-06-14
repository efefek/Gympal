import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: Profil özeti, achievement'lar, sağ ribbon genişletilmiş görünümü
export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Profile</Text>
      </View>
    </SafeAreaView>
  );
}
