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
import CustomInput from '../../components/CustomInput';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

const apiURL = `${BASE_URL}/api`;

interface Branch {
  id: number;
  code: string;
  description: string;
}

const Branches = () => {
  const toast = useToast();
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const navigation = useNavigation<AppNavigationProp>();
  const {endSession, session} = useAuth();

  const {control, watch} = useForm();

  const searchTerm = watch('term');

  const handleNavigation = (screens, params = {}) => {
    navigation.navigate(screens, params);
  };

  const fetchBranchs = async () => {
    try {
      const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
      const response = await axiosInstance.get<Branch[]>(`/branches${query}`);
      setBranchList(response.data);
    } catch (error) {
      console.log('Error fetching branches:', error);
      if (error.response?.status === 401) {
        toast.show('Unauthorized', {placement: 'top', type: 'danger'});
        endSession();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBranchs();
    }, [searchTerm]),
  );

  return (
    <SafeAreaView style={styles.body}>
      <Header title="BRANCHES" iconLeft={false} />
      <SearchBar control={control} />
      <FlatList
        data={branchList.filter(branch => branch.id)}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                handleNavigation('BranchStock', {branchId: item.id});
              }}>
              <View style={styles.itemBand} />
              <View style={styles.itemDetailsContainer}>
                <Text
                  style={styles.itemName}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.description}
                </Text>
                <Text
                  style={styles.itemDetails}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  # {item.code}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Branches;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginBottom: 100,
  },
  itemBand: {
    backgroundColor: '#60b565',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
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
  searchBranchContainer: {
    backgroundColor: 'green',
    padding: 10,
  },
  searchBranch: {
    marginHorizontal: 10,
  },
  searchBranchText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Poppins-Medium',
  },
  itemContainer: {
    flexDirection: 'row',
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
  itemDetailsContainer: {
    flex: 16,
    padding: 14,
  },
  itemName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  itemDetails: {
    fontSize: 16,
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
});
