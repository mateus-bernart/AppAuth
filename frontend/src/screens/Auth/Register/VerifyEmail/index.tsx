import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {OtpInput} from 'react-native-otp-entry';
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import axiosInstance from '../../../../services/api';

const VerifyEmail = ({route}) => {
  const navigation = useNavigation<AppNavigationProp>();
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const toast = useToast();

  const [otp, setOtp] = useState('');
  const {userEmail} = route?.params || {};

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
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
          style={{height: 300, width: 400}}
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
        <TouchableOpacity>
          <View style={styles.messageEmailContainer}>
            <Text style={styles.descriptionText}>
              Didn't receive a code?{' '}
              <Text style={[styles.descriptionText, styles.highLightedText]}>
                Request again
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{position: 'relative', margin: 30}}>
        <View style={styles.shadowContainer} />
        <Pressable
          onPress={() => {
            verifyOtp();
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <Animated.View
            style={[
              styles.buttonContainer,
              {transform: [{translateX}, {translateY}]},
            ]}>
            <Text style={styles.buttonText}>Verify Email</Text>
          </Animated.View>
        </Pressable>
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
});
