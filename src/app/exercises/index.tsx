import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Faz 4'te: 1323 egzersiz, client-side filtre (search/equipment/muscle), FlatList grid
export default function ExercisesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted font-mono text-xs uppercase tracking-widest">Exercises</Text>
      </View>
    </SafeAreaView>
  );
}
