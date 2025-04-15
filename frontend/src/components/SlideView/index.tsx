import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

const SlideInView = ({
  children,
  style,
  direction = 'right',
  distance = 30,
  duration = 300,
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const getTranslateStyle = () => {
    switch (direction) {
      case 'left':
        return {
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, distance],
                outputRange: [0, -distance],
              }),
            },
          ],
        };
      case 'right':
        return {transform: [{translateX: slideAnim}]};
      case 'up':
        return {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, distance],
                outputRange: [0, -distance],
              }),
            },
          ],
        };
      case 'down':
        return {transform: [{translateY: slideAnim}]};
      default:
        return {};
    }
  };

  return (
    <Animated.View style={[style, getTranslateStyle()]}>
      {children}
    </Animated.View>
  );
};

export default SlideInView;
