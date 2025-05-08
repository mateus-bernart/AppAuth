import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  deleteData,
  deleteProduct,
  showBranchStockData,
  syncProducts,
} from '../../helpers/databaseHelpers/stockProduct';
import {useDatabase} from '../../providers/DatabaseProvider';
import {useToast} from 'react-native-toast-notifications';
import {useAuth} from '../../providers/AuthProvider';
import {Product} from '../Branches/BranchStock';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';

const Sync = () => {
  const {db} = useDatabase();
  const [localData, setLocalData] = useState<Product[]>([]);
  const toast = useToast();
  const {session} = useAuth();

  const handleSync = async () => {
    try {
      const result = await syncProducts(db);

      if (result === 'no_changes') {
        toast.show('Nothing to synchronize', {
          type: 'info',
          placement: 'top',
        });
      } else {
        toast.show('Syncronized successfully', {
          type: 'success',
          placement: 'top',
        });
      }
      await handleShowData();
    } catch (error) {
      toast.show(error, {type: 'danger', placement: 'top'});
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
      console.log(result);

      setLocalData(result);
    } catch (error) {
      console.log(error);
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
          <Text style={styles.tableHeaderText}>Quantity</Text>
        </View>
        <View style={[styles.cell, {flex: 0.4}]}></View>
      </View>
      <FlatList
        style={styles.flatList}
        data={localData}
        renderItem={({item}) => {
          return (
            <View style={styles.localTableContainer}>
              <View style={styles.cell}>
                <Text style={styles.valueText}>{item.code}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText}>{item.name}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText}>{item.batch}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText}>{item.price}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.valueText}>{item.quantity}</Text>
              </View>
              <View style={[styles.cell, {flex: 0.4}]}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDeleteAlert(item.id)}>
                  <IconFontAwesome name="trash" size={25} color="red" />
                </TouchableOpacity>
              </View>
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
  },
  localTableContainer: {
    flexDirection: 'row',
    marginHorizontal: 5,
    marginVertical: 5,
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
    paddingVertical: 8,
    flexDirection: 'row',
    backgroundColor: 'lightgray',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
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
  deleteButton: {
    backgroundColor: 'pink',
    borderRadius: 8,
  },
});
