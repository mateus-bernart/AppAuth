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
import CustomInput from '../../../component/CustomInput';
import {useForm} from 'react-hook-form';
import Header from '../../../component/Header';

export type Product = {
  id: number;
  name: string;
  description: string;
  code: string;
  batch: string;
  quantity: string;
  price: number;
};

const BranchStock = ({route}) => {
  const branchId = route.params?.branchId;
  const [productList, setProductList] = useState<Product[]>([]);
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();

  const {control, watch} = useForm();
  const searchTerm = watch('term');

  const fetchBranchInfo = async () => {
    try {
      const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
      const response = await axiosInstance.get(
        `/branch/${branchId}/stocks${query}`,
      );

      console.log(response);

      const products = response.data.stock.map(stock => ({
        ...stock.product,
        quantity: stock.quantity,
        batch: stock.batch,
      }));

      setProductList(products);

      //branch or stock
      console.log(response.data);
    } catch (error) {
      toast.show('Error to find products', {type: 'danger', placement: 'top'});
      console.log(error.response);
    }
  };

  const handleNavigation = (screens, params = {}) => {
    navigation.navigate(screens, params);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBranchInfo();
    }, [searchTerm]),
  );

  return (
    <SafeAreaView style={styles.body}>
      <Header title="BRANCHES" />
      <View style={styles.searchBranchContainer}>
        <View style={styles.searchBranch}>
          <CustomInput
            control={control}
            name="term"
            placeholder="Search by the name / email."
            iconLeft="search"
          />
        </View>
      </View>
      <FlatList
        data={productList.filter(branch => branch.id)}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                handleNavigation('BranchStockProductDetails', {
                  product: item,
                });
              }}>
              <View style={styles.itemDetailsContainer}>
                <Text
                  style={styles.itemName}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.name}
                </Text>
                <Text
                  style={styles.itemBatch}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Batch: {item.batch}
                </Text>
                <Text
                  style={styles.itemDetails}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Quantity: {item.quantity}
                </Text>
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
  },
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  searchBranchContainer: {
    padding: 10,
    backgroundColor: 'green',
  },
  searchBranch: {
    marginHorizontal: 10,
  },
  itemDetailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  itemBatch: {
    fontFamily: 'Poppins-Medium',
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
