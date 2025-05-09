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
import React, {use, useCallback, useContext, useEffect, useState} from 'react';
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
import {useDatabase} from '../../providers/DatabaseProvider';
import {isOnline} from '../../helpers/networkHelper';
import BranchCard from '../../components/BranchCard';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

export interface Branch {
  id: number;
  code: string;
  description: string;
}

const Branches = () => {
  const toast = useToast();
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const {endSession, session} = useAuth();
  const {branches} = useDatabase();

  const {control, watch} = useForm();

  const searchTerm = watch('term');

  const fetchBranches = async () => {
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
      const handleBranches = async () => {
        try {
          const online = await isOnline();
          if (!online) {
            setBranchList(branches);
          } else {
            fetchBranches();
          }
        } catch (error) {
          console.log('Error in useFocusEffect: ', error);
        }
      };
      handleBranches();
    }, [searchTerm, branches, fetchBranches]),
  );

  return (
    <SafeAreaView style={styles.body}>
      <Header title="BRANCHES" iconLeft={false} />
      <SearchBar control={control} placeholder="Search by the name/code" />
      <FlatList
        data={branchList.filter(branch => branch.id)}
        renderItem={({item}) => <BranchCard item={item} />}
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
