import { Image } from 'expo-image';

export default function Avatar({ uri, size = 40 }: { uri?: string; size?: number }) {
  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
}


