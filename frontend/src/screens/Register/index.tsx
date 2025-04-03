import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import CustomInput from '../../component/CustomInput';
import Axios from 'axios';
import {useToast} from 'react-native-toast-notifications';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {AppNavigationProp} from '../../types/navigationTypes';
import {useAuth} from '../../providers/AuthProvider';
import axiosInstance from '../../services/api';
import {SafeAreaView} from 'react-native-safe-area-context';

const Register = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const {isAuthenticated} = useAuth();
  const [iconDirection, setIconDirection] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
    setError,
  } = useForm();
  //default values
  const passwordVerification = watch('password');

  const onRegisterPressed = async data => {
    await axiosInstance
      .post('/register', data)
      .then(response => {
        if (response.data.status === 'created') {
          toast.show('User created', {
            type: 'success',
            placement: 'top',
          });
          if (!isAuthenticated) {
            navigation.navigate('Login');
          } else {
            navigation.navigate('Home');
          }
        } else {
          toast.show('Fail to register user', {
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

  const onDropdownClick = () => {
    if (iconDirection) {
      setIconDirection(false);
    } else {
      setIconDirection(true);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <IconFontAwesome name="chevron-left" size={30} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.textHeader}>
            <Text style={styles.title}>Register</Text>
          </View>
          {!isAuthenticated && (
            <View style={styles.formFooter}>
              <Text style={styles.createAccountText}>
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (isAuthenticated) {
                    navigation.navigate('Home');
                  }
                  navigation.navigate('Login');
                }}>
                <Text style={styles.signInText}>Sign in</Text>
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
                <Text style={styles.formTitle}>Email</Text>
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
                  rules={{
                    minLength: {
                      value: 11,
                      message: 'Phone number should be minimum 11 characters',
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
        <View style={styles.footerSave}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onRegisterPressed)}>
            <Text style={styles.buttonText}>Save</Text>
            <IconFontAwesome name="check" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  body: {},
  scrollView: {
    marginHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  iconDropdown: {
    marginRight: 5,
  },
  footerSave: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
    backgroundColor: '#dfdfdf',
  },
  textHeader: {
    alignSelf: 'center',
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
    width: '100%',
  },
  formTitle: {
    fontSize: 16,
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
  signInText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    padding: 8,
    backgroundColor: '#311aff',
    color: 'white',
    borderRadius: 14,
  },
  formContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
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
  button: {
    backgroundColor: 'green',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
});
