import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserDetails from '../../../screens/User/UserDetails';
import UserManagement from '../../../screens/User/UserManagement';

const UserStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="UserManagement">
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
    </Stack.Navigator>
  );
};

export default UserStack;
