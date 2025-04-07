import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomInput from '../../../component/CustomInput';
import SubmitButton from '../../../component/SubmitButton';
import {useForm} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../../types/navigationTypes';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import axiosInstance from '../../../services/api';

const VerifyRecoverPassword = ({route}) => {
  const {control, handleSubmit} = useForm();
  const navigation = useNavigation<AppNavigationProp>();
  const {userEmail} = route?.params || {};

  setTimeout(() => {
    console.log(userEmail);
  }, 400);

  // const handleNavigation = (screen, values) => {
  //   navigation.navigate(screen, values);
  // };

  const onVerifyRecoverPasswordPressed = data => {
    try {
      const response = axiosInstance.post('/user/confirm-recover-password', {
        email: userEmail,
        password: data.password,
      });
      console.log(response);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
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
            <Text style={styles.formText}>Email</Text>
            <CustomInput
              rules={{required: 'Email is required'}}
              control={control}
              name="confirm_password"
              placeholder="Confirm new password"
              secureTextEntry
              iconRight
              iconLeft="lock"
            />
          </View>
          <SubmitButton
            onButtonPressed={handleSubmit(onVerifyRecoverPasswordPressed)}
            text="Reset Password"
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default VerifyRecoverPassword;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    alignSelf: 'center',
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
