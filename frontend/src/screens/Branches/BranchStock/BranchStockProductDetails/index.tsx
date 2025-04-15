import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Product} from '..';
import axiosInstance from '../../../../services/api';
import {useToast} from 'react-native-toast-notifications';
import {AppNavigationProp} from '../../../../types/navigationTypes';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import Header from '../../../../components/Header';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BranchStockProductDetails = () => {
  const toast = useToast();

  const route = useRoute();
  const {product} = route.params as {product?: Product};
  const navigation = useNavigation<AppNavigationProp>();

  const confirmDeleteAlert = () =>
    Alert.alert('Delete Product?', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: () => deleteProduct()},
    ]);

  const deleteProduct = () => {
    axiosInstance
      .delete(`/product/delete/${product?.id}`)
      .then(response => {
        toast.show(response.data, {
          type: 'success',
          placement: 'top',
        });
        navigation.goBack();
      })
      .catch(e => {
        console.log(e.response);
        toast.show(e.response, {
          type: 'danger',
          placement: 'top',
        });
      });
  };

  return (
    <SafeAreaView style={{flex: 1, marginBottom: 100}}>
      <Header title="PRODUCT DETAILS" />

      <TouchableOpacity
        onPress={() => confirmDeleteAlert()}
        style={styles.iconLogout}>
        <IconFontAwesome name="trash" size={30} color="red" />
      </TouchableOpacity>

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
    marginTop: 25,
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
  iconLogout: {
    position: 'absolute',
    right: 30,
    top: 50,
    color: 'red',
    backgroundColor: 'pink',
    padding: 10,
    borderRadius: 8,
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
});
