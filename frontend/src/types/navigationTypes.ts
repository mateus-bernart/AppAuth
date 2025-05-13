import React from 'react';
import {NavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Branches: undefined;
  UserDetails: undefined;
  VerifyEmail: undefined;
  SendRecoverPassword: undefined;
  VerifyRecoverPassword: undefined;
  UserManagement: undefined;
  ProductDetails: undefined;
  Stock: undefined;
  AddOrUpdateProduct: undefined;
};

export type AppNavigationProp = NavigationProp<RootStackParamList>;
