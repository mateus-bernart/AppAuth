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

const Header = ({title}) => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}>
        <IconFontAwesome name="chevron-left" size={30} />
      </TouchableOpacity>
      <Text style={styles.textHeader}>{title}</Text>
      <View></View>
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
    marginHorizontal: 30,
    marginVertical: 10,
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
