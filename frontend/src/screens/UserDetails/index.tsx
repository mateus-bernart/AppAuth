import {StyleSheet} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import UserDetailsComponent from '../../component/UserDetails';

const UserDetails = () => {
  return (
    <SafeAreaView style={styles.container}>
      <UserDetailsComponent />
    </SafeAreaView>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
