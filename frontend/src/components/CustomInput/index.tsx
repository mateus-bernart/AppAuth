import {
  Animated,
  Easing,
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Ref, useEffect, useRef, useState} from 'react';
import {Controller} from 'react-hook-form';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {format} from 'react-number-format/types/numeric_format';

interface CustomInputProps {
  control: any;
  name: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rules?: object;
  keyboardType?: KeyboardTypeOptions;
  iconLeft?: string;
  iconRight?: boolean;
  editable?: boolean;
  ref?: Ref<TextInput> | undefined;
  textStyle?: boolean;
  formStyle?: boolean;
  maxLength?: number;
  defaultValue?: any;
}

const CustomInput: React.FC<CustomInputProps> = ({
  control,
  name,
  rules = {},
  placeholder,
  secureTextEntry = false,
  keyboardType,
  iconLeft,
  iconRight,
  editable = true,
  textStyle,
  formStyle = true,
  maxLength,
  defaultValue, // ou algum valor adequado como 0, null, etc.
}) => {
  const [eyeToggle, setEyeToggle] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleShowPassword = () => {
    setEyeToggle(prev => !prev);
  };

  const animatedValue = useRef(new Animated.Value(0)).current;
  const borderWidthAnim = useRef(new Animated.Value(0)).current;

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', 'green'],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e4e4e4', '#eeffee'],
  });

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue ?? ''}
      render={({field: {value, onChange, onBlur}, fieldState: {error}}) => {
        useEffect(() => {
          let toValue = 0;
          if (error) {
            toValue = 2;
          } else if (isFocused) {
            toValue = 2;
          }
          Animated.timing(animatedValue, {
            toValue: isFocused ? 1 : 0,
            duration: 100,
            useNativeDriver: false,
          }).start();
          Animated.timing(borderWidthAnim, {
            toValue: toValue,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }, [isFocused, error]);
        return (
          <>
            <Animated.View
              style={[
                textStyle ? null : styles.inputFieldContainer,
                {
                  borderColor: error ? 'red' : borderColor,
                  backgroundColor: backgroundColor,
                  borderWidth: borderWidthAnim,
                },
              ]}>
              {iconLeft && (
                <IconFontAwesome
                  name={iconLeft}
                  size={20}
                  style={[styles.iconLeft, {color: error ? 'red' : 'black'}]}
                />
              )}
              <TextInput
                style={[
                  formStyle ? styles.formInput : styles.textInputStyle,
                  {color: !editable ? '#696969' : 'black'},
                ]}
                value={String(value)} // Controlled by react-hook-form
                onChangeText={text => {
                  let formatted = text;

                  if (name === 'price') {
                    formatted = text.replace(',', '.').replace(/[^0-9.]/g, '');
                  } else if (keyboardType === 'number-pad') {
                    formatted = text.replace(/[^0-9]/g, '');
                  }

                  const parsedValue =
                    keyboardType === 'number-pad'
                      ? Number(formatted)
                      : formatted;

                  onChange(parsedValue);
                }}
                placeholder={placeholder}
                secureTextEntry={!eyeToggle && secureTextEntry}
                keyboardType={keyboardType}
                editable={editable}
                maxLength={maxLength}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {iconRight && (
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={handleShowPassword}>
                  <IconFontAwesome
                    name={eyeToggle ? 'eye' : 'eye-slash'}
                    size={20}
                  />
                </TouchableOpacity>
              )}
            </Animated.View>

            {error && (
              <Text
                style={{
                  color: 'red',
                  alignSelf: 'stretch',
                  marginVertical: 5,
                  fontWeight: 'bold',
                }}>
                {error.message || 'Error'}
              </Text>
            )}
          </>
        );
      }}
    />
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  formInput: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  textInputStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  inputFieldContainer: {
    width: '100%',
    padding: 5,
    backgroundColor: '#dfdfdf',
    borderRadius: 8,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconLeft: {
    marginLeft: 10,
    color: 'gray',
  },
});
