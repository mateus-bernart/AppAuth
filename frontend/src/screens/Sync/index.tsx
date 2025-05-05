import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  deleteData,
  showData,
  syncProducts,
} from '../../helpers/databaseHelpers/stockProduct';
import {useDatabase} from '../../providers/DatabaseProvider';
import {useToast} from 'react-native-toast-notifications';
import {useAuth} from '../../providers/AuthProvider';

const Sync = () => {
  const db = useDatabase();
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

      console.log(result);
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
      const result = await showData(db);
      console.log(result);

      if (result.length === 0) {
        toast.show('No items', {type: 'info', placement: 'top'});
      }
    } catch (error) {
      console.log(error);
    }
  };

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
  buttonTextSyncronized: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  buttonTextContainer: {
    marginVertical: 20,
  },
});
