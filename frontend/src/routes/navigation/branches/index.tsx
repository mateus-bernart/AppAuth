import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Branches from '../../../screens/Branches';
import BranchStock from '../../../screens/Branches/BranchStock';
import BranchStockProductDetails from '../../../screens/Branches/BranchStock/BranchStockProductDetails';
import AddProduct from '../../../screens/Branches/BranchStock/AddProduct';

const Stack = createNativeStackNavigator();

const BranchStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Branches" component={Branches} />
      <Stack.Screen name="BranchStock" component={BranchStock} />
      <Stack.Screen
        name="BranchStockProductDetails"
        component={BranchStockProductDetails}
      />
      <Stack.Screen name="AddProduct" component={AddProduct} />
    </Stack.Navigator>
  );
};

export default BranchStack;
