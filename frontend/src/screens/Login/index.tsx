import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import CustomInput from '../../component/CustomInput';
import Axios from 'axios';
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../types/navigationTypes';
import {useAuth} from '../../providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storageGet, storageSet} from '../../services/storage';

const axios = Axios.create({
  baseURL: 'http://172.16.1.131:8000/api',
  //interceptor -> token storage para enviar para api
});

const Login = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: {errors},
    setError,
  } = useForm();

  const {startSession} = useAuth();

  const onLoginPressed = async data => {
    try {
      const response = await axios.post('/login', data);

      if (response.data.status == true) {
        startSession(
          {
            userId: response.data.user.id,
            userName: response.data.user.name,
            isLogged: true,
          },
          response.data.token,
        );
      } else {
        toast.show('Invalid credentials', {
          type: 'danger',
          placement: 'top',
        });
      }
    } catch (error) {
      toast.show('Login failed', {
        type: 'danger',
        placement: 'top',
      });
    }
  };

  return (
    <>
      <SafeAreaView style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>E-mail</Text>
          <CustomInput
            rules={{required: 'Please insert your email'}}
            control={control}
            name="email"
            placeholder="Type your email"
            secureTextEntry={false}
            keyboardType="email-address"
          />
          <Text style={styles.formTitle}>Password</Text>
          <CustomInput
            rules={{required: 'Please insert your password'}}
            control={control}
            name="password"
            placeholder="Type your password"
            secureTextEntry={true}
          />
          <View style={styles.formFooter}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.createAccountText}>
                Don't have an account? Register
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onLoginPressed)}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
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
    marginTop: 20,
    fontSize: 20,
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
  formInput: {
    padding: 15,
    backgroundColor: 'lightgray',
    width: '100%',
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 2.0,
    marginBottom: 20,
    fontFamily: 'Poppins-Medium',
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
