import {
  Image,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';

const Header = () => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View style={styles.container}>
      {/* <Image source={userImage}></Image> */}
      <TouchableOpacity onPress={() => navigation.navigate('UserDetails')}>
        <IconFontAwesome name="user-alt" size={30} style={styles.iconProfile} />
      </TouchableOpacity>
      <Text style={styles.textHeader}>CONTROLE DE USUÁRIOS</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <IconFontAwesome
          name="user-plus"
          size={30}
          style={styles.iconAddUser}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  textHeader: {
    fontFamily: 'Poppins-Medium',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'White',
    padding: 20,
  },
  iconProfile: {
    backgroundColor: '#3467d3',
    padding: 10,
    borderRadius: 10,
    color: 'white',
  },
  iconAddUser: {
    backgroundColor: '#1aa325',
    padding: 10,
    borderRadius: 10,
    color: 'white',
  },
});
