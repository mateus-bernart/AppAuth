import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import axiosInstance from '../../../services/api';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppNavigationProp} from '../../../types/navigationTypes';
import {useToast} from 'react-native-toast-notifications';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';

interface Branch {
  id: number;
  name: string;
  email: string;
  image: string;
}

const BranchStock = ({route}) => {
  const branchId = route.params?.branchId;
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();

  const fetchBranchInfo = async () => {
    try {
      const response = await axiosInstance.get(`/branch/${branchId}`);
      // setBranchList(response.data);
      console.log(response);
    } catch (error) {
      console.log(error.response);
    }
  };

  const confirmDeleteAlert = id =>
    Alert.alert('Are you sure?', 'Delete user?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: () => deleteUser(id)},
    ]);

  const deleteUser = id => {
    axiosInstance
      .delete(`/user/delete/${id}`)
      .then(() => fetchBranchInfo())
      .catch(e => {
        toast.show(e, {
          type: 'danger',
          placement: 'top',
        });
      });
  };

  const handleNavigation = (screens, params = {}) => {
    navigation.navigate(screens, params);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBranchInfo();
    }, []),
  );

  return (
    <SafeAreaView style={styles.body}>
      <FlatList
        data={branchList.filter(branch => branch.id)}
        renderItem={({item}) => {
          return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => {}}>
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

export default BranchStock;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 20,
  },
  itemDetailsContainer: {
    flex: 1,
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
});
