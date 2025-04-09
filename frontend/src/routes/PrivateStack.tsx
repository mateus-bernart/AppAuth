import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserDetails from '../screens/User/UserDetails';
import UserManagement from '../screens/User/UserManagement';
import PrivateRouteTabs from './PrivateRouteTab';

const Stack = createNativeStackNavigator();

const PrivateStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={PrivateRouteTabs} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
    </Stack.Navigator>
  );
};

export default PrivateStack;
