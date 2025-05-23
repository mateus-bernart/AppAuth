import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import axiosInstance from '../../../../services/api';
import {useToast} from 'react-native-toast-notifications';
import {
  AppNavigationProp,
  RootStackParamList,
} from '../../../../types/navigationTypes';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../components/Header';
import {BASE_URL} from '../../../../services/config';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  addImageOffline,
  deleteProduct,
  getImageFromCacheAndSave,
} from '../../../../helpers/databaseHelpers/stockProduct';
import {isOnline} from '../../../../helpers/networkHelper';
import {useDatabase} from '../../../../providers/DatabaseProvider';
import {useStock} from '../../../../providers/StockProvider';

type Product = {
  id: number;
  name: string;
  description: string;
  code: string;
  price: number;
  image: string | null;
  sync_error: string;
  error_message: string;
};

type ProductDetailRouteParams = {
  product: Product;
  branchId: number;
};

const ProductDetails = () => {
  const toast = useToast();
  const route =
    useRoute<
      RouteProp<{ProductDetails: ProductDetailRouteParams}, 'ProductDetails'>
    >();

  const {product, branchId} = route.params as {
    product: Product;
    branchId: number;
  };

  const navigation = useNavigation<AppNavigationProp>();
  const [image, setImage] = useState<string | undefined>(undefined);
  const [productData, setProductData] = useState(product);
  const {db} = useDatabase();
  const imagePath = product.image;
  const {refreshStockCount} = useStock();

  const handleNavigation = (screen: keyof RootStackParamList, values) => {
    navigation.navigate(screen, values);
  };

  const confirmDeleteAlert = () =>
    Alert.alert('Delete Product?', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: async () => await handleDeleteProduct()},
    ]);

  const handleDeleteProduct = async () => {
    const online = await isOnline();

    if (!online) {
      try {
        await deleteProduct(db, product.id);
        navigation.goBack();
        await refreshStockCount();
        toast.show('Product deleted', {type: 'success', placement: 'top'});
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await axiosInstance.delete(
          `/product/${product?.id}/delete`,
        );
        toast.show(response.data, {
          type: 'success',
          placement: 'top',
        });
        navigation.goBack();
      } catch (error) {
        console.log(error.response);
        toast.show(error.response, {
          type: 'danger',
          placement: 'top',
        });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params?.product) {
        setProductData(route.params.product);
      }
    }, [route.params?.product]),
  );

  useEffect(() => {
    if (imagePath) {
      const isLocalImage =
        imagePath.startsWith('/data') || imagePath.startsWith('file:/');

      const imageUrl = isLocalImage
        ? product.image
        : `${BASE_URL.replace('/api', '')}/storage/product_images/${
            product.image
          }`;

      setImage(imageUrl || undefined);
    }
  }, [imagePath]);

  const fetchProductInfo = async () => {
    try {
      const response = await axiosInstance.get(`/product/${product.id}`);
      setProductData({...product, ...response.data.product});
    } catch (error) {
      toast.show('Failed getting product data, check internet connection', {
        type: 'danger',
        placement: 'top',
      });
      console.log('Error fetching the product: ', error.response);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Update or Remove Image',
      'Would you like to update the image or remove it?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: () => handlenAddImage(),
        },
        {
          text: 'Remove',
          onPress: () => removeImage(),
        },
      ],
    );
  };

  const removeImage = async () => {
    try {
      const response = await axiosInstance.delete(
        `/product/${product.id}/remove-image`,
      );
      console.log(response);
      fetchProductInfo();
      toast.show('Image removed', {
        type: 'success',
        placement: 'top',
      });
      setImage(undefined);
    } catch (error) {
      toast.show('Error deleting the image', {
        type: 'danger',
        placement: 'top',
      });
      console.log('Error deleting the image: ', error.response);
    }
  };

  const handlenAddImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
    });

    if (result.didCancel) {
      console.log('User cancelled camera');
      return;
    } else if (result.errorCode) {
      console.log('Camera error: ', result.errorMessage);
      return;
    }

    const selectedImage = result.assets?.[0];
    if (!selectedImage) {
      console.log('No image selected');
      return;
    }

    const formData = new FormData();

    formData.append('image', {
      uri: selectedImage?.uri,
      type: selectedImage.type,
      name: selectedImage.fileName,
    });

    const online = await isOnline();

    if (!online) {
      try {
        const imagePersistedUri = await getImageFromCacheAndSave(
          selectedImage.uri,
        );

        await addImageOffline(db, product.id, imagePersistedUri);
        setImage(selectedImage.uri);
        toast.show('Image saved locally', {
          type: 'success',
          placement: 'top',
        });
      } catch (error) {
        console.error('Error adding image offline:', error);
        toast.show('Failed to save image offline', {
          type: 'danger',
          placement: 'top',
        });
      }
    } else {
      try {
        const response = await axiosInstance.post(
          `/product/${product.id}/add-image`,
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
          },
        );
        console.log('Image upload success: ', response);
        toast.show('Image uploaded', {
          type: 'success',
          placement: 'top',
        });
        const imageUrl = `${BASE_URL.replace(
          '/api',
          '',
        )}/storage/product_images/${response.data.product.image}`;
        setImage(imageUrl);
      } catch (error) {
        toast.show('Error uploading the image', {
          type: 'danger',
          placement: 'top',
        });
        console.log('Error uploading the image: ', error);
      }
    }
  };

  return (
    <SafeAreaView style={{flex: 1, marginBottom: 100}}>
      <Header
        title="PRODUCT DETAILS"
        backToScreen="Stock"
        routeParamsData={{branchId}}
      />
      <TouchableOpacity
        onPress={() =>
          handleNavigation('AddOrUpdateProduct', {
            product: productData,
            branchId,
          })
        }
        style={styles.iconEdit}>
        <IconMaterialIcons name={'create'} size={35} color="white" />
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.container}>
          <View style={styles.productNameContainer}>
            <Text
              style={styles.productNameText}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {product?.name}
            </Text>
            <Text style={[styles.productNameText, styles.productCodeText]}>
              # {product?.code}
            </Text>
          </View>
          <View style={styles.productDetailWrapper}>
            <View style={styles.produtDetailContainer}>
              <Text style={styles.descriptionText}>{product?.description}</Text>
            </View>

            <View style={[styles.productTableInfo, styles.tableHeader]}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Price</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>
                  ${product?.price}
                </Text>
              </View>
            </View>

            <View style={styles.productTableInfo}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Weight</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>0.5 kg</Text>
              </View>
            </View>

            <View style={styles.productTableInfo}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Avg. Rating</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>4.7/5</Text>
              </View>
            </View>

            <View style={styles.productTableInfo}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Monthly Sales</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>320 units</Text>
              </View>
            </View>

            <View style={styles.productTableInfo}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Profit Margin</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>35%</Text>
              </View>
            </View>

            <View style={styles.productTableInfo}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Return Rate</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>2%</Text>
              </View>
            </View>

            <View style={styles.productTableInfo}>
              <View style={styles.productInfoTitleContainer}>
                <Text style={styles.productInfoTitleText}>Lead Time</Text>
              </View>
              <View style={styles.productInfoValueContainer}>
                <Text style={styles.productInfoValueText}>7 days</Text>
              </View>
            </View>
            {image ? (
              <>
                <View style={styles.imageContainer}>
                  <Text style={styles.imageText}>Product image</Text>
                  <TouchableOpacity onPress={() => handleRemoveImage()}>
                    <Image source={{uri: image}} style={styles.imageStyle} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.addImageContainer}>
                <Text style={styles.imageText}>Add image</Text>
                <TouchableOpacity
                  onPress={() => handlenAddImage()}
                  style={styles.addImageButton}>
                  <MaterialCommunityIcon name="image-plus" size={35} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => confirmDeleteAlert()}>
            <View style={styles.deleteProductContainer}>
              <IconFontAwesome
                name="trash"
                size={20}
                style={styles.iconDelete}
              />
              <Text style={styles.deleteText}>Delete product</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  addImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addImageButton: {
    backgroundColor: '#60b565',
    padding: 10,
    borderRadius: 12,
  },
  productNameText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: 'white',
  },
  productCodeText: {
    fontSize: 25,
    color: '#003000',
  },
  productNameContainer: {
    position: 'relative',
    backgroundColor: '#297c2f',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  iconDelete: {
    color: 'red',
  },
  deleteProductContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f6b2b6',
    borderRadius: 10,
  },
  deleteText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
  },
  produtDetailContainer: {
    margin: 20,
  },
  productTableInfo: {
    flexDirection: 'row',
    backgroundColor: '#ebebebac',
    borderWidth: 0.2,
    gap: 100,
    marginHorizontal: 20,
  },
  tableHeader: {
    borderTopWidth: 0.6,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  productDetailWrapper: {
    flex: 1,
    backgroundColor: 'lightgray',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  productInfoValueText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  productInfoTitleContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  productInfoTitleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginLeft: 10,
  },
  productInfoValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  iconDeleteImage: {
    position: 'absolute',
    top: 20,
    left: -10,
    padding: 5,
    backgroundColor: 'pink',
    borderRadius: 8,
  },
  imageStyle: {
    height: 250,
    width: 330,
    borderRadius: 12,
  },
  imageText: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  iconEdit: {
    position: 'absolute',
    right: 30,
    top: 50,
    padding: 10,
    backgroundColor: '#60b565',
    borderRadius: 10,
  },
});
