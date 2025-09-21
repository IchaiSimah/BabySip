import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { styles } from '@/styles/styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>This screen does not exist.</Text>
        <Link href="/" style={styles.notFoundLink}>
          <Text style={styles.notFoundLinkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
} 