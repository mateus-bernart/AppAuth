import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import CustomInput from '../../component/CustomInput';
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../types/navigationTypes';
import {useAuth} from '../../providers/AuthProvider';
import axiosInstance from '../../services/api';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import SubmitButton from '../../component/SubmitButton';

const Login = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const [emailToVerify, setEmailToVerify] = useState('');
  const [emailIsVerified, setEmailIsVerified] = useState(false);

  const handleNavigation = (screen, values) => {
    navigation.navigate(screen, values);
  };

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const {startSession} = useAuth();

  const sendOtp = async email => {
    try {
      const response = await axiosInstance.post('/email/send-otp', {
        email,
      });
      console.log(response.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const onLoginPressed = async data => {
    try {
      const response = await axiosInstance.post('/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      startSession(
        {
          userId: response.data.user.id,
          userName: response.data.user.name,
          isLogged: true,
        },
        response.data.token,
      );

      toast.show('Logged In', {type: 'success', placement: 'top'});
    } catch (error) {
      if (error.response) {
        console.log('Error response data: ', error.response.data);
        console.log('Status: ', error.response.status);

        if (error.response.status === 403) {
          toast.show(error.response.data.message || 'Email not verified.', {
            type: 'danger',
            placement: 'top',
          });
          setEmailIsVerified(false);
          setEmailToVerify(error.response.data.email);
        } else if (error.response.status === 401) {
          toast.show(error.response.data.message || 'Incorrect Credentials.', {
            type: 'danger',
            placement: 'top',
          });
        } else {
          toast.show(error.response.data.message || 'Login Failed.', {
            type: 'danger',
            placement: 'top',
          });
        }
      } else {
        console.log('Login Error: ', error.message);
        toast.show('Something went wrong', {
          type: 'danger',
          placement: 'top',
        });
      }
    }
  };

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.formContainerField}>
            <Text style={styles.formTitle}>Email</Text>
            <TouchableOpacity
              onPress={() => {
                handleNavigation('VerifyEmail', {
                  userEmail: emailToVerify,
                });
                sendOtp(emailToVerify);
              }}>
              {emailToVerify && (
                <View style={{flexDirection: 'row', gap: 10}}>
                  <Text style={styles.verifyEmailText}>Go to verify email</Text>
                  <IconFontAwesome
                    name="chevron-right"
                    size={20}
                    color="green"
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
          <CustomInput
            rules={{required: 'Please insert your email'}}
            control={control}
            name="email"
            placeholder="Type your email"
            secureTextEntry={false}
            keyboardType="email-address"
          />
          <View style={styles.formContainerField}>
            <Text style={styles.formTitle}>Password</Text>
          </View>
          <CustomInput
            rules={{required: 'Please insert your password'}}
            control={control}
            name="password"
            placeholder="Type your password"
            secureTextEntry
            iconRight
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('SendRecoverPassword')}>
            <View style={styles.formFooter}>
              <Text style={styles.footerText}>
                Forgot your password?{' '}
                <Text style={styles.footerTextHighlighted}>Click here</Text>
              </Text>
            </View>
          </TouchableOpacity>

          <SubmitButton
            text="Sign in"
            onButtonPressed={handleSubmit(onLoginPressed)}
          />

          <View style={styles.formFooter}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.footerTextHighlighted}>Register</Text>
              </Text>
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
  verifyEmailText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: 'green',
  },
  formContainerField: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formTitle: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  imageFooter: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  footerText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: 'gray',
  },
  footerTextHighlighted: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'blue',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 150,
  },
  formFooter: {
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
  buttonText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
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
  shadowContainer: {
    backgroundColor: '#084700',
    position: 'absolute',
    left: -5,
    top: 25,
    width: '100%',
    borderRadius: 8,
    padding: 31,
  },
});
