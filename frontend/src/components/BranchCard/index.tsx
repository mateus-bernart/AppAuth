import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';

type BranchCardProps = {
  item: {
    id: number;
    code: string;
    description: string;
  };
};

const BranchCard = ({item}: BranchCardProps) => {
  const navigation = useNavigation<AppNavigationProp>();

  const handleNavigation = (screens, params = {}) => {
    navigation.navigate(screens, params);
  };

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        handleNavigation('BranchStock', {branchId: item?.id});
      }}>
      <View style={styles.itemBand} />
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
        <Text style={styles.itemDetails} numberOfLines={1} ellipsizeMode="tail">
          # {item.code}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BranchCard;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  itemBand: {
    backgroundColor: '#328d38',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    flex: 1,
  },
  itemDetailsContainer: {
    flex: 16,
    padding: 14,
  },
  itemName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },

  itemDetails: {
    fontSize: 16,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
});
