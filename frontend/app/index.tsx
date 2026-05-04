import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Token kontrolü yapılırken loading göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F6F2' }}>
        <ActivityIndicator size="large" color="#0A4D44" />
      </View>
    );
  }

  // Giriş yapılmamışsa login'e
  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  // Rol bazlı yönlendirme
  if (user.role === 'business') {
    return <Redirect href="/business/business-dashboard" />;
  }

  return <Redirect href="/(tabs)" />;
}