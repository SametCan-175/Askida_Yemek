import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Token kontrolü yapılırken loading göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F6F2' }}>
        <ActivityIndicator size="large" color="#0A4D44" />
      </View>
    );
  }

  // Giriş yapılmışsa ana sayfaya, yapılmamışsa login'e
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}