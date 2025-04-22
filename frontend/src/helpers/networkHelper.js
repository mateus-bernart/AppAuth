import NetInfo from '@react-native-community/netinfo';
import {useEffect, useState} from 'react';

export const isOnline = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  } catch (error) {
    console.log('Error checking connection: ', e);
    return false;
  }
};
