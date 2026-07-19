import AsyncStorage from '@react-native-async-storage/async-storage';

// Paint cached data immediately, then refresh in the background — never
// block a screen on the network.
export async function cached<T>(key: string, fetcher: () => Promise<T>, onData: (data: T) => void) {
  const raw = await AsyncStorage.getItem(`cache:${key}`);
  if (raw) onData(JSON.parse(raw) as T);

  const fresh = await fetcher();
  await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(fresh));
  onData(fresh);
}
