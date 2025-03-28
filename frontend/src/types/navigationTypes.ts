import React from 'react';
import {NavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  UserDetails: undefined;
};

export type AppNavigationProp = NavigationProp<RootStackParamList>;
