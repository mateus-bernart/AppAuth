import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Header from '../../component/Header';
import {SafeAreaView} from 'react-native-safe-area-context';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';

const Home = () => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <SafeAreaView>
      <Text>Home</Text>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    marginHorizontal: 30,
    marginVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
