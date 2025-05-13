import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Branches from '../../../screens/Branches';
import Stock from '../../../screens/Branches/Stock';
import ProductDetails from '../../../screens/Branches/Stock/ProductDetails';
import AddOrUpdateProduct from '../../../screens/Branches/Stock/AddOrUpdateProduct';

const Stack = createNativeStackNavigator();

const BranchStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Branches">
      <Stack.Screen name="Branches" component={Branches} />
      <Stack.Screen name="Stock" component={Stock} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="AddOrUpdateProduct" component={AddOrUpdateProduct} />
    </Stack.Navigator>
  );
};

export default BranchStack;
