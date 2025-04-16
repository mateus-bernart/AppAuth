import {
  Image,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';

type HeaderProps = {
  title: string;
  iconLeft?: boolean;
  iconRightName?: string;
};

const Header: React.FC<HeaderProps> = ({
  title,
  iconLeft = true,
  iconRightName,
}) => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {iconLeft && (
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <IconFontAwesome5 name="chevron-left" size={30} />
          </TouchableOpacity>
        )}
      </View>
      {title.length > 15 ? (
        <View style={[styles.titleContainer, {flex: 1}]}>
          <Text style={[styles.textHeader, {fontSize: 12}]}>{title}</Text>
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={styles.textHeader}>{title}</Text>
        </View>
      )}

      {iconRightName ? (
        <View style={styles.iconRightContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <IconFontAwesome5 name={iconRightName} size={30} color="red" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sideContainer}></View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  textHeader: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginVertical: 10,
  },
  sideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconContainer: {
    flex: 1,
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
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
