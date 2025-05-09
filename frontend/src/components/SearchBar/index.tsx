import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomInput from '../CustomInput';

type SearchBarProps = {
  control: any;
  placeholder: string;
};

const SearchBar = ({control, placeholder}: SearchBarProps) => {
  return (
    <View style={styles.searchUserContainer}>
      <View style={styles.searchUser}>
        <CustomInput
          control={control}
          name="term"
          // placeholder="Search by the name / email."
          placeholder={placeholder}
          iconLeft="search"
        />
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchUserContainer: {
    padding: 10,
  },
  searchUser: {
    marginHorizontal: 10,
  },
});
