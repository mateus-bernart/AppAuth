import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Product} from '..';
import axiosInstance from '../../../../services/api';
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';

const BranchStockProductDetails = () => {
  const toast = useToast();

  const route = useRoute();
  const {product} = route.params as {product?: Product};
  const navigation = useNavigation<AppNavigationProp>();

  const confirmDeleteAlert = id =>
    Alert.alert('Are you sure?', 'Delete user?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: () => deleteProduct(id)},
    ]);

  const deleteProduct = id => {
    axiosInstance
      .delete(`/user/delete/${id}`)
      .then(() => fetchProducts())
      .catch(e => {
        toast.show(e, {
          type: 'danger',
          placement: 'top',
        });
      });
  };

  const fetchProducts = () => {
    const response = axiosInstance.get('/products/');
  };

  return (
    <SafeAreaView style={{flex: 1, marginBottom: 100}}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <IconFontAwesome name="chevron-left" size={30} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.productNameContainer}>
          <Text style={styles.productNameText}>{product?.name}</Text>
          <View style={styles.codeContainer}>
            <Text style={[styles.productNameText, styles.productCodeText]}>
              # {product?.code}
            </Text>
          </View>
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
              <Text style={styles.productInfoValueText}>{product?.price}</Text>
            </View>
          </View>
          <View style={styles.productTableInfo}>
            <View style={styles.productInfoTitleContainer}>
              <Text style={styles.productInfoTitleText}>Other info</Text>
            </View>
            <View style={styles.productInfoValueContainer}>
              <Text style={styles.productInfoValueText}>value here</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BranchStockProductDetails;

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
  productNameText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: 'white',
  },
  productCodeText: {
    fontSize: 25,
    color: '#003000',
  },
  codeContainer: {},
  productNameContainer: {
    backgroundColor: '#118f00',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  produtDetailContainer: {
    margin: 20,
  },
  productTableInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ebebebac',
    borderWidth: 0.1,
    gap: 100,
    marginHorizontal: 20,
  },
  tableHeader: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  productDetailWrapper: {
    flex: 1,
    backgroundColor: 'lightgray',
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'justify',
  },
  productInfoValueText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  productInfoTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  productInfoTitleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  productInfoValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
