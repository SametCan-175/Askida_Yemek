import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { router } from 'expo-router';

export default function SurpriseInfoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.title}>SÜRPRİZE HAZIR OL</Text>

        <Text style={styles.description}>
          İşletmeler gün sonunda ellerinde ne kalacağını tam olarak bilemezler, 
          bu yüzden Sürpriz Paketinden ne çıkacağı her zaman bir sürprizdir.
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/400x400/0A4D44/FFFFFF?text=Surpriz+Paket' }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.pagination}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => router.push('/onboarding-reason')}
        >
          <Text style={styles.nextButtonText}>Sonraki</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A4D44',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '85%',
    height: '85%',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#0A4D44',
    width: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#0A4D44',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});