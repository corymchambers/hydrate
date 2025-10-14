import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { useSettingsStore } from '@/src/state/settingsStore';
import { convertFromMl, getUnitSuffix } from '@/src/utils/conversions';
import WaterDrop from './WaterDrop';

const WaterGoalAnimation = ({ currentAmount = 750, goalAmount = 2000 }) => {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

  // Animated value for progress
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Responsive circle dimensions based on screen height
  const screenHeight = Dimensions.get('window').height;
  // Use smaller size for shorter screens (iPhone SE, etc.)
  const size = screenHeight < 700 ? 220 : 300;
  const strokeWidth = screenHeight < 700 ? 10 : 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Calculate the arc path for the progress
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createArcPath = (x, y, radius, startAngle, endAngle) => {
    if (endAngle <= 0) return '';

    // Cap at 359.99 to avoid full circle rendering issue
    const cappedEndAngle = Math.min(endAngle, 359.99);

    const start = polarToCartesian(x, y, radius, cappedEndAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = cappedEndAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  // Use animated value to create progress path
  const [currentProgressAngle, setCurrentProgressAngle] = React.useState(0);

  React.useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => {
      setCurrentProgressAngle((value / 100) * 360);
    });

    return () => animatedProgress.removeListener(listener);
  }, []);

  const progressPath = createArcPath(center, center, radius, 0, currentProgressAngle);

  // Calculate water fill height - should fill from bottom of circle
  const waterFillPercentage = percentage / 100;
  const waterY = center + radius - (2 * radius * waterFillPercentage);

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.circleContainer}>
          <Svg width={size} height={size} style={styles.svg}>
            <Defs>
              <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#A8D8EA" />
                <Stop offset="100%" stopColor="#79C7E3" />
              </LinearGradient>
              <ClipPath id="circleClip">
                <Circle cx={center} cy={center} r={radius - strokeWidth / 2} />
              </ClipPath>
            </Defs>

            {/* Background circle - very light */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E1F5FE"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Water fill inside circle */}
            <G clipPath="url(#circleClip)">
              <Path
                d={`
                  M 0 ${waterY}
                  Q ${size * 0.25} ${waterY - 8} ${size * 0.5} ${waterY}
                  T ${size} ${waterY}
                  L ${size} ${size}
                  L 0 ${size}
                  Z
                `}
                fill="url(#waterGradient)"
                opacity={0.6}
              />
            </G>

            {/* Animated Progress arc */}
            <Path
              d={progressPath}
              stroke="#4A90A4"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.dropIcon}>
              <WaterDrop />
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.currentAmount}>{Math.round(convertFromMl(currentAmount, unitSystem))}</Text>
              <Text style={styles.unit}>{getUnitSuffix(unitSystem)}</Text>
            </View>

            <Text style={styles.goalText}>of {Math.round(convertFromMl(goalAmount, unitSystem))}{getUnitSuffix(unitSystem)} goal</Text>

            {/* Percentage inside circle */}
            <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Dimensions.get('window').height < 700 ? 10 : 20,
  },
  cardContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    width: Dimensions.get('window').height < 700 ? 220 : 300,
    height: Dimensions.get('window').height < 700 ? 220 : 300,
    position: 'relative',
    marginBottom: Dimensions.get('window').height < 700 ? 12 : 24,
  },
  svg: {
    position: 'absolute',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropIcon: {
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currentAmount: {
    fontSize: Dimensions.get('window').height < 700 ? 36 : 48,
    fontWeight: '700',
    color: '#2E5266',
    includeFontPadding: false,
  },
  unit: {
    fontSize: Dimensions.get('window').height < 700 ? 18 : 24,
    fontWeight: '500',
    color: '#2E5266',
    marginLeft: 3,
    includeFontPadding: false,
  },
  goalText: {
    fontSize: Dimensions.get('window').height < 700 ? 13 : 16,
    color: '#4A90A4',
    includeFontPadding: false,
    marginBottom: Dimensions.get('window').height < 700 ? 4 : 8,
  },
  percentageText: {
    fontSize: Dimensions.get('window').height < 700 ? 28 : 36,
    fontWeight: '700',
    color: '#4A90A4',
    includeFontPadding: false,
  },
});

export default WaterGoalAnimation;