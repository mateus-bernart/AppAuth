import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  changeProductCodeOffline,
  deleteData,
  deleteProduct,
  showBranchStockData,
  syncProducts,
} from '../../helpers/databaseHelpers/stockProduct';
import {useDatabase} from '../../providers/DatabaseProvider';
import {useToast} from 'react-native-toast-notifications';
import {useAuth} from '../../providers/AuthProvider';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useFocusEffect} from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import {useForm} from 'react-hook-form';
import {isOnline} from '../../helpers/networkHelper';

type StockWithProduct = {
  stock_id: number;
  product_id: number;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
  batch: string;
  branch_id: number;
  error_message?: string;
  sync_error?: string;
  created_at: string;
  updated_at: string;
  products_synced: number;
  stocks_synced: number;
};

const Sync = () => {
  const {db} = useDatabase();
  const [localData, setLocalData] = useState<StockWithProduct[]>([]);
  const toast = useToast();
  const {session} = useAuth();
  const [modalCameraVisible, setModalCameraVisible] = useState(false);
  const [productId, setProductId] = useState<number>();
  const [error, setError] = useState<any[]>([]);
  const {control, handleSubmit, reset} = useForm({
    defaultValues: {
      code: '',
    },
  });

  const handleSync = async () => {
    const online = await isOnline();

    if (!online) {
      toast.show("Couldn't connect with internet, check wi-fi.", {
        type: 'warning',
        placement: 'top',
      });
    } else {
      try {
        const result = await syncProducts(db);

        if (result === 'no_changes') {
          toast.show('Nothing to synchronize', {
            type: 'info',
            placement: 'top',
          });
        } else if (Array.isArray(result)) {
          console.log('sync result: ', result);

          const errorMessage = result
            .map(item => item.error_message)
            .filter(Boolean);
          setError(errorMessage);

          toast.show('Synchronized with errors', {
            type: 'warning',
            placement: 'top',
          });
        } else {
          toast.show('Synchronized successfully', {
            type: 'success',
            placement: 'top',
          });
          setError([]);
        }

        await handleShowData();
      } catch (error) {
        console.log('❌ Sync failed:', error);
        toast.show(error, {type: 'danger', placement: 'top'});
      }
    }
  };

  const handleDeleteData = async () => {
    try {
      const result = await deleteData(db);
      if (result.rowsAffected === 0) {
        toast.show('No data to delete', {type: 'info', placement: 'top'});
      } else {
        toast.show('Data Deleted', {type: 'success', placement: 'top'});
      }
    } catch (error) {
      console.log(error);
      toast.show('Error', {type: 'danger', placement: 'top'});
    }
  };

  const handleShowData = async () => {
    try {
      const result = await showBranchStockData(db);
      setLocalData(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeProductCode = async data => {
    try {
      await changeProductCodeOffline(db, productId, data.code);
      console.log('Product code saved:', data);
      toast.show('Product code saved.', {
        type: 'success',
        placement: 'top',
      });
      setModalCameraVisible(false);
      await handleShowData();
    } catch (error) {
      console.log(error);
      toast.show('Error saving product', {type: 'danger', placement: 'top'});
    }
  };

  const confirmDeleteAlert = productId =>
    Alert.alert('Delete user?', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: () => handleDeleteProduct(productId)},
    ]);

  const handleDeleteProduct = async productId => {
    try {
      await deleteProduct(db, productId);
      await handleShowData();
      toast.show('Product deleted', {type: 'success', placement: 'top'});
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleShowData();
    }, []),
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <Modal
        transparent={true}
        visible={modalCameraVisible}
        onRequestClose={() => setModalCameraVisible(!modalCameraVisible)}>
        <TouchableWithoutFeedback onPress={() => setModalCameraVisible(false)}>
          <View style={styles.modalView}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Enter new code</Text>
              <View style={styles.buttonModalContainer}>
                <CustomInput
                  control={control}
                  name="code"
                  placeholder="Ex: 123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  rules={{
                    required: 'Code is required',
                    maxLength: {
                      value: 6,
                      message: 'Code must contain exactly 6 digits',
                    },
                    minLength: {
                      value: 6,
                      message: 'Code must contain exactly 6 digits',
                    },
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Code must be a 6-digit number',
                    },
                  }}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit(handleChangeProductCode)}>
                  <Text style={styles.textButtonModal}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => handleSync()}>
          <Text style={styles.textButton}>Synchronize</Text>
        </TouchableOpacity>
        {session?.userType === 'regional_manager' ||
        session?.userType === 'manager' ? (
          <>
            <TouchableOpacity
              style={[styles.buttonStyle, styles.buttonDeleteData]}
              onPress={() => handleDeleteData()}>
              <Text style={styles.textButton}>Delete Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonStyle, styles.buttonShowData]}
              onPress={() => handleShowData()}>
              <Text style={styles.textButton}>Show Products</Text>
            </TouchableOpacity>
          </>
        ) : (
          <></>
        )}
      </View>
      {error.length > 0 && (
        <View style={styles.errorMessageContainer}>
          {error.map((msg, i) => (
            <Text key={i} style={styles.errorMessage}>
              {msg}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Pending products to synchronize</Text>
      </View>
      <View style={styles.tableHeaderContainer}>
        <View style={styles.cell}>
          <Text style={styles.tableHeaderText}>Code</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.tableHeaderText}>Name</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.tableHeaderText}>Batch</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.tableHeaderText}>Price</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.tableHeaderText}>Qty</Text>
        </View>
        <View style={[styles.cell, {flex: 1}]}>
          <Text style={styles.tableHeaderText}>Actions</Text>
        </View>
      </View>
      <FlatList
        style={styles.flatList}
        data={localData}
        scrollEnabled
        renderItem={({item}) => {
          return (
            <View style={[styles.localTableContainer]}>
              {item.sync_error ? (
                <TouchableOpacity
                  onPress={() => {
                    reset({code: item.code});
                    setModalCameraVisible(true);
                    setProductId(item.product_id);
                  }}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: item.sync_error ? '#fff388' : '',
                      flexDirection: 'row',
                      gap: 5,
                    },
                  ]}>
                  <IconFontAwesome name="exclamation" size={20} color="red" />
                  <Text
                    style={[styles.valueText, {fontFamily: 'Poppins-Bold'}]}>
                    {item.code}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.cell}>
                  <Text style={styles.valueText} ellipsizeMode="tail">
                    {item.code}
                  </Text>
                </View>
              )}
              <View style={styles.cell}>
                <Text style={styles.valueText} ellipsizeMode="tail">
                  {item.name}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText} ellipsizeMode="tail">
                  {item.batch}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText} ellipsizeMode="tail">
                  {item.price}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText} ellipsizeMode="tail">
                  {item.quantity}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cell}
                onPress={() => confirmDeleteAlert(item.product_id)}>
                <IconFontAwesome name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Sync;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    flex: 1,
    marginBottom: 100,
  },
  errorMessage: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  errorMessageContainer: {
    margin: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'pink',
  },
  modalView: {
    marginHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  buttonModalContainer: {
    marginTop: 10,
  },
  button: {
    color: 'green',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'green',
    marginTop: 10,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  localTableContainer: {
    flexDirection: 'row',
  },
  actionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  valueText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    backgroundColor: 'lightgray',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    padding: 10,
    paddingHorizontal: 30,
    backgroundColor: '#60b565',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDeleteData: {
    backgroundColor: '#ea4f3d',
  },
  buttonShowData: {
    backgroundColor: '#a4d8e7',
  },
  textButton: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: 'black',
  },
  textButtonModal: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: 'white',
  },
});
