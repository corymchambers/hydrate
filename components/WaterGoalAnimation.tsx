import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import WaterDrop from './WaterDrop';

const WaterGoalAnimation = ({ currentML = 750, goalML = 2000 }) => {
  const percentage = Math.min((currentML / goalML) * 100, 100);
  const progressAngle = (percentage / 100) * 360;

  // Circle dimensions
  const size = 300;
  const strokeWidth = 12;
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
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  const progressPath = createArcPath(center, center, radius, 0, progressAngle);

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

            {/* Progress arc */}
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
              <Text style={styles.currentAmount}>{currentML}</Text>
              <Text style={styles.unit}>ml</Text>
            </View>

            <Text style={styles.goalText}>of {goalML}ml goal</Text>

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
    padding: 20,
  },
  cardContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    width: 300,
    height: 300,
    position: 'relative',
    marginBottom: 24,
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
    fontSize: 48,
    fontWeight: '700',
    color: '#2E5266',
    includeFontPadding: false,
  },
  unit: {
    fontSize: 24,
    fontWeight: '500',
    color: '#2E5266',
    marginLeft: 3,
    includeFontPadding: false,
  },
  goalText: {
    fontSize: 16,
    color: '#4A90A4',
    includeFontPadding: false,
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4A90A4',
    includeFontPadding: false,
  },
});

export default WaterGoalAnimation;