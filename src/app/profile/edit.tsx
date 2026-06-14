import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: 4 adımlı onboarding (basics → diet → equipment → summary)
export default function ProfileEditScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Edit Profile</Text>
      </View>
    </SafeAreaView>
  );
}
