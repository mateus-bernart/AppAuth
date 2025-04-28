import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../../../components/Header';
import CustomInput from '../../../../components/CustomInput';
import {useForm} from 'react-hook-form';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import axiosInstance from '../../../../services/api';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import {
  checkCodeAvailable,
  saveProductOffline,
} from '../../../../helpers/databaseHelpers/stockProduct';
import {useDatabase} from '../../../../providers/DatabaseProvider';
import {isOnline} from '../../../../helpers/networkHelper';
import SubmitButton from '../../../../components/SubmitButton';
import {Asset, launchImageLibrary, MediaType} from 'react-native-image-picker';
import {BASE_URL} from '../../../../services/config';

const AddProduct = ({route}) => {
  const branchId = route?.params?.branchId;
  const toast = useToast();
  const navigation = useNavigation<AppNavigationProp>();
  const db = useDatabase();
  const [image, setImage] = useState<Asset | undefined>(undefined);

  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm();

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

  const handleAddProduct = async data => {
    const online = await isOnline();

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

    if (!online) {
      await saveProductOffline(db, data, branchId);
    } else {
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

      try {
        const response = await axiosInstance.post(
          `/branch/${branchId}/product/create/`,
          formData,
          {headers: {'Content-Type': 'multipart/form-data'}},
        );

        console.log('Product response: ', response);
      } catch (e) {
        if (e.response && e.response.data && e.response.data.errors) {
          Object.keys(e.response.data.errors).map(key => {
            setError(key, {message: e.response.data.errors[key][0]});
          });
          toast.show("Coudn't add the product", {
            type: 'danger',
            placement: 'top',
          });
          console.log(e.response);
        } else {
          console.log('Unexpected error structure:', e.response);
        }
      }
    }

    toast.show('Product added', {
      type: 'success',
      placement: 'top',
    });

    navigation.goBack();
  };

  return (
    <>
      <SafeAreaView style={styles.body}>
        <Header title="ADD PRODUCT" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Product Name</Text>
              <CustomInput
                rules={{required: 'Name is required'}}
                control={control}
                name="name"
                placeholder="Enter product name"
                iconLeft="user"
                keyboardType="default"
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Description</Text>
              <CustomInput
                rules={{required: 'Description is required'}}
                control={control}
                name="description"
                placeholder="Enter product Description"
                iconLeft="file-alt"
                keyboardType="default"
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Code</Text>
              <CustomInput
                rules={{
                  required: 'Code is required',
                  maxLength: {
                    value: 6,
                    message: 'Code must contain 6 digits',
                  },
                }}
                control={control}
                name="code"
                placeholder="Enter product Code"
                iconLeft="hashtag"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Quantity</Text>
              <CustomInput
                rules={{required: 'Quantity is required'}}
                control={control}
                name="quantity"
                placeholder="Enter product Quantity"
                iconLeft="boxes"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Batch</Text>
              <CustomInput
                rules={{required: 'Batch is required'}}
                control={control}
                name="batch"
                placeholder="Enter product Batch"
                iconLeft="truck-moving"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Price</Text>
              <CustomInput
                rules={{required: 'Price is required'}}
                control={control}
                name="price"
                placeholder="Enter product Price"
                iconLeft="money-check-alt"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.containerInfo}>
              <Text style={styles.formTitle}>Image</Text>
              <TouchableOpacity
                onPress={() => {
                  pickImage();
                }}>
                <View style={styles.imageContainer}>
                  <IconFontAwesome name="image" size={25} />
                  {image ? (
                    <Text style={styles.imageTextPlaceholder}>
                      {image.fileName}
                    </Text>
                  ) : (
                    <Text style={styles.imageTextPlaceholder}>
                      Click to insert image
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <View style={[styles.registerContainerWrapper]}>
        <SubmitButton
          text={'Save'}
          height={25}
          textSize={20}
          onButtonPressed={handleSubmit(handleAddProduct)}
        />
      </View>
    </>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 20,
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
    flexDirection: 'row',
    gap: 20,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    padding: 15,
  },
  imageTextPlaceholder: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
});
