import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#0A4D44', 
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { 
        height: 60, 
        paddingBottom: 10, 
        paddingTop: 5,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
      },
      headerShown: false 
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Keşfet', // Discover yerine Türkçe yazıldı
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Göz At', // Browse yerine Türkçe yazıldı
          tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil', // Profile yerine Türkçe yazıldı
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}