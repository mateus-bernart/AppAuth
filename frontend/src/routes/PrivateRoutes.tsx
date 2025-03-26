import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Register from '../screens/Register';
import UserDetails from '../screens/UserDetails';

const AuthStack = createNativeStackNavigator();

const PrivateRoutes = () => {
  return (
    <AuthStack.Navigator initialRouteName="Home">
      <AuthStack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="UserDetails"
        component={UserDetails}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
};

export default PrivateRoutes;
