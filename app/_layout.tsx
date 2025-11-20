import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';
import { WatchHistoryProvider } from '../src/contexts/WatchHistoryContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <WatchHistoryProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000' },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="home" />
            <Stack.Screen name="player" />
            <Stack.Screen name="channel-details" />
            <Stack.Screen name="movie-details" />
            <Stack.Screen name="series-details" />
          </Stack>
        </WatchHistoryProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
