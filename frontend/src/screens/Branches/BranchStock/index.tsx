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
import SearchBar from '../../../component/SearchBar';

export type Product = {
  id: number;
  name: string;
  description: string;
  code: string;
  batch: string;
  quantity: string;
  price: number;
};

type Branch = {
  description: string;
  code: string;
};

const BranchStock = ({route}) => {
  const branchId = route.params?.branchId;
  const [productList, setProductList] = useState<Product[]>([]);
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const [branchInfo, setBranchInfo] = useState<Branch | null>(null);
  const [editable, setEditable] = useState(false);
  // const [numberChanged, setNumberChanged] = useState(false);

  const {control, watch} = useForm();
  const searchTerm = watch('term');

  const fetchBranchInfo = async () => {
    try {
      const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
      const response = await axiosInstance.get(
        `/branch/${branchId}/stocks${query}`,
      );

      const products = response.data.stock.map(stock => ({
        ...stock.product,
        quantity: stock.quantity,
        batch: stock.batch,
      }));

      setProductList(products);
      setBranchInfo(response.data.branch);
    } catch (error) {
      toast.show('Error to find products', {type: 'danger', placement: 'top'});
      console.log(error.response);
    }
  };

  const handleAdjustQuantity = async (action, productId) => {
    try {
      const response = await axiosInstance.post(
        `/stock/${productId}/adjust-stock`,
        {action, branch_id: branchId},
      );
      console.log(response);
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleConfirmEdit = () => {
    if (!editable) {
      Alert.alert('Edit Stock?', 'Are you sure?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'YES', onPress: () => handleEnableEdit()},
      ]);
    } else {
      Alert.alert('Confirm Changes?', 'Are you sure?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'YES', onPress: () => handleEnableEdit()},
      ]);
    }
  };

  const handleEnableEdit = () => {
    if (editable) {
      setEditable(false);
      fetchBranchInfo();
    } else {
      setEditable(true);
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
      <Header title={`${branchInfo?.description}`} />
      <TouchableOpacity
        style={styles.editStockButton}
        onPress={() => handleConfirmEdit()}>
        {!editable ? (
          <Text style={styles.editStockText}>Edit Stock</Text>
        ) : (
          <Text style={styles.editStockText}>Confirm</Text>
        )}
      </TouchableOpacity>
      <SearchBar control={control} />
      <FlatList
        data={productList.filter(branch => branch.id)}
        renderItem={({item}) => {
          return (
            <View style={styles.itemContainer}>
              <View style={styles.itemDetailsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    handleNavigation('BranchStockProductDetails', {
                      product: item,
                    });
                  }}>
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
                  <View style={{alignItems: 'center'}}>
                    <Text
                      style={styles.itemDetails}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      Quantity:
                    </Text>
                    <Text style={styles.detailsHighlighted}>
                      {item.quantity}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{flex: editable ? 1 : 0}}>
                {editable ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        handleAdjustQuantity('increment', item.id);
                      }}
                      style={[
                        editable
                          ? styles.buttonAdjustActive
                          : styles.buttonAdjustInactive,
                        {borderTopRightRadius: 10},
                      ]}>
                      <IconFontAwesome name="chevron-up" size={40} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleAdjustQuantity('decrement', item.id);
                      }}
                      style={[
                        editable
                          ? styles.buttonAdjustActive
                          : styles.buttonAdjustInactive,
                        {borderBottomRightRadius: 10},
                      ]}>
                      <IconFontAwesome name="chevron-down" size={40} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <></>
                )}
              </View>
            </View>
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
    position: 'relative',
  },
  editStockButton: {
    padding: 8,
    position: 'absolute',
    top: 55,
    right: 20,
    borderRadius: 8,
    backgroundColor: '#0043d3',
    color: 'green',
  },
  editStockText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: 'white',
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
    flex: 3,
    padding: 14,
  },
  buttonAdjustActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#d8d8d8',
  },
  buttonAdjustInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  itemBatch: {
    fontFamily: 'Poppins-Medium',
  },
  itemDetails: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  detailsHighlighted: {
    color: '#005c0c',
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    gap: 20,
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
