import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {useToast} from 'react-native-toast-notifications';
import CustomInput from '../../../../components/CustomInput';
import SubmitButton from '../../../../components/SubmitButton';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import axiosInstance from '../../../../services/api';
import {checkConnection} from '../../../../helpers/checkConnection';

const SendRecoverPassword = () => {
  const {control, handleSubmit, setError} = useForm();
  const [email, setEmail] = useState('');
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();

  const handleNavigation = (screen, values) => {
    navigation.navigate(screen, values);
  };

  const onRecoverPasswordPressed = async data => {
    await checkConnection(toast);

    try {
      const response = await axiosInstance.post('/user/send-recover-password', {
        email: data.email,
      });
      setEmail(data.email);

      console.log(response.data);
      toast.show(response.data.message, {
        type: 'success',
        placement: 'top',
      });
      handleNavigation('VerifyRecoverPassword', {
        email: data.email,
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setError('email', {
          type: 'manual',
          message: "We couldn't find an account with that email.",
        });
      }
      console.log(error.response);
    }
  };

  return (
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
        <View style={styles.imageFooter}>
          <Image
            source={require('../../../../assets/Resetpassword-bro.png')}
            style={{height: 400, width: 400}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SendRecoverPassword;

const styles = StyleSheet.create({
  body: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  imageFooter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  inputContainer: {marginVertical: 20},
  headerNavigation: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
