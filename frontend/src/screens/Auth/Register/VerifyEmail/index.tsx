import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {OtpInput} from 'react-native-otp-entry';
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import axiosInstance from '../../../../services/api';
import dayjs from 'dayjs';
import SubmitButton from '../../../../components/SubmitButton';

const VerifyEmail = ({route}) => {
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const [otpTrigger, setOtpTrigger] = useState(0);

  const [timeLeft, setTimeLeft] = useState('');

  const [otp, setOtp] = useState('');
  const {userEmail} = route?.params || {};

  const handleNavigation = (screen, value) => {
    navigation.navigate(screen, value);
  };

  useEffect(() => {
    let interval;

    const fetchExpiration = async () => {
      try {
        const response = await axiosInstance.post('/user/check-otp-timeout', {
          email: userEmail,
        });

        const expiresAt = dayjs(response.data.expires_at);

        clearInterval(interval);

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

    if (userEmail) fetchExpiration();
    return () => clearInterval(interval);
  }, [otpTrigger]);

  const reSendOtp = async email => {
    try {
      const response = await axiosInstance.post('/email/send-otp', {
        email,
      });
      setOtpTrigger(prev => prev + 1);
      console.log(response.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const verifyOtp = async () => {
    try {
      await axiosInstance
        .post('/email/verify-otp', {
          otp,
          email: userEmail,
        })
        .then(response => {
          console.log(response);
          toast.show('Email verified.', {
            type: 'success',
            placement: 'top',
          });
        });

      navigation.navigate('Login');
    } catch (error) {
      toast.show(error.response.data.message, {
        type: 'danger',
        placement: 'top',
      });
      console.log(error.response.data);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => {
          navigation.goBack();
        }}>
        <IconFontAwesome name="chevron-left" size={30} />
        <Text style={styles.headerTextContainer}>Verify email</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <Image
          source={require('../../../../assets/Newmessage-bro.png')}
          style={{height: 200, width: 300}}
        />
        <View style={styles.messageEmailContainer}>
          <Text style={styles.descriptionText}>
            An email with a verification code has been
          </Text>
          <Text style={styles.descriptionText}>sent to your email</Text>
        </View>
        <OtpInput
          autoFocus={false}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.pinCodeContainerStyle,
            pinCodeTextStyle: styles.pinCodeTextStyle,
            focusedPinCodeContainerStyle: styles.focusedPinCodeContainerStyle,
            filledPinCodeContainerStyle: styles.filledPinCodeContainerStyle,
          }}
          numberOfDigits={4}
          onTextChange={text => setOtp(text)}
        />
        <TouchableOpacity
          onPress={() => {
            reSendOtp(userEmail);
            toast.show('Email send again', {
              type: 'success',
              placement: 'top',
            });
          }}>
          <View style={styles.messageEmailContainer}>
            <Text style={styles.descriptionText}>
              Didn't receive a code?{' '}
              <Text style={[styles.descriptionText, styles.highLightedText]}>
                Request again
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
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
      </View>
      <View style={{marginHorizontal: 30, marginTop: 20}}>
        <SubmitButton text={'Verify'} onButtonPressed={() => verifyOtp()} />
      </View>
      <TouchableOpacity>
        <View style={styles.messageEmailContainer}>
          <Text style={styles.descriptionText}>
            Already a member?{' '}
            <Text style={[styles.descriptionText, styles.highLightedText]}>
              Sign in instead
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  otpContainer: {
    marginTop: 30,
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
  filledPinCodeContainerStyle: {
    borderColor: 'green',
  },
  focusedPinCodeContainerStyle: {
    borderColor: '#058a0088',
  },
  pinCodeContainerStyle: {
    borderWidth: 3,
    height: 80,
    width: 80,
  },
  pinCodeTextStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 30,
  },
  body: {
    alignItems: 'center',
    marginHorizontal: 35,
  },
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    alignItems: 'center',
    gap: 20,
    flexDirection: 'row',
  },
  headerTextContainer: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
  },
  messageEmailContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  highLightedText: {
    color: 'blue',
    fontFamily: 'Poppins-Bold',
  },
  timeoutContainer: {
    marginVertical: 30,
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
});
