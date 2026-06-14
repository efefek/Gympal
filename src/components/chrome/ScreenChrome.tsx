import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusRibbon } from './StatusRibbon';
import { ProfileRibbon } from './ProfileRibbon';

/* Her ana ekranın üstüne oturan sabit çapalar:
   sol = durum (StatusRibbon), sağ = profil (ProfileRibbon).
   Ekran içeriğinin ÜSTÜNDE absolute durur (zIndex). */

export function ScreenChrome() {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 20,
        right: 20,
        zIndex: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View pointerEvents="box-none">
        <StatusRibbon />
      </View>
      <View pointerEvents="box-none">
        <ProfileRibbon />
      </View>
    </View>
  );
}
