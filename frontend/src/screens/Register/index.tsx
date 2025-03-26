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
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {AppNavigationProp} from '../../types/navigationTypes';
import {useAuth} from '../../providers/AuthProvider';

const axios = Axios.create({
  baseURL: 'http://172.16.1.131:8000/api',
});

const Register = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();

  const {isAuthenticated} = useAuth();

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
    setError,
  } = useForm();
  const passwordVerification = watch('password');

  const onRegisterPressed = async data => {
    await axios
      .post('/register', data)
      .then(response => {
        console.log(response);

        if (response.data.status === 'created') {
          toast.show('User created', {
            type: 'success',
            placement: 'top',
          });

          navigation.navigate('Login');
        } else {
          toast.show('Fail to register user', {
            type: 'danger',
            placement: 'top',
          });
        }
      })
      .catch(e => {
        Object.keys(e.response.data.errors).map(key => {
          //Tipagem form -> key (bd)
          setError(key, {message: e.response.data.errors[key][0]});
        });
      });
  };

  return (
    <SafeAreaView style={styles.body}>
      {isAuthenticated && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconFontAwesome
            name="chevron-left"
            size={30}
            style={styles.iconBack}
          />
        </TouchableOpacity>
      )}
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
          name="password_confirmation"
          placeholder="Type your password again"
          secureTextEntry={true}
        />
        {!isAuthenticated && (
          <View style={styles.formFooter}>
            <TouchableOpacity
              onPress={() => {
                if (isAuthenticated) {
                  navigation.navigate('Home');
                }
                navigation.navigate('Login');
              }}>
              <Text style={styles.createAccountText}>
                Have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        )}
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

export default Register;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 50,
    justifyContent: 'center',
  },
  iconBack: {
    position: 'absolute',
    top: 70,
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
    top: 60,
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
