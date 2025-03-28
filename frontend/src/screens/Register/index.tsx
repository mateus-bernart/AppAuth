import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
        Object.keys(e.response.data.errors).map(key => {
          //Tipagem form -> key (bd)
          setError(key, {message: e.response.data.errors[key][0]});
        });
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={styles.body}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}>
              <IconFontAwesome
                name="chevron-left"
                size={30}
                style={styles.iconBack}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onRegisterPressed)}>
              <Text style={styles.buttonText}>Save</Text>
              <IconFontAwesome name="check" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.textHeader}>
            <Text style={styles.title}>Register</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.credentialsContainer}>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>Name</Text>
                <CustomInput
                  rules={{required: 'Name is required'}}
                  control={control}
                  name="name"
                  placeholder="Enter your name"
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
                  placeholder="Enter password"
                  secureTextEntry={true}
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
                  placeholder="Repeat password"
                  secureTextEntry={true}
                />
              </View>
            </View>
            <View style={styles.divisor}></View>

            <View style={styles.addressContainer}>
              <Text style={styles.dividerText}>
                ADDRESS
                <Text style={{fontSize: 16, color: 'gray'}}>(optional)</Text>
              </Text>
            </View>
            <View style={styles.credentialsContainer}>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>Street</Text>
                <CustomInput
                  control={control}
                  name="street"
                  placeholder="123 Main Street"
                />
              </View>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>Neighborhood</Text>
                <CustomInput
                  control={control}
                  name="neighborhood"
                  placeholder="Downtown, etc."
                />
              </View>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>Number</Text>
                <CustomInput
                  control={control}
                  name="street-number"
                  placeholder="Apt 4B or House 42"
                />
              </View>
              <View style={styles.containerInfo}>
                <Text style={styles.formTitle}>City</Text>
                <CustomInput
                  control={control}
                  name="city"
                  placeholder="New York, San Francisco"
                />
              </View>
            </View>

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
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  textHeader: {
    alignSelf: 'center',
    marginTop: 30,
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
    width: '48%',
  },
  iconBack: {},
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
    marginTop: 60,
    marginHorizontal: 20,
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
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
});
