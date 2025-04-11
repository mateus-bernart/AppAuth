import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserDetails from '../../../screens/User/UserDetails';
import UserManagement from '../../../screens/User/UserManagement';
import Register from '../../../screens/Auth/Register';

const UserStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="UserManagement">
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};

export default UserStack;
