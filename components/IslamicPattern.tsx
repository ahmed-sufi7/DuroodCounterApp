import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';

export function IslamicPattern() {
  const { width, height } = Dimensions.get('window');
  
  // Calculate grid dimensions based on screen size
  const cellSize = 50;
  const gridCols = Math.ceil(width / cellSize) + 2;
  const gridRows = Math.ceil(height / cellSize) + 2;
  const totalCells = gridCols * gridRows;

  return (
    <View style={styles.container}>
      {/* Main geometric grid pattern */}
      <View style={styles.geometricGrid}>
        {Array.from({ length: totalCells }, (_, i) => {
          const row = Math.floor(i / gridCols);
          const col = i % gridCols;
          return (
            <View 
              key={`grid-${i}`} 
              style={[
                styles.gridCell,
                { 
                  left: col * cellSize - cellSize, 
                  top: row * cellSize - cellSize,
                  transform: [{ rotate: `${(row + col) * 45}deg` }]
                }
              ]}
            >
              <View style={styles.octagon} />
              <View style={[styles.innerStar, { transform: [{ rotate: '22.5deg' }] }]} />
            </View>
          );
        })}
      </View>

      {/* Arabesque flowing patterns */}
      <View style={styles.arabesqueLayer}>
        {Array.from({ length: Math.ceil((width * height) / 15000) }, (_, i) => {
          const cols = Math.ceil(width / 100);
          const row = Math.floor(i / cols);
          const col = i % cols;
          return (
            <View 
              key={`arabesque-${i}`}
              style={[
                styles.arabesquePattern,
                {
                  left: col * 100 + 25,
                  top: row * 150 + 50,
                  transform: [{ rotate: `${i * 30}deg` }]
                }
              ]}
            >
              <View style={styles.leafShape} />
              <View style={[styles.leafShape, styles.leafMirrored]} />
              <View style={styles.centerCircle} />
            </View>
          );
        })}
      </View>

      {/* Islamic star and polygon patterns */}
      <View style={styles.starLayer}>
        {Array.from({ length: Math.ceil((width * height) / 10000) }, (_, i) => {
          const cols = Math.ceil(width / 80);
          const row = Math.floor(i / cols);
          const col = i % cols;
          return (
            <View 
              key={`star-${i}`}
              style={[
                styles.islamicStar,
                {
                  left: col * 80 + 40,
                  top: row * 120 + 60,
                  transform: [{ rotate: `${i * 18}deg` }]
                }
              ]}
            >
              {/* 8-pointed star */}
              <View style={styles.starPoint1} />
              <View style={styles.starPoint2} />
              <View style={styles.starCenter} />
            </View>
          );
        })}
      </View>

      {/* Geometric border patterns */}
      <View style={styles.borderPatterns}>
        {/* Horizontal borders */}
        {Array.from({ length: Math.ceil(height / 200) }, (_, i) => (
          <View 
            key={`h-border-${i}`}
            style={[
              styles.horizontalBorder,
              { top: i * 200 + 100 }
            ]}
          >
            {Array.from({ length: Math.ceil(width / 25) }, (_, j) => (
              <View 
                key={`h-pattern-${j}`}
                style={[
                  styles.borderElement,
                  { left: j * 25 }
                ]}
              />
            ))}
          </View>
        ))}
        
        {/* Vertical borders */}
        {Array.from({ length: Math.ceil(width / 300) }, (_, i) => (
          <View 
            key={`v-border-${i}`}
            style={[
              styles.verticalBorder,
              { left: i * 300 + 150 }
            ]}
          >
            {Array.from({ length: Math.ceil(height / 25) }, (_, j) => (
              <View 
                key={`v-pattern-${j}`}
                style={[
                  styles.borderElement,
                  { top: j * 25 }
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Intricate geometric medallions */}
      <View style={styles.medallionLayer}>
        {Array.from({ length: Math.ceil((width * height) / 40000) }, (_, i) => {
          const cols = Math.ceil(width / 150);
          const row = Math.floor(i / cols);
          const col = i % cols;
          return (
            <View 
              key={`medallion-${i}`}
              style={[
                styles.medallion,
                {
                  left: col * 150 + 75,
                  top: row * 250 + 125,
                  transform: [{ rotate: `${i * 60}deg` }]
                }
              ]}
            >
              <View style={styles.medallionOuter} />
              <View style={styles.medallionMiddle} />
              <View style={styles.medallionInner} />
              <View style={styles.medallionCenter} />
            </View>
          );
        })}
      </View>

      {/* Calligraphy-inspired flowing lines */}
      <View style={styles.calligraphyLayer}>
        {Array.from({ length: Math.ceil(width / 50) }, (_, i) => (
          <View 
            key={`calligraphy-${i}`}
            style={[
              styles.flowingLine,
              {
                left: i * 50,
                top: (i % 2) * 300 + 150,
                transform: [{ rotate: `${i * 45}deg` }]
              }
            ]}
          />
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
    opacity: 0.04,
    overflow: 'hidden',
  },
  
  // Geometric Grid Layer
  geometricGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridCell: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  octagon: {
    width: 20,
    height: 20,
    backgroundColor: Colors.secondary.warmGold,
    transform: [{ rotate: '22.5deg' }],
  },
  innerStar: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: Colors.primary.darkTeal,
    transform: [{ rotate: '45deg' }],
  },

  // Arabesque Layer
  arabesqueLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  arabesquePattern: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafShape: {
    position: 'absolute',
    width: 30,
    height: 15,
    backgroundColor: Colors.secondary.warmGold,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 15,
  },
  leafMirrored: {
    transform: [{ scaleY: -1 }],
  },
  centerCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.darkTeal,
  },

  // Star Layer
  starLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  islamicStar: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starPoint1: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: Colors.secondary.warmGold,
    transform: [{ rotate: '45deg' }],
  },
  starPoint2: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: Colors.secondary.warmGold,
    transform: [{ rotate: '0deg' }],
  },
  starCenter: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.darkTeal,
  },

  // Border Patterns
  borderPatterns: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  horizontalBorder: {
    position: 'absolute',
    width: '100%',
    height: 2,
    flexDirection: 'row',
  },
  verticalBorder: {
    position: 'absolute',
    height: '100%',
    width: 2,
    flexDirection: 'column',
  },
  borderElement: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: Colors.secondary.warmGold,
    transform: [{ rotate: '45deg' }],
  },

  // Medallion Layer
  medallionLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  medallion: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medallionOuter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.secondary.warmGold,
  },
  medallionMiddle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary.warmGold,
    opacity: 0.3,
  },
  medallionInner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1,
    borderColor: Colors.primary.darkTeal,
  },
  medallionCenter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.darkTeal,
  },

  // Calligraphy Layer
  calligraphyLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flowingLine: {
    position: 'absolute',
    width: 100,
    height: 2,
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 1,
    opacity: 0.6,
  },
});
