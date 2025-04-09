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
import {useForm} from 'react-hook-form';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';
import {useAuth} from '../../providers/AuthProvider';
import axiosInstance from '../../services/api';
import CustomInput from '../../component/CustomInput';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

const apiURL = `${BASE_URL}/api`;

interface Branch {
  id: number;
  name: string;
  email: string;
  image: string;
}

const UserManagement = () => {
  const toast = useToast();
  const [userList, setUserList] = useState<Branch[]>([]);
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
      const response = await axiosInstance.get<Branch[]>(`/branches${query}`);
      setUserList(response.data);
    } catch (error) {
      console.log('Error fetching branches:', error);
      if (error.response?.status === 401) {
        toast.show('Unauthorized', {placement: 'top', type: 'danger'});
        endSession();
      }
    }
  };

  const deleteUser = id => {
    axiosInstance
      .delete(`/branch/delete/${id}`)
      .then(() => fetchUsers())
      .catch(e => {
        toast.show(e, {
          type: 'danger',
          placement: 'top',
        });
      });
  };

  const confirmDeleteAlert = id =>
    Alert.alert('Are you sure?', 'Delete branch?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: () => deleteUser(id)},
    ]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [searchTerm]),
  );

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.searchUserContainer}>
        <View style={styles.searchUser}>
          <CustomInput
            control={control}
            name="term"
            placeholder="Search by the name / email."
            iconLeft="search"
          />
        </View>
      </View>
      <FlatList
        data={userList.filter(branch => branch.id != session?.userId)}
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
                <IconFontAwesome name="branch-alt" size={50} />
              )}
              <View style={styles.itemDetailsContainer}>
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
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.delete}
                  onPress={() => confirmDeleteAlert(item.id)}>
                  <IconFontAwesome name="trash" color="#ff0000" size={25} />
                </TouchableOpacity>
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
  },
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  profilePicture: {
    height: 50,
    width: 50,
    borderRadius: 12,
  },
  searchUserContainer: {
    backgroundColor: '#108b00be',
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
    gap: 20,
    alignItems: 'center',
    padding: 14,
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
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  delete: {
    backgroundColor: '#ffcece',
    padding: 10,
    borderRadius: 10,
  },
  itemDetailsContainer: {
    flex: 1,
  },
});
