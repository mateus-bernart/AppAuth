import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {useToast} from 'react-native-toast-notifications';
import dayjs from 'dayjs';
import CustomInput from '../../../../components/CustomInput';
import SubmitButton from '../../../../components/SubmitButton';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import axiosInstance from '../../../../services/api';
import {checkConnection} from '../../../../helpers/checkConnection';

const VerifyRecoverPassword = ({route}) => {
  const {control, handleSubmit} = useForm();
  const navigation = useNavigation<AppNavigationProp>();
  const {email} = route?.params || {};
  const [timeLeft, setTimeLeft] = useState('');

  const toast = useToast();

  let interval;

  const startOtpCountdown = async () => {
    await checkConnection(toast);

    try {
      const response = await axiosInstance.post('/user/check-otp-timeout', {
        email: email,
      });

      const expiresAt = dayjs(response.data.expires_at);

      interval = setInterval(() => {
        const now = dayjs();
        const diff = expiresAt.diff(now, 'second');

        if (diff < 0) {
          clearInterval(interval);
          setTimeLeft('Expired');
        } else {
          const minutes = Math.floor(diff / 60);
          const seconds = diff % 60;
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    } catch (error) {
      setTimeLeft('Could not fetch expiration');
      console.log(error.response);
    }
  };

  useEffect(() => {
    async () => {
      await checkConnection(toast);
    };

    startOtpCountdown();
    return () => clearInterval(interval);
  }, [email]);

  const sendCodeAgain = async () => {
    await checkConnection(toast);

    const response = await axiosInstance.post('/user/send-recover-password', {
      email: email,
    });
    toast.show(response.data.message, {
      type: 'success',
      placement: 'top',
    });
    startOtpCountdown();
  };

  const onVerifyRecoverPasswordPressed = async data => {
    await checkConnection(toast);

    try {
      const response = await axiosInstance.post(
        '/user/confirm-recover-password',
        {
          email: email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          code: data.code,
        },
      );
      toast.show(response.data.message, {
        type: 'success',
        placement: 'top',
      });
      navigation.navigate('Login');
    } catch (error) {
      console.log(error.response);
      toast.show(error.response.data.message, {
        type: 'danger',
        placement: 'top',
      });
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={styles.headerNavigation}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <IconFontAwesome name="chevron-left" size={30} />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password Confirmation</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.formText}>Verification Code</Text>
            <CustomInput
              rules={{required: 'Verification code is required'}}
              control={control}
              name="code"
              placeholder="1234"
              keyboardType="number-pad"
              iconLeft="lock"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.formText}>New Password</Text>
            <CustomInput
              rules={{required: 'New Password is required'}}
              control={control}
              name="password"
              placeholder="Enter new password"
              secureTextEntry
              iconRight
              iconLeft="lock"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.formText}>Confirm Password</Text>
            <CustomInput
              rules={{required: 'Confirm password is required'}}
              control={control}
              name="password_confirmation"
              placeholder="Enter password confirmation"
              secureTextEntry
              iconRight
              iconLeft="lock"
            />
          </View>
          <View style={styles.timeoutContainer}>
            <Text style={styles.timeOutText}>Time to timeout code:</Text>
            <Text
              style={[
                styles.timeOutText,
                styles.timeOutTextHighlighted,
                {
                  backgroundColor:
                    timeLeft === 'Expired' ? '#f0000075' : '#0c91007f',
                },
                {
                  color: timeLeft === 'Expired' ? '#fff' : '#000',
                },
              ]}>
              {timeLeft}
            </Text>
          </View>
          <SubmitButton
            onButtonPressed={handleSubmit(onVerifyRecoverPasswordPressed)}
            text="Confirm new password"
          />
          {timeLeft === 'Expired' ? (
            <TouchableOpacity
              onPress={() => {
                sendCodeAgain();
              }}>
              <View style={{marginTop: 20}}>
                {timeLeft && (
                  <Text style={styles.descriptionText}>
                    Need to resend the code?{' '}
                    <Text
                      style={[styles.descriptionText, styles.highLightedText]}>
                      Send again
                    </Text>
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            ''
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyRecoverPassword;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  highLightedText: {
    color: 'blue',
    fontFamily: 'Poppins-Bold',
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    alignSelf: 'center',
  },
  timeOutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    alignSelf: 'center',
  },
  timeOutTextHighlighted: {
    fontSize: 30,
    padding: 10,
    borderRadius: 8,
  },
  timeoutContainer: {
    marginVertical: 20,
  },
  formText: {
    fontSize: 16,
    alignItems: 'center',
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  header: {
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {marginTop: 20},
  headerNavigation: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
