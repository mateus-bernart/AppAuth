import {
  FlatList,
  Image,
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
import EditButton from '../../../components/EditButton';
import UserCard from '../../../components/UserCard';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

export interface User {
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
    <SafeAreaView style={styles.body}>
      <Header title="USER MANAGEMENT" iconLeft={false} />
      <SearchBar control={control} placeholder="Search by the name/email" />
      <EditButton
        onPress={() => navigation.navigate('Register')}
        iconName="add"
        color="white"
        size={35}
        style={{top: 50}}
      />
      <FlatList
        data={userList.filter(user => user.id != session?.userId)}
        renderItem={({item}) => {
          return (
            <UserCard
              item={item}
              onPress={() => handleNavigation('UserDetails', {userId: item.id})}
            />
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
    position: 'relative',
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
});
