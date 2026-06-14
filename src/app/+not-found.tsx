import { Link } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">404</Text>
        <Text className="text-fg text-2xl font-black">Sayfa bulunamadı</Text>
        <Link href="/">
          <Text className="text-muted underline">Ana sayfaya dön</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
