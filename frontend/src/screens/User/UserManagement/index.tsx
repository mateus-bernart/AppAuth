import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {use, useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useToast} from 'react-native-toast-notifications';
import Header from '../../../components/Header';
import {useAuth} from '../../../providers/AuthProvider';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../../types/navigationTypes';
import axiosInstance from '../../../services/api';
import {useForm} from 'react-hook-form';
import SearchBar from '../../../components/SearchBar';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

const apiURL = `${BASE_URL}/api`;

interface User {
  id: number;
  name: string;
  email: string;
  image: string;
  user_type: 'manager' | 'regional_manager' | 'employee';
  user_branch: string;
}

const UserManagement = () => {
  const toast = useToast();
  const [userList, setUserList] = useState<User[]>([]);
  const navigation = useNavigation<AppNavigationProp>();
  const {endSession, session} = useAuth();

  const {control, watch} = useForm();

  const searchTerm = watch('term');

  const handleNavigation = (screens, params = {}) => {
    navigation.navigate(screens, params);
  };

  const fetchUsers = async () => {
    try {
      const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
      const response = await axiosInstance.get<User[]>(`/users${query}`);

      setUserList(response.data);
    } catch (error) {
      console.log('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.show('Unauthorized', {placement: 'top', type: 'danger'});
        endSession();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [searchTerm]),
  );

  return (
    <SafeAreaView style={[styles.body, {position: 'relative'}]}>
      <Header title="USER MANAGEMENT" iconLeft={false} />
      <SearchBar control={control} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={styles.iconEdit}>
        <IconFontAwesome5 name="user-plus" size={35} color="white" />
      </TouchableOpacity>
      <FlatList
        data={userList.filter(user => user.id != session?.userId)}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                handleNavigation('UserDetails', {userId: item.id});
              }}>
              {item.image ? (
                <Image
                  source={{
                    uri: `${BASE_URL}/storage/profile_images/${item.image}`,
                  }}
                  style={styles.profilePicture}
                />
              ) : (
                <IconFontAwesome name="user-alt" size={50} />
              )}
              <View style={styles.itemDetailsContainer}>
                <View
                  style={[
                    styles.itemDetailsInfoContainer,
                    {alignItems: 'flex-start'},
                  ]}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.name}
                  </Text>
                  <Text
                    style={styles.itemDetails}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.email}
                  </Text>
                </View>

                <View style={[styles.itemDetailsInfoContainer]}>
                  <Text
                    style={[
                      styles.itemName,
                      {
                        color:
                          item.user_type === 'regional_manager'
                            ? '#ffffff'
                            : '#1b3f26',
                      },
                      {
                        padding: 7,
                        backgroundColor:
                          item.user_type === 'regional_manager'
                            ? '#ea4f3d'
                            : '#29df5c',
                        borderRadius: 10,
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.user_type === 'regional_manager'
                      ? 'Regional Manager'
                      : 'Employee'}
                  </Text>
                  <Text
                    style={[
                      styles.itemName,
                      {
                        color: '#504100',
                      },
                      {
                        padding: 10,
                        backgroundColor: '#ffe282',
                        borderRadius: 10,
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.user_branch}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default UserManagement;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginBottom: 100,
  },
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconEdit: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#41a746',
    right: 30,
    top: 50,
    borderRadius: 10,
  },
  profilePicture: {
    height: 80,
    width: 70,
    borderRadius: 10,
  },
  searchUserContainer: {
    backgroundColor: 'green',
    padding: 10,
  },
  searchUser: {
    marginHorizontal: 10,
  },
  searchUserText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Poppins-Medium',
  },
  itemContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  itemName: {
    fontFamily: 'Poppins-Bold',
  },
  itemDetails: {
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  itemDetailsContainer: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemDetailsInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
    flexShrink: 1,
  },
});
