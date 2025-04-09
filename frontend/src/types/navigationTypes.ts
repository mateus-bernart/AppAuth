import React from 'react';
import {NavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  UserDetails: undefined;
  VerifyEmail: undefined;
  SendRecoverPassword: undefined;
  VerifyRecoverPassword: undefined;
  UserManagement: undefined;
};

export type AppNavigationProp = NavigationProp<RootStackParamList>;
