import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm} from 'react-hook-form';
import CustomInput from '../../../component/CustomInput';
import SubmitButton from '../../../component/SubmitButton';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../../types/navigationTypes';
import axiosInstance from '../../../services/api';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

const SendRecoverPassword = () => {
  const {control, handleSubmit} = useForm();
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation<AppNavigationProp>();

  const handleNavigation = (screen, values) => {
    navigation.navigate(screen, values);
  };

  const onRecoverPasswordPressed = async data => {
    try {
      const response = await axiosInstance.post('/user/send-recover-password', {
        email: data.email,
      });
      console.log(response.data);
      setUserEmail(response.data.email);
    } catch (error) {
      console.log(error.response);
    }

    handleNavigation('VerifyRecoverPassword', {userEmail: userEmail});
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
            <Text style={styles.title}>Recover Password</Text>
          </View>
          <Text style={styles.descriptionText}>
            Enter your email address below to reset your password.
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.formText}>Email</Text>
            <CustomInput
              rules={{required: 'Email is required'}}
              control={control}
              name="email"
              placeholder="you@example.com"
              keyboardType="email-address"
              iconLeft="envelope"
            />
          </View>
          <SubmitButton
            onButtonPressed={handleSubmit(onRecoverPasswordPressed)}
            text="Submit"
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SendRecoverPassword;

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
