import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React from 'react';
import {Controller} from 'react-hook-form';

interface CustomInputProps {
  control: any;
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  rules?: object;
  keyboardType?: KeyboardTypeOptions;
}

const CustomInput: React.FC<CustomInputProps> = ({
  control,
  name,
  rules = {},
  placeholder,
  secureTextEntry = false,
  keyboardType,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {value, onChange, onBlur}, fieldState: {error}}) => (
        <>
          <View>
            <TextInput
              style={[styles.formInput, {borderColor: error ? 'red' : 'black'}]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
            />
          </View>
          {error && (
            <Text
              style={{color: 'red', alignSelf: 'stretch', marginVertical: 5}}>
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
    padding: 15,
    backgroundColor: 'lightgray',
    width: '100%',
    borderRadius: 8,
    borderWidth: 2.0,
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
});
