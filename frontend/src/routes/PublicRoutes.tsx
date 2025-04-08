import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import VerifyEmail from '../screens/Auth/Register/VerifyEmail';
import VerifyRecoverPassword from '../screens/Auth/RecoverPassword/VerifyRecoverPassword';
import SendRecoverPassword from '../screens/Auth/RecoverPassword/SendRecoverPassword';

const AuthStack = createNativeStackNavigator();

const PublicRoutes = () => {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="VerifyEmail"
        component={VerifyEmail}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="VerifyRecoverPassword"
        component={VerifyRecoverPassword}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="SendRecoverPassword"
        component={SendRecoverPassword}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
};

export default PublicRoutes;
