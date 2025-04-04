import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Ref, useState} from 'react';
import {Controller} from 'react-hook-form';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';

interface CustomInputProps {
  control: any;
  name: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rules?: object;
  keyboardType?: KeyboardTypeOptions;
  iconLeft?: string;
  iconRight?: boolean;
  defaultValue?: string;
  editable?: boolean;
  ref?: Ref<TextInput> | undefined;
  textStyle?: boolean;
  formStyle?: boolean;
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
  defaultValue,
  editable = true,
  ref,
  textStyle,
  formStyle = true,
}) => {
  const [eyeToggle, setEyeToggle] = useState(false);

  const handleShowPassword = () => {
    if (eyeToggle) {
      setEyeToggle(false);
    } else {
      setEyeToggle(true);
    }
  };

  if (textStyle) {
    formStyle = false;
  }

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {value, onChange, onBlur}, fieldState: {error}}) => (
        <>
          <View
            style={[
              textStyle ? null : styles.inputFieldContainer,
              {borderColor: error ? 'red' : 'black'},
              {borderWidth: error ? 1 : 0},
            ]}>
            {iconLeft && (
              <IconFontAwesome
                name={iconLeft}
                size={20}
                style={styles.iconLeft}
              />
            )}
            <TextInput
              style={[formStyle ? styles.formInput : styles.textInputStyle]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              secureTextEntry={!eyeToggle && secureTextEntry}
              keyboardType={keyboardType}
              defaultValue={defaultValue}
              editable={editable}
              ref={ref}
            />
            {iconRight && (
              <TouchableOpacity
                style={{padding: 10}}
                onPress={() => handleShowPassword()}>
                {eyeToggle && <IconFontAwesome name="eye" size={20} />}
                {!eyeToggle && <IconFontAwesome name="eye-slash" size={20} />}
              </TouchableOpacity>
            )}
          </View>
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
      )}
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
