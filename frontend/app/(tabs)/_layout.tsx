import React, { createContext, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. UYGULAMANIN ORTAK HAFIZASI (Context API)
export const FavoritesContext = createContext<any>(null);

export default function TabLayout() {
  // Favori ID'lerini tuttuğumuz yer
  const [favorites, setFavorites] = useState<string[]>([]);

  // Favoriye ekleme / çıkarma fonksiyonu
  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  return (
    // 2. TÜM SEKMELERİ BU HAFIZAYA BAĞLIYORUZ
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
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
            title: 'Keşfet',
            tabBarIcon: ({ color }) => <Ionicons name="compass" size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            title: 'Göz At',
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
            title: 'Profil',
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} />,
          }}
        />
      </Tabs>
    </FavoritesContext.Provider>
  );
}