import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import VerifyEmail from '../screens/Register/VerifyEmail';
import RecoverPassword from '../screens/RecoverPassword/SendRecoverPassword';
import SendRecoverPassword from '../screens/RecoverPassword/SendRecoverPassword';
import VerifyRecoverPassword from '../screens/RecoverPassword/VerifyRecoverPassword';

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
