import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useAuth} from '../../providers/AuthProvider';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';
import Axios from 'axios';
import {storageGet} from '../../services/storage';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useToast} from 'react-native-toast-notifications';

const axios = Axios.create({
  baseURL: 'http://172.16.1.131:8000/api',
});

axios.interceptors.request.use(
  async function (config) {
    const authToken: string | null | undefined = await storageGet('AcessToken');
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

type UserInfoProps = {
  id: number;
  name: string;
  email: string;
};

const UserDetailsComponent = () => {
  const {session, endSession} = useAuth();
  const navigation = useNavigation<AppNavigationProp>();
  const [userInfo, setUserInfo] = useState<UserInfoProps>();
  const toast = useToast();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    endSession();
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await axios
        .get('/user')
        .then(response => {
          setUserInfo(response.data);
        })
        .catch(error => {
          toast.show('Could not render data', {
            type: 'danger',
            placement: 'top',
          });
        });
      return userInfo;
    };
    fetchUserInfo();
  }, []);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconHeader}
          onPress={() => handleBack()}>
          <IconFontAwesome name="chevron-left" size={35} />
        </TouchableOpacity>
        <Text style={styles.headerText}>User Details</Text>
        <TouchableOpacity
          onPress={() => handleLogout()}
          style={styles.iconLogout}>
          <IconMaterialIcons name="logout" size={35} color="red" />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <View style={styles.userNameContainer}>
          <IconFontAwesome name="user-circle" size={150} />
          <Text style={styles.textUserName}>{session?.userName}</Text>
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.containerHeader}>
            <Text style={styles.headerInfo}>Contact Info</Text>
          </View>
          <View style={styles.infoWrapper}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Email:</Text>
              <Text style={styles.infoValue}>{userInfo?.email}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Phone:</Text>
              <Text style={styles.infoValue}>049 9 99598609{}</Text>
            </View>
          </View>
          <View>
            <View style={styles.containerHeader}>
              <Text style={styles.headerInfo}>Address</Text>
            </View>
            <View style={styles.infoWrapper}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Street:</Text>
                <Text style={styles.infoValue}>Rua Angelo Ary Biezus </Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Neighborhood:</Text>
                <Text style={styles.infoValue}>Imigrantes</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Number:</Text>
                <Text style={styles.infoValue}>87</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default UserDetailsComponent;

const styles = StyleSheet.create({
  headerTop: {
    backgroundColor: 'lightgray',
  },
  iconLogout: {
    position: 'absolute',
    right: 20,
    color: 'red',
  },
  header: {
    alignItems: 'center',
    height: 40,
  },
  iconHeader: {
    position: 'absolute',
    left: 30,
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
  },
  body: {
    flex: 1,
  },
  userNameContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    marginTop: 20,
  },
  textUserName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
    alignSelf: 'center',
  },
  userInfoContainer: {
    flex: 1,
    margin: 20,
  },
  textInput: {
    backgroundColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  containerHeader: {
    backgroundColor: 'lightgray',
    padding: 10,
    marginBottom: 12,
  },
  headerInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 15,
    height: 30,
    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  infoWrapper: {
    marginBottom: 10,
  },
});
