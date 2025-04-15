import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type FloatingButtonProps = {
  iconName: string;
  size: number;
};

const FloatingButton: React.FC<FloatingButtonProps> = ({iconName, size}) => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View style={styles.editButtonContainer}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          navigation.navigate('Register');
        }}>
        <IconFontAwesome5 name={iconName} size={size} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingButton;

const styles = StyleSheet.create({
  editButtonContainer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 150,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  editButton: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'green',
  },
});
