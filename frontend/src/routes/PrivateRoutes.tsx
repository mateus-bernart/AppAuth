import React, {useEffect, useRef, useState} from 'react';
import Register from '../screens/Auth/Register';
import UserDetails from '../screens/User/UserDetails';
import UserManagement from '../screens/User/UserManagement';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {Animated, Image, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-gesture-handler';
import Branches from '../screens/Branches';
import BranchStack from './navigation/branches';
import UserStack from './navigation/users';
import Sync from '../screens/Sync';
import {useAuth} from '../providers/AuthProvider';
import {useDatabase} from '../providers/DatabaseProvider';
import {useStock} from '../providers/StockProvider';
import Badge from '../components/Badge';

const Tab = createBottomTabNavigator();

const PrivateRouteTabs = () => {
  const {session} = useAuth();
  const {unsyncedCount} = useStock();

  return (
    <Tab.Navigator
      initialRouteName="BranchStack"
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#307244',
        animation: 'shift',
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 60,
          marginHorizontal: 10,
          elevation: 8,
          backgroundColor: '#1b3f26',
          borderRadius: 10,
          height: 80,
        },
        tabBarItemStyle: {
          height: 90,
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
        name="BranchStack"
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

      {session?.userType === 'manager' ||
      session?.userType === 'regional_manager' ? (
        <Tab.Screen
          name="Manage Users"
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
      ) : (
        <></>
      )}

      <Tab.Screen
        name="Sync"
        component={Sync}
        options={{
          tabBarIcon: ({color}) => (
            <View style={styles.container}>
              <IconFontAwesome name="sync" size={25} color={color} />
              <Text style={styles.textContainer}>Sync</Text>
              {unsyncedCount > 0 && <Badge count={unsyncedCount} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: 'white',
  },
});

export default PrivateRouteTabs;
