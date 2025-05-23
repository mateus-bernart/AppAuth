import {ActivityIndicatorComponent, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Controller} from 'react-hook-form';
import DropDownPicker from 'react-native-dropdown-picker';

type SelectPickerProps = {
  control: any;
  name: string;
  rules?: object;
  placeholder?: string;
};

const SelectPicker: React.FC<SelectPickerProps> = ({
  control,
  name,
  rules = {},
  placeholder = 'Select...',
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Manager', value: 'manager'},
    {label: 'Regional Manager', value: 'regional_manager'},
    {label: 'Employee', value: 'employee'},
  ]);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={callback => {
              const newValue =
                typeof callback === 'function' ? callback(value) : callback;
              onChange(newValue);
            }}
            setItems={setItems}
            placeholder={placeholder}
            zIndex={3000}
            zIndexInverse={1000}
            style={{
              elevation: 5,
              borderColor: error ? 'red' : '#ccc',
            }}
            textStyle={{
              fontFamily: 'Poppins-Medium',
              fontSize: 15,
            }}
            modalTitleStyle={{color: 'gray'}}
            modalAnimationType="slide"
            customItemContainerStyle={{padding: 30}}
            selectedItemContainerStyle={{backgroundColor: 'lightgray'}}
            searchContainerStyle={{padding: 20, backgroundColor: '#60b565'}}
            searchTextInputStyle={{
              fontSize: 16,
              backgroundColor: 'white',
              borderWidth: 0,
            }}
            selectedItemLabelStyle={{
              color: 'green',
              fontFamily: 'Poppins-Bold',
            }}
            itemSeparator={true}
            itemSeparatorStyle={{
              backgroundColor: '#ccc',
              height: 1,
            }}
            listItemContainerStyle={{height: 60}}
            dropDownDirection="TOP"
            listMode="MODAL"
            searchPlaceholder="Search branches..."
          />
          {error && (
            <Text style={styles.errorMessage}>
              {error.message || 'This field is required'}
            </Text>
          )}
        </>
      )}
    />
  );
};

export default SelectPicker;

export const styles = StyleSheet.create({
  errorMessage: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: 'red',
    marginTop: 5,
  },
  containerRenderFailMessage: {
    flex: 1,
    marginTop: 20,
    alignItems: 'center',
  },
  renderFailText: {
    color: '#ea4f3d',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
