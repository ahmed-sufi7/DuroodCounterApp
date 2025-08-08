import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';

export function ParticleBackground() {
  // Simple static particles for reliable cross-platform visibility
  const staticParticles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100, // Use percentage for responsiveness
    top: Math.random() * 100,
    size: Math.random() * 8 + 4, // 4-12px
    opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 opacity
  }));

  return (
    <View style={styles.container}>
      {/* Simple static particles */}
      {staticParticles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
      
      {/* Larger accent particles for visibility */}
      {Array.from({ length: 8 }, (_, i) => (
        <View
          key={`accent-${i}`}
          style={[
            styles.accentParticle,
            {
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 50,
  },
  accentParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 6,
    opacity: 0.6,
  },
});
