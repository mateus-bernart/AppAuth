import {Animated, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useStock} from '../../providers/StockProvider';
const Badge = ({count}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          bounciness: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count]);

  const animatedStyle = {
    transform: [{scale: scaleValue}],
  };
  return (
    <Animated.View style={[styles.badgeContainer, animatedStyle]}>
      <Text style={styles.badgeText}>{count}</Text>
    </Animated.View>
  );
};

export default Badge;

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: 'orange',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
    right: 15,
    height: 25,
    width: 25,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Poppins-Bold',
  },
});
