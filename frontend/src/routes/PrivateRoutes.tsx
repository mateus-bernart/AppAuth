import React from 'react';
import Register from '../screens/Auth/Register';
import UserDetails from '../screens/User/UserDetails';
import UserManagement from '../screens/User/UserManagement';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {Image, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-gesture-handler';
import Branches from '../screens/Branch/Branches';
import BranchStack from './navigation/branches';
import UserStack from './navigation/users';

const Tab = createBottomTabNavigator();

const PrivateRouteTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Branches"
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#035e00',
        animation: 'fade',
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 55,
          marginHorizontal: 10,
          elevation: 8,
          backgroundColor: '#0e7a00',
          borderRadius: 14,
          height: 80,
        },
        tabBarItemStyle: {
          height: 80,
        },
        tabBarIconStyle: {
          width: '100%',
          flex: 1,
        },
      }}>
      <Tab.Screen
        name="Profile"
        component={UserDetails}
        options={{
          tabBarIcon: ({color}) => (
            <View style={styles.container}>
              <IconFontAwesome name="user-alt" size={25} color={color} />
              <Text style={styles.textContainer}>Profile</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Branches"
        component={BranchStack}
        options={{
          tabBarIcon: ({color}) => (
            <View style={styles.container}>
              <IconFontAwesome name="home" size={25} color={color} />
              <Text style={styles.textContainer}>Branches</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Manage"
        component={UserStack}
        options={{
          tabBarIcon: ({color}) => (
            <View style={styles.container}>
              <IconFontAwesome name="file-alt" size={25} color={color} />
              <Text style={styles.textContainer}>Users</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Register"
        component={Register}
        options={{
          tabBarIcon: ({color}) => (
            <View style={styles.container}>
              <IconFontAwesome name="user-plus" size={25} color={color} />
              <Text style={styles.textContainer}>Register</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const styles = StyleSheet.create({
  container: {
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    marginTop: 4,
  },
});

export default PrivateRouteTabs;
