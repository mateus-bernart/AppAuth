import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Axios, {AxiosResponse} from 'axios';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useToast} from 'react-native-toast-notifications';
import Header from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storageDelete, storageGet} from '../../services/storage';
import {useAuth} from '../../providers/AuthProvider';
import {useIsFocused} from '@react-navigation/native';

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

interface User {
  id: number;
  name: string;
  email: string;
}

const Home = () => {
  const toast = useToast();
  const [userList, setUserList] = useState<User[]>([]);
  const isFocused = useIsFocused();

  const {endSession} = useAuth();

  const fetchUsers = () => {
    axios
      .get<User, AxiosResponse>('/users')
      .then(response => {
        setUserList(response.data);
      })
      .catch(error => {
        if (error.status === 401) {
          toast.show('Unauthorized', {placement: 'top', type: 'danger'});
          endSession();
        }
      });
  };

  const deleteUser = id => {
    axios
      .delete(`/user/delete/${id}`)
      .then(response => {
        fetchUsers();
      })
      .catch(e => {
        toast.show(e, {
          type: 'danger',
          placement: 'top',
        });
      });
  };

  useEffect(() => {
    if (isFocused) {
      fetchUsers();
      console.log('fetch');
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.body}>
      <Header />
      <FlatList
        data={userList}
        renderItem={({item}) => {
          return (
            <TouchableOpacity style={styles.itemContainer}>
              <IconFontAwesome name="user-alt" size={40} />
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
                <TouchableOpacity style={styles.edit}>
                  <IconFontAwesome name="pen" color="#008d0c" size={25} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.delete}
                  onPress={() => deleteUser(item.id)}>
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

export default Home;

const styles = StyleSheet.create({
  body: {
    flex: 1,
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
  edit: {
    backgroundColor: '#d5e2d6',
    padding: 14,
    borderRadius: 10,
  },
  delete: {
    backgroundColor: '#ffcece',
    padding: 14,
    borderRadius: 10,
  },
  itemDetailsContainer: {
    flex: 1,
  },
});
