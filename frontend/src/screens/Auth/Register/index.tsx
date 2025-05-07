import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {useToast} from 'react-native-toast-notifications';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomInput from '../../../components/CustomInput';
import {AppNavigationProp} from '../../../types/navigationTypes';
import {useAuth} from '../../../providers/AuthProvider';
import axiosInstance from '../../../services/api';
import Header from '../../../components/Header';
import SubmitButton from '../../../components/SubmitButton';
import SearchSelectPicker from '../../../components/SearchSelectPicker';
import SelectPicker from '../../../components/SelectPicker';
import {isOnline} from '../../../helpers/networkHelper';

const Register = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const {isAuthenticated} = useAuth();
  const [iconDirection, setIconDirection] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState(false);

  const onDropdownClick = () => {
    if (iconDirection) {
      setIconDirection(false);
    } else {
      setIconDirection(true);
    }
  };

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
    watch,
    setError,
  } = useForm();

  const handleNavigation = (screen, value) => {
    navigation.navigate(screen, value);
  };

  const passwordVerification = watch('password');

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

  const onRegisterPressed = async data => {
    console.log(data);

    await axiosInstance
      .post('/register', data)
      .then(response => {
        if (response.data.status === 'created') {
          toast.show('User created', {
            type: 'success',
            placement: 'top',
          });
          if (!isAuthenticated) {
            sendOtp(data.email);
            toast.show('Please verify your email', {
              type: 'info',
              placement: 'top',
            });
            setEmailToVerify(data.email);
          } else {
            navigation.navigate('UserManagement');
          }
        } else {
          toast.show('Fail to register user, please check Wi-fi connection.', {
            type: 'danger',
            placement: 'top',
          });
        }
      })
      .catch(e => {
        if (e.response && e.response.data && e.response.data.errors) {
          Object.keys(e.response.data.errors).map(key => {
            setError(key, {message: e.response.data.errors[key][0]});
          });
        } else {
          console.log('Unexpected error structure:', e.response);
        }
      });
  };

  return (
    <>
      <SafeAreaView style={{flex: 1, marginBottom: 15}}>
        <Header title="REGISTER" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {!isAuthenticated && (
              <View style={styles.formFooter}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Login');
                  }}>
                  <Text style={styles.createAccountText}>
                    Already have an account?{' '}
                    <Text style={styles.signInText}>Sign in</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/*  ========== FORM  ============ */}

            <View style={styles.formContainer}>
              <View style={styles.credentialsContainer}>
                <View style={styles.containerInfo}>
                  <Text style={styles.formTitle}>Name</Text>
                  <CustomInput
                    rules={{required: 'Name is required'}}
                    control={control}
                    name="name"
                    placeholder="Enter your name"
                    iconLeft="user"
                  />
                </View>
                <View style={styles.containerInfo}>
                  <View style={styles.emailHeaderContainer}>
                    <Text style={styles.formTitle}>Email</Text>
                    <TouchableOpacity
                      onPress={() => {
                        handleNavigation('VerifyEmail', {
                          userEmail: emailToVerify,
                        });
                      }}>
                      {emailToVerify && (
                        <View style={{flexDirection: 'row', gap: 10}}>
                          <Text style={styles.verifyEmailText}>
                            Go to verify email
                          </Text>
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
                    rules={{required: 'Email is required'}}
                    control={control}
                    name="email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    iconLeft="envelope"
                  />
                </View>
                <View style={styles.containerInfo}>
                  <Text style={styles.formTitle}>Phone number</Text>
                  <CustomInput
                    maxLength={11}
                    rules={{
                      minLength: {
                        value: 11,
                        message: 'Phone number should be 11 characters',
                      },
                      maxLength: {
                        value: 11,
                        message: 'Phone number should be 11 characters',
                      },
                    }}
                    control={control}
                    name="phone_number"
                    placeholder="(+33)3333-3333"
                    keyboardType="number-pad"
                    iconLeft="phone-alt"
                  />
                </View>
                <View style={styles.containerInfo}>
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
                    placeholder="Enter password"
                    secureTextEntry={true}
                    iconRight
                    iconLeft="lock"
                  />
                </View>
                <View style={styles.containerInfo}>
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
                    placeholder="Repeat password"
                    secureTextEntry={true}
                    iconRight
                    iconLeft="lock"
                  />
                </View>
              </View>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>Branch</Text>
                <SearchSelectPicker
                  control={control}
                  name="user_branch"
                  endpoint={'/branches'}
                  labelField={'code'}
                  valueField={'description'}
                  rules={{required: 'Branch is required'}}
                  placeholder="Select a Branch"
                />
              </View>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>User type</Text>
                <SelectPicker
                  control={control}
                  name="user_type"
                  rules={{required: 'User type is required'}}
                  placeholder="Select a user type"
                />
              </View>
              <View style={styles.divisor}></View>

              {/* ========= ADDRESS =========== */}

              <TouchableOpacity
                style={styles.iconDropDown}
                onPress={() => onDropdownClick()}>
                <View style={styles.addressContainer}>
                  <View style={styles.addressContainerHeader}>
                    <MaterialIcons name="location-on" size={30} />
                    <View style={{flex: 1}}>
                      <Text style={styles.dividerText}>
                        ADDRESS
                        <Text style={{fontSize: 16, color: 'gray'}}>
                          {' '}
                          (optional)
                        </Text>
                      </Text>
                    </View>
                    {iconDirection ? (
                      <IconFontAwesome
                        name="chevron-down"
                        size={25}
                        style={styles.iconDropdown}
                      />
                    ) : (
                      <IconFontAwesome
                        name="chevron-up"
                        size={25}
                        style={styles.iconDropdown}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              {iconDirection ? (
                <View style={styles.credentialsContainer}>
                  <View style={styles.containerInfo}>
                    <Text style={styles.formTitle}>Street</Text>
                    <CustomInput
                      control={control}
                      name="street"
                      placeholder="123 Main Street"
                      iconLeft="map-signs"
                    />
                  </View>
                  <View style={styles.containerInfo}>
                    <Text style={styles.formTitle}>Neighborhood</Text>
                    <CustomInput
                      control={control}
                      name="neighborhood"
                      placeholder="Downtown, etc."
                      iconLeft="map"
                    />
                  </View>
                  <View style={styles.containerInfo}>
                    <Text style={styles.formTitle}>Number</Text>
                    <CustomInput
                      control={control}
                      name="street_number"
                      placeholder="Apt 4B or House 42"
                      iconLeft="home"
                    />
                  </View>
                  <View style={styles.containerInfo}>
                    <Text style={styles.formTitle}>City</Text>
                    <CustomInput
                      control={control}
                      name="city"
                      placeholder="New York, San Francisco"
                      iconLeft="city"
                    />
                  </View>
                </View>
              ) : (
                ''
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <View
        style={[
          styles.registerContainerWrapper,
          {height: isAuthenticated ? 240 : 150},
        ]}>
        <SubmitButton
          text={'Save'}
          onButtonPressed={handleSubmit(onRegisterPressed)}
          textSize={20}
          height={25}
        />
      </View>
    </>
  );
};

export default Register;

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: 20,
  },
  emailHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconDropdown: {
    marginRight: 5,
  },
  shadowContainer: {
    backgroundColor: '#084700',
    position: 'absolute',
    left: 15,
    top: 25,
    width: '100%',
    borderRadius: 8,
    padding: 27,
  },
  registerContainerWrapper: {
    position: 'relative',
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: 'lightgray',
  },
  textHeader: {
    alignSelf: 'center',
  },
  verifyEmailText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'green',
  },
  addressContainerHeader: {
    gap: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconDropDown: {
    marginRight: 10,
  },
  dividerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  },
  addressContainer: {
    padding: 10,
    backgroundColor: 'lightgray',
  },
  divisor: {
    backgroundColor: 'gray',
    width: '100%',
    height: 5,
    marginVertical: 20,
    borderRadius: 10,
  },
  credentialsContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  containerInfo: {
    marginTop: 10,
    width: '100%',
  },
  formTitle: {
    fontSize: 16,
    alignItems: 'center',
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  createAccountText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: 'gray',
  },
  signInText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: 'blue',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  formFooter: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
  registerContainer: {
    backgroundColor: 'green',
    flexDirection: 'row',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
});
