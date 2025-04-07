import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useRef} from 'react';
import {useForm} from 'react-hook-form';

const SubmitButton = ({text, onButtonPressed}) => {
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
    <View style={{position: 'relative', marginTop: 20}}>
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
          <Text style={styles.buttonText}>{text}</Text>
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
    top: 25,
    width: '100%',
    borderRadius: 8,
    padding: 31,
  },
  buttonContainer: {
    marginTop: 20,
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
