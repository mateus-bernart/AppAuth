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
import {useForm} from 'react-hook-form';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import SlideInView from '../../../components/SlideView';
import {BASE_URL} from '../../../services/config';
import {useDatabase} from '../../../providers/DatabaseProvider';
import {isOnline} from '../../../helpers/networkHelper';
import ActionButton from '../../../components/EditButton';
import ProductCard from '../../../components/ProductCard';
import {
  adjustStockQuantity,
  showBranchStockData,
} from '../../../helpers/databaseHelpers/stockProduct';

export type Product = {
  id: number;
  name: string;
  description: string;
  code: string;
  batch: string;
  quantity: string;
  price: number;
  image: string | null;
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
  const {branches} = useDatabase();
  const [editable, setEditable] = useState(false);
  const {db} = useDatabase();

  const [updatedQuantities, setUpdatedQuantities] = useState<UpdatedQuantities>(
    {},
  );

  const {control, watch} = useForm();
  const searchTerm = watch('term');

  const getImageByProductId = (productId: number): string => {
    const product = productList.find(p => p.id === productId);
    const imagePath = product?.image;

    if (!imagePath || typeof imagePath !== 'string') return '';

    const isLocalImage =
      imagePath.startsWith('/data') || imagePath.startsWith('file:/');

    return isLocalImage
      ? imagePath
      : `${BASE_URL.replace('/api', '')}/storage/product_images/${
          product.image
        }`;
  };

  const getSqliteBranchStock = async () => {
    try {
      const productResult = await showBranchStockData(db);
      console.log(productResult);

      setProductList(productResult);
    } catch (error) {
      console.log('Error fetching SQLite branch stock:', error);
    }
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
        placement: 'bottom',
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
        {
          text: 'YES',
          onPress: () => {
            toast.show('Tap the button again to confirm and save changes.', {
              type: 'info',
              placement: 'top',
            });
            setEditable(state => !state);
            return;
          },
        },
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
            const online = await isOnline();
            try {
              if (!online) {
                const productId = Object.keys(updatedQuantities).map(id =>
                  parseInt(id, 10),
                );
                const newQuantity = Object.values(updatedQuantities);

                await adjustStockQuantity(db, productId, newQuantity, branchId);
                setEditable(false);
                setUpdatedQuantities({});
                getSqliteBranchStock();
              } else {
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
              }

              toast.show('Changes confirmed and stored', {
                type: 'success',
                placement: 'top',
              });
            } catch (error) {
              console.log(error);
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
      (async () => {
        try {
          const online = await isOnline();

          if (!online) {
            const branch = branches.find(b => b.id === branchId);
            setBranchInfo(branch || null);
            await getSqliteBranchStock();
          } else {
            fetchBranchInfo();
          }
        } catch (error) {
          console.log('Error in useFocuEffect: ', error);
        }
      })();
    }, [searchTerm]),
  );

  return (
    <SafeAreaView style={styles.body}>
      <Header
        title={branchInfo?.description || branches[branchId - 1].description}
        backToScreen="Branches"
      />
      <ActionButton
        onPress={handleConfirmEdit}
        iconName={editable ? 'check' : 'create'}
        size={35}
        color="white"
        style={{top: 50}}
      />
      <SearchBar control={control} />

      {editable && (
        <TouchableOpacity
          onPress={() => handleNavigation('AddProduct', {branchId: branchId})}>
          <View style={styles.addProductButtonContainer}>
            <Text style={styles.addProductButtonText}>Add new product</Text>
          </View>
        </TouchableOpacity>
      )}
      <FlatList
        data={productList.filter(branch => branch.id)}
        renderItem={({item}) => {
          const newQuantity = updatedQuantities[item.id] ?? item.quantity;
          const wasChanged = updatedQuantities[item.id] !== undefined;

          return (
            <ProductCard
              onPressCard={() =>
                handleNavigation('BranchStockProductDetails', {
                  product: item,
                  branchId: branchId,
                })
              }
              editable={editable}
              item={item}
              getImageByProductId={getImageByProductId(item.id)}
              newQuantity={newQuantity}
              wasChanged={wasChanged}
              onPressAdjustQuantityIncrement={() =>
                handleAdjustQuantity('increment', item.id)
              }
              onPressAdjustQuantityDecrement={() =>
                handleAdjustQuantity('decrement', item.id)
              }
            />
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
    backgroundColor: '#60b565',
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
    backgroundColor: '#60b565',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});
