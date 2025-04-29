import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {act, useCallback, useEffect, useState} from 'react';
import axiosInstance from '../../../services/api';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppNavigationProp} from '../../../types/navigationTypes';
import {useToast} from 'react-native-toast-notifications';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import CustomInput from '../../../components/CustomInput';
import {useForm} from 'react-hook-form';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import SlideInView from '../../../components/SlideView';
import {BASE_URL} from '../../../services/config';

export type Product = {
  id: number;
  name: string;
  description: string;
  code: string;
  batch: string;
  quantity: string;
  price: number;
  image: Image | null;
};

type Branch = {
  description: string;
  code: string;
};

type UpdatedQuantities = Record<number, number>;

const BranchStock = ({route}) => {
  const branchId = route.params?.branchId;
  const [productList, setProductList] = useState<Product[]>([]);
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const [branchInfo, setBranchInfo] = useState<Branch | null>(null);
  const [editable, setEditable] = useState(false);

  const [updatedQuantities, setUpdatedQuantities] = useState<UpdatedQuantities>(
    {},
  );

  const {control, watch} = useForm();
  const searchTerm = watch('term');

  const getImageByProductId = (productId: number): string => {
    const product = productList.find(p => p.id === productId);
    return product?.image
      ? `${BASE_URL.replace('/api', '')}/storage/product_images/${
          product.image
        }`
      : '';
  };

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
      toast.show('Error to find products, check internet connection', {
        type: 'danger',
        placement: 'top',
      });
      console.log(error.response);
    }
  };

  const handleAdjustQuantity = async (
    action: 'increment' | 'decrement',
    productId: number,
  ) => {
    try {
      const currentValue = getCurrentQuantity(productId);

      const newValue =
        action === 'increment'
          ? currentValue + 1
          : Math.max(0, currentValue - 1);

      setUpdatedQuantities(prev => ({
        ...prev,
        [productId]: newValue,
      }));
    } catch (error) {
      toast.show('Error updating quantity', {type: 'danger'});
      console.log(error.response);
    }
  };

  const getCurrentQuantity = (productId: number): number => {
    return (
      updatedQuantities[productId] ??
      productList.find(p => p.id === productId)?.quantity ??
      0
    );
  };

  const handleConfirmEdit = () => {
    if (!editable) {
      Alert.alert('Edit Stock?', 'Are you sure?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'YES', onPress: () => setEditable(true)},
      ]);
    } else {
      Alert.alert('Confirm Changes?', 'Are you sure?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: async () => {
            try {
              await Promise.all(
                Object.entries(updatedQuantities).map(
                  async ([productId, newQuantity]) => {
                    const response = await axiosInstance.post(
                      `/stock/${productId}/log-adjustment`,
                      {
                        branch_id: branchId,
                        new_quantity: newQuantity,
                      },
                    );
                    console.log(response.data);
                  },
                ),
              );

              setEditable(false);
              fetchBranchInfo();
              setUpdatedQuantities({});

              toast.show('Changes confirmed and stored', {
                type: 'success',
                placement: 'top',
              });
            } catch (error) {
              toast.show('Failed to store changes', {
                type: 'danger',
                placement: 'top',
              });
            }
          },
        },
      ]);
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
          <Text style={styles.editStockText}>Modify</Text>
        ) : (
          <Text style={styles.editStockText}>Confirm</Text>
        )}
      </TouchableOpacity>
      <SearchBar control={control} />
      {editable && (
        <TouchableOpacity
          onPress={() => handleNavigation('AddProduct', {branchId: branchId})}>
          <View style={styles.addProductButtonContainer}>
            <Text style={styles.addProductButtonText}>Add new Product</Text>
          </View>
        </TouchableOpacity>
      )}
      <FlatList
        data={productList.filter(branch => branch.id)}
        renderItem={({item}) => {
          const newQuantity = updatedQuantities[item.id] ?? item.quantity;
          const wasChanged = updatedQuantities[item.id] !== undefined;

          return (
            <View style={styles.itemContainer}>
              <View style={styles.itemDetailWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    handleNavigation('BranchStockProductDetails', {
                      product: item,
                    });
                  }}>
                  <Text
                    style={[
                      styles.itemName,
                      {borderTopRightRadius: !editable ? 10 : 0},
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.name}
                  </Text>
                  <View style={styles.itemDetailContainer}>
                    <View style={styles.infoWrapper}>
                      <View style={styles.infoContainer}>
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
                          Quantity:
                        </Text>
                        <View style={styles.quantityValueContainer}>
                          {wasChanged ? (
                            <SlideInView
                              direction="right"
                              distance={30}
                              style={{}}>
                              <Text
                                style={[
                                  styles.detailsHighlighted,
                                  wasChanged && styles.oldNumber,
                                ]}>
                                {item.quantity}
                              </Text>
                            </SlideInView>
                          ) : (
                            <Text
                              style={[
                                styles.detailsHighlighted,
                                wasChanged && styles.oldNumber,
                              ]}>
                              {item.quantity}
                            </Text>
                          )}

                          {wasChanged && (
                            <>
                              <SlideInView
                                direction="left"
                                distance={10}
                                style={{}}>
                                <IconFontAwesome
                                  name="arrow-right"
                                  size={20}
                                  style={{marginBottom: 5}}
                                />
                              </SlideInView>
                              <SlideInView
                                direction="left"
                                distance={10}
                                style={{}}>
                                <Text
                                  style={[
                                    styles.detailsHighlighted,
                                    styles.newQuantityValue,
                                  ]}>
                                  {newQuantity}
                                </Text>
                              </SlideInView>
                            </>
                          )}
                        </View>
                      </View>
                      <SlideInView direction="left" distance={10} style={{}}>
                        <View
                          style={[
                            styles.imageContainer,
                            {alignItems: editable ? 'center' : 'flex-end'},
                          ]}>
                          <Image
                            source={{uri: getImageByProductId(item.id)}}
                            style={styles.imageStyle}
                          />
                        </View>
                      </SlideInView>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              {editable && (
                <View style={{...(editable && {flex: 1})}}>
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        handleAdjustQuantity('increment', item.id);
                      }}
                      style={[
                        editable && styles.buttonAdjust,
                        {borderTopRightRadius: 10},
                        {borderBottomWidth: 1},
                      ]}>
                      <IconFontAwesome name="plus" size={25} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleAdjustQuantity('decrement', item.id);
                      }}
                      style={[
                        editable && styles.buttonAdjust,
                        {borderBottomRightRadius: 10},
                      ]}>
                      <IconFontAwesome name="minus" size={25} />
                    </TouchableOpacity>
                  </>
                </View>
              )}
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
    marginBottom: 90,
  },
  editStockButton: {
    padding: 8,
    position: 'absolute',
    top: 55,
    right: 20,
    borderRadius: 8,
    backgroundColor: 'green',
    color: 'green',
  },
  editStockText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: 'white',
  },
  addProductButtonContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b55ec',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
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
  itemDetailWrapper: {
    flex: 3,
  },
  buttonAdjust: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#d8d8d8',
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    borderTopLeftRadius: 10,
    backgroundColor: 'green',
    padding: 10,
  },
  itemDetailContainer: {
    padding: 10,
  },
  itemBatch: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    alignSelf: 'flex-start',
  },
  itemDetails: {
    marginTop: 10,
    fontSize: 18,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  quantityValueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  detailsHighlighted: {
    color: '#005c0c',
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
  },
  newQuantityValue: {
    fontSize: 32,
  },
  oldNumber: {
    color: 'black',
    fontSize: 22,
    textDecorationLine: 'line-through',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
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
  infoWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  imageStyle: {
    height: 120,
    width: 120,
    borderRadius: 12,
  },
});
