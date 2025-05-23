import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useRef} from 'react';

type SubmitButtonProps = {
  text: string;
  onButtonPressed: any;
  textSize?: number;
  height?: number;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  text,
  onButtonPressed,
  textSize,
  height,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={{position: 'relative'}}>
      <View style={styles.shadowContainer} />
      <Pressable
        onPress={onButtonPressed}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.buttonContainer,
            {transform: [{translateX}, {translateY}]},
          ]}>
          <Text
            style={[
              styles.buttonText,
              {fontSize: textSize || 15, height: height || 'auto'},
            ]}>
            {text}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default SubmitButton;

const styles = StyleSheet.create({
  shadowContainer: {
    backgroundColor: '#084700',
    position: 'absolute',
    left: -5,
    top: 5,
    width: '100%',
    borderRadius: 8,
    padding: 31,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    borderRadius: 8,
    padding: 18,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
});
