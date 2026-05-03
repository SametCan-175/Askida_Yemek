import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}

export default function TabLayout() {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      <Tabs screenOptions={{
        tabBarActiveTintColor: '#0A4D44',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        },
        headerShown: false,
      }}>
        <Tabs.Screen name="index" options={{ title: 'Keşfet', tabBarIcon: ({ color }) => <Ionicons name="compass" size={26} color={color} /> }} />
        <Tabs.Screen name="browse" options={{ title: 'Göz At', tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} /> }} />
        <Tabs.Screen name="favorites" options={{ title: 'Favoriler', tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={26} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} /> }} />
      </Tabs>
    </FavoritesContext.Provider>
  );
}