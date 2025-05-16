import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../../../components/Header';
import CustomInput from '../../../../components/CustomInput';
import {useForm} from 'react-hook-form';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import axiosInstance from '../../../../services/api';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import {
  checkCodeAvailable,
  getStockProduct,
  saveProductOffline,
} from '../../../../helpers/databaseHelpers/stockProduct';
import {useDatabase} from '../../../../providers/DatabaseProvider';
import {isOnline} from '../../../../helpers/networkHelper';
import SubmitButton from '../../../../components/SubmitButton';
import {Asset, launchImageLibrary, MediaType} from 'react-native-image-picker';
import {useStock} from '../../../../providers/StockProvider';

type ProductFormData = {
  id?: number;
  product_id: number;
  name: string;
  description: string;
  code: string;
  price: number;
  batch: string;
  quantity: string;
  image: string | null;
  sync_error: string;
  error_message: string;
};

const AddOrUpdateProduct = () => {
  const route = useRoute();
  const {product, branchId} = route.params as {
    product?: ProductFormData;
    branchId?: number;
    productId?: number;
  };

  const toast = useToast();
  const navigation = useNavigation<AppNavigationProp>();
  const {db} = useDatabase();
  const [image, setImage] = useState<Asset | undefined>(undefined);
  const [offlineProductId, setOfflineProductId] = useState();
  const {refreshStockCount} = useStock();
  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
    reset,
  } = useForm<ProductFormData>({
    defaultValues: {
      quantity: product?.quantity,
      name: product?.name,
      batch: product?.batch,
      description: product?.description,
      code: product?.code,
      price: product?.price,
    },
  });

  const fetchStockDetails = async productId => {
    try {
      const response = await axiosInstance.get(`products/${productId}/stocks`);
      return response.data.stock;
    } catch (error) {
      toast.show(
        "Couldn't fetch data. Check your Wi-Fi or internet connection.",
        {
          type: 'danger',
          placement: 'top',
        },
      );
      console.error('Error fetching stock details:', error);
    }
  };

  useEffect(() => {
    if (product) {
      const fetchAndSetStockInfo = async () => {
        const online = await isOnline();

        let stockInfo;
        if (!online) {
          stockInfo = await getStockProduct(db, offlineProductId);
        } else {
          stockInfo = await fetchStockDetails(product.id);
        }

        reset({
          name: product?.name,
          price: product?.price,
          description: product?.description,
          batch: stockInfo?.batch.toString() ?? '',
          code: product?.code,
          quantity: stockInfo?.quantity.toString() ?? '',
        });
      };

      fetchAndSetStockInfo();
    }
  }, [product]);

  const handleNavigation = (screen, value) => {
    navigation.navigate(screen, value);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
    });

    if (result.didCancel) {
      console.log('User cancelled camera');
    } else if (result.errorCode) {
      console.log('Camera Error: ', result.errorMessage);
    } else {
      setImage(result.assets?.[0]);
    }
  };

  const formDataToObject = (formData: FormData) => {
    const obj: {[key: string]: any} = {};

    formData.getParts().forEach(part => {
      if ('fieldName' in part) {
        if (typeof part.fieldName === 'string') {
          obj[part.fieldName] = 'string' in part ? part.string : part.uri;
        }
      }
    });

    return obj;
  };

  const handleAddOrUpdateProduct = async data => {
    const online = await isOnline();

    if (!product) {
      const result = await checkCodeAvailable(db, data.code);
      if (result.exists) {
        setError('code', {
          type: 'manual',
          message:
            result.source === 'local'
              ? 'This product code is already in your device.'
              : 'This code is already in the database.',
        });
        return;
      }
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (image) {
      formData.append('image', {
        uri: image?.uri,
        type: image.type,
        name: image.fileName,
      });
    }

    if (!online) {
      const offlineProduct = formDataToObject(formData);

      const isEditing = product?.id != null;
      if (isEditing) {
        offlineProduct.product_id = product.product_id ?? product.id;
        offlineProduct.id = product.id;
      }

      const productId = await saveProductOffline(db, offlineProduct, branchId);

      offlineProduct.id = productId;

      setOfflineProductId(productId);
      refreshStockCount();
      handleNavigation('ProductDetails', {
        product: {...offlineProduct, id: productId},
        branchId: branchId,
      });
    } else {
      try {
        const response = await axiosInstance({
          url: product
            ? `/branches/${branchId}/products/${product.id}/`
            : `/branches/${branchId}/products/`,
          method: 'post',
          data: formData,
          headers: {'Content-Type': 'multipart/form-data'},
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        handleNavigation('ProductDetails', {
          product: response.data.product,
          branchId: branchId,
        });
      } catch (e) {
        if (e.response && e.response.data && e.response.data.errors) {
          Object.keys(e.response.data.errors).map(key => {
            setError(key as keyof ProductFormData, {
              message: e.response.data.errors[key][0],
            });
          });
          toast.show(
            product
              ? "Couldn't update the product"
              : "Couldn't add the product",
            {
              type: 'danger',
              placement: 'top',
            },
          );
          console.log(e.response);
        } else {
          console.log('Unexpected error structure:', e.response);
        }
      }
    }

    toast.show(product ? 'Product updated' : 'Product added', {
      type: 'success',
      placement: 'top',
    });
  };

  return (
    <>
      <SafeAreaView style={styles.body}>
        <Header title={!product ? 'ADD PRODUCT' : 'UPDATE PRODUCT'} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{marginHorizontal: 20}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Product Name</Text>
              <CustomInput
                control={control}
                name="name"
                placeholder={
                  product
                    ? `Last value: "${product.name}"`
                    : 'Enter product name'
                }
                iconLeft="user"
                keyboardType="default"
                rules={{required: 'Name is required'}}
                defaultValue={product?.name}
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Description</Text>
              <CustomInput
                rules={{required: product ? false : 'Description is required'}}
                control={control}
                name="description"
                placeholder="Enter product description"
                iconLeft="file-alt"
                keyboardType="default"
                defaultValue={product?.description}
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Code</Text>
              <CustomInput
                rules={{
                  required: product ? false : 'Code is required',
                  validate: (value: string) => {
                    if (!/^\d{6}$/.test(value)) {
                      return 'Code must be a 6-digit number';
                    }
                    return true;
                  },
                }}
                control={control}
                name="code"
                placeholder={
                  product
                    ? `Last value: "${product.code}"`
                    : 'Enter product code'
                }
                iconLeft="hashtag"
                keyboardType="number-pad"
                maxLength={6}
                defaultValue={product?.code}
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Quantity</Text>
              <CustomInput
                rules={{required: product ? false : 'Quantity is required'}}
                control={control}
                name="quantity"
                placeholder={
                  product
                    ? `Last value: "${product.quantity}"`
                    : 'Enter product quantity'
                }
                iconLeft="boxes"
                keyboardType="number-pad"
                maxLength={6}
                defaultValue={product?.quantity}
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Batch</Text>
              <CustomInput
                rules={{required: product ? false : 'Batch is required'}}
                control={control}
                name="batch"
                placeholder={
                  product
                    ? `Last value: "${product.batch}"`
                    : 'Enter product batch'
                }
                iconLeft="truck-moving"
                keyboardType="number-pad"
                maxLength={6}
                defaultValue={product?.batch}
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Price</Text>
              <CustomInput
                rules={{
                  required: product ? false : 'Price is required',
                  maxLength: {
                    value: 6,
                    message: 'Price max digits is 6',
                  },
                }}
                control={control}
                name="price"
                placeholder={
                  product
                    ? `Last value: "${product.price}"`
                    : 'Enter product price'
                }
                iconLeft="money-check-alt"
                keyboardType="decimal-pad"
                maxLength={6}
                defaultValue={product?.price}
              />
            </View>
            <View style={styles.containerInfo}>
              {!product?.image && (
                <>
                  <Text style={styles.formTitle}>Image</Text>
                  <TouchableOpacity
                    onPress={() => {
                      pickImage();
                    }}>
                    <View style={styles.imageContainer}>
                      {image ? (
                        <>
                          <Text style={styles.imageTextPlaceholder}>
                            {image.fileName}
                          </Text>
                          <Image
                            source={{uri: image.uri}}
                            style={{height: 200, width: 300, borderRadius: 10}}
                          />
                        </>
                      ) : (
                        <>
                          <IconFontAwesome name="image" size={25} />
                          <Text style={styles.imageTextPlaceholder}>
                            Click to insert image
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <View style={[styles.registerContainerWrapper]}>
        <SubmitButton
          text={'Save'}
          height={25}
          textSize={20}
          onButtonPressed={handleSubmit(handleAddOrUpdateProduct)}
        />
      </View>
    </>
  );
};

export default AddOrUpdateProduct;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginBottom: 15,
  },
  containerInfo: {
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  shadowContainer: {
    backgroundColor: '#084700',
    position: 'absolute',
    left: 15,
    top: 25,
    width: '100%',
    borderRadius: 8,
    padding: 27,
  },
  registerContainerWrapper: {
    position: 'relative',
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: 'lightgray',
    height: 240,
  },
  registerContainer: {
    backgroundColor: 'green',
    flexDirection: 'row',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 16,
    alignItems: 'center',
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  imageContainer: {
    gap: 10,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  imageContainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  imageField: {
    alignItems: 'center',
  },
  imageTextPlaceholder: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'gray',
  },
});
