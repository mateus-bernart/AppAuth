import {ActivityIndicatorComponent, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import axiosInstance from '../../services/api';
import {Controller} from 'react-hook-form';
import DropDownPicker from 'react-native-dropdown-picker';

type CustomSelectProps = {
  control: any;
  name: string;
  rules?: object;
  placeholder?: string;
  endpoint: string;
  labelField: string;
  valueField: string;
};
const SearchSelectPicker: React.FC<CustomSelectProps> = ({
  control,
  name,
  rules = {},
  placeholder = 'Select...',
  endpoint,
  labelField,
  valueField,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{label: string; value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get(endpoint);
        const formatted = response.data.map(item => ({
          label: item[valueField],
          value: item[valueField],
        }));

        setItems(formatted);
      } catch (error) {
        console.log('Error fetching branches:', error.response);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

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
            placeholder={loading ? 'Loading...' : placeholder}
            searchable={true}
            zIndex={2000}
            zIndexInverse={2000}
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
            ListEmptyComponent={() => (
              <View>
                {loading ? (
                  <ActivityIndicatorComponent size={30} color="green" />
                ) : (
                  <View style={styles.containerRenderFailMessage}>
                    <Text style={styles.renderFailText}>
                      Couldn't render items. Check internet.
                    </Text>
                  </View>
                )}
              </View>
            )}
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

export default SearchSelectPicker;
