import {
  Image,
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
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../types/navigationTypes';
import {useAuth} from '../../providers/AuthProvider';
import axiosInstance from '../../services/api';

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
    const response: any = await axiosInstance
      .post('/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        startSession(
          {
            userId: response.data.user.id,
            userName: response.data.user.name,
            isLogged: true,
          },
          response.data.token,
        );
        toast.show('Logged In', {type: 'success', placement: 'top'});
      })
      .catch(error =>
        toast.show('Invalid Credentials', {type: 'danger', placement: 'top'}),
      );
  };

  return (
    <View style={{flex: 1}}>
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
            secureTextEntry
            iconRight
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
        <View style={styles.imageFooter}>
          <Image
            source={require('../../assets/Login-bro.png')}
            style={{height: 300, width: 400}}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 50,
  },
  formTitle: {
    marginTop: 20,
    fontSize: 20,
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  imageFooter: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  createAccountText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: 'gray',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 150,
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
    fontSize: 35,
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
