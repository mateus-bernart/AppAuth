import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {syncProducts} from '../../helpers/databaseHelpers/stockProduct';
import {useDatabase} from '../../providers/DatabaseProvider';
import {useToast} from 'react-native-toast-notifications';

const Sync = () => {
  const [isSyncronized, setIsSyncronized] = useState(false);
  const db = useDatabase();
  const toast = useToast();

  const handleSync = async () => {
    try {
      await syncProducts(db);
      toast.show('Syncronized', {type: 'success', placement: 'top'});
    } catch (error) {
      console.log(error);
      toast.show('Error', {type: 'danger', placement: 'top'});
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => handleSync()}>
          <Text style={styles.textButton}>Sync</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Sync;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    padding: 10,
    paddingHorizontal: 30,
    backgroundColor: 'green',
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
  textButton: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: 'white',
  },
  buttonTextSyncronized: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  buttonTextContainer: {
    marginVertical: 20,
  },
});
