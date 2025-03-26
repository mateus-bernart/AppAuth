import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ToastProvider} from 'react-native-toast-notifications';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import AuthProvider from './providers/AuthProvider';
import Routes from './routes/Routes';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider
        successColor="#5cb85c"
        dangerColor="#ed4337"
        offsetTop={60}
        textStyle={{fontSize: 18}}
        dangerIcon={<IconEntypo name="warning" size={30} />}
        successIcon={<IconFontAwesome name="check" size={30} color="white" />}>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
