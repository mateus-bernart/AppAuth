import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Branches from '../../../screens/Branch/Branches';
import BranchStock from '../../../screens/Branch/BranchStock';

const Stack = createNativeStackNavigator();

const BranchStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Branches" component={Branches} />
      <Stack.Screen name="BranchStock" component={BranchStock} />
    </Stack.Navigator>
  );
};

export default BranchStack;
