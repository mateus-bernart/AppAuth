import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useRef} from 'react';
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

const AddProduct = ({route}) => {
  const branchId = route?.params?.branchId;
  const toast = useToast();
  const navigation = useNavigation<AppNavigationProp>();
  const db = useDatabase();

  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm();

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddProduct = async data => {
    try {
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

      await saveProductOffline(db, data, branchId);

      toast.show('Product added locally', {
        type: 'success',
        placement: 'top',
      });

      // const response = await axiosInstance.post(
      //   `/branch/${branchId}/product/create/`,
      //   {
      //     name: data.name,
      //     description: data.description,
      //     code: data.code,
      //     quantity: data.quantity,
      //     batch: data.batch,
      //     price: data.price,
      //     branchId: branchId,
      //   },
      // );

      navigation.goBack();
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
        console.log('Unexpected error structure:', e);
      }
    }
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
                rules={{required: 'Code is required'}}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <View style={[styles.registerContainerWrapper]}>
        <View style={styles.shadowContainer} />
        <Pressable
          onPress={handleSubmit(handleAddProduct)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <Animated.View
            style={[
              styles.registerContainer,
              {transform: [{translateX}, {translateY}]},
            ]}>
            <Text style={styles.buttonText}>Submit</Text>
            <IconFontAwesome name="check" size={30} color="white" />
          </Animated.View>
        </Pressable>
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
});
