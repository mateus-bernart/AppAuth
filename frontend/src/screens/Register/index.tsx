import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import CustomInput from '../../component/CustomInput';
import axios from 'axios';
import {useForm} from 'react-hook-form';

const Login = () => {
  const navigation = useNavigation<any>();

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
  } = useForm();
  const passwordVerification = watch('password');

  const onRegisterPressed = data => {
    console.log(data);

    axiosInstance.get('/posts').then(response => {
      console.log(response.data);
    });

    //TODO: create an success page
    navigation.navigate('Login');
  };

  const axiosInstance = axios.create({
    baseURL: 'http://172.16.1.131:8000/api',
  });

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.title}>Register</Text>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Name</Text>
        <CustomInput
          rules={{required: 'Name is required'}}
          control={control}
          name="name"
          placeholder="Type your name"
          secureTextEntry={false}
        />
        <Text style={styles.formTitle}>Email</Text>
        <CustomInput
          rules={{required: 'Email is required'}}
          control={control}
          name="email"
          placeholder="Type your Email"
          secureTextEntry={false}
          keyboardType="email-address"
        />
        <Text style={styles.formTitle}>Password</Text>
        <CustomInput
          rules={{
            required: 'Password is required',
            minLength: {
              value: 3,
              message: 'Password should be minimum 3 characters',
            },
          }}
          control={control}
          name="password"
          placeholder="Type your Password"
          secureTextEntry={true}
        />
        <Text style={styles.formTitle}>Confirm Password</Text>
        <CustomInput
          rules={{
            required: 'Confirm your password',
            validate: value =>
              value === passwordVerification || 'Password must match',
            minLength: {
              value: 3,
              message: 'Password should be minimum 3 characters',
            },
          }}
          control={control}
          name="confirmPassword"
          placeholder="Type your password again"
          secureTextEntry={true}
        />
        <View style={styles.formFooter}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.createAccountText}>
              Have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onRegisterPressed)}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 50,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 20,
    marginTop: 10,
    alignItems: 'center',
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  createAccountText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: 'gray',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  header: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
  button: {
    backgroundColor: 'green',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  buttonContainer: {
    marginTop: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
