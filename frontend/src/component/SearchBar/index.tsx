import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomInput from '../CustomInput';

type SearchBarProps = {
  control: any;
};

const SearchBar = ({control}) => {
  return (
    <View style={styles.searchUserContainer}>
      <View style={styles.searchUser}>
        <CustomInput
          control={control}
          name="term"
          placeholder="Search by the name / email."
          iconLeft="search"
        />
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchUserContainer: {
    backgroundColor: 'green',
    padding: 10,
  },
  searchUser: {
    marginHorizontal: 10,
  },
});
