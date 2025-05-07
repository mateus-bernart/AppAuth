import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

type EditButtonProps = {
  onPress: (data?) => void;
  iconName: string;
  size: number;
  color: string;
  style?: object;
};

const EditButton = ({
  onPress,
  iconName,
  size,
  color,
  style,
}: EditButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.iconEdit, style]}>
      <IconMaterialIcons name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

export default EditButton;

const styles = StyleSheet.create({
  iconEdit: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#47b64c',
    right: 30,
    borderRadius: 10,
  },
});
