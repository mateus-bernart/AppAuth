import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {User} from '../../screens/User/UserManagement';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

type UserCardProps = {
  item: User;
  onPress: () => void;
};

const UserCard = ({onPress, item}: UserCardProps) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      {item.image ? (
        <Image
          source={{
            uri: `${BASE_URL}/storage/profile_images/${item.image}`,
          }}
          style={styles.profilePicture}
        />
      ) : (
        <IconFontAwesome name="user-alt" size={70} />
      )}
      <View style={styles.itemDetailsContainer}>
        <View
          style={[styles.itemDetailsInfoContainer, {alignItems: 'flex-start'}]}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text
            style={styles.itemDetails}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.email}
          </Text>
        </View>

        <View style={[styles.itemDetailsInfoContainer]}>
          <Text
            style={[
              styles.itemName,
              {
                color:
                  item.user_type === 'regional_manager' ? '#ffffff' : '#1b3f26',
              },
              {
                padding: 7,
                backgroundColor:
                  item.user_type === 'regional_manager' ? '#ea4f3d' : '#5df187',
                borderRadius: 10,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.user_type === 'regional_manager'
              ? 'Regional Manager'
              : 'Employee'}
          </Text>
          <Text
            style={[
              styles.itemName,
              {
                color: '#504100',
              },
              {
                padding: 10,
                backgroundColor: '#ffe282',
                borderRadius: 10,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.user_branch}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    padding: 10,
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
  profilePicture: {
    height: 80,
    width: 70,
    borderRadius: 10,
  },
  itemDetailsContainer: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemDetailsInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
    flexShrink: 1,
  },
  itemName: {
    fontFamily: 'Poppins-Bold',
  },
  itemDetails: {
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
});
