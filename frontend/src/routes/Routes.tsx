import {ActivityIndicator, View} from 'react-native';
import React from 'react';
import {useAuth} from '../providers/AuthProvider';
import PublicRoutes from './PublicRoutes';
import PrivateRouteTabs from './PrivateRoutes';

const Routes = () => {
  const {session, isLoading} = useAuth();

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return session?.isLogged ? <PrivateRouteTabs /> : <PublicRoutes />;
};

export default Routes;
