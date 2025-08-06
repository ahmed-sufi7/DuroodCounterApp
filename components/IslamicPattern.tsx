import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';

export function IslamicPattern() {
  return (
    <View style={styles.container}>
      {/* Geometric pattern using CSS/React Native styling */}
      <View style={styles.pattern}>
        {Array.from({ length: 24 }, (_, i) => (
          <View key={i} style={[styles.tile, { 
            left: (i % 6) * 60, 
            top: Math.floor(i / 6) * 60 
          }]}>
            <View style={styles.star} />
            <View style={[styles.star, styles.starRotated]} />
          </View>
        ))}
      </View>
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
    opacity: 0.03,
    overflow: 'hidden',
  },
  pattern: {
    flex: 1,
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: Colors.secondary.warmGold,
    transform: [{ rotate: '45deg' }],
  },
  starRotated: {
    transform: [{ rotate: '0deg' }],
  },
});
