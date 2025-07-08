import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface Address {
  code: string;
  city: string;
  addressLine: string;
  postalCode: string;
  country: string;
  phone: string;
  contactCode: string;
}

interface AddressDropdownProps {
  addresses: Address[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  label?: string;
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  addresses,
  value,
  onChange,
  placeholder = "Select an address",
  label
}) => {
  // Transform addresses to dropdown format
  const dropdownData = addresses.map(address => ({
    label: address.addressLine,
    value: address.code
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Dropdown
        style={styles.dropdown}
        data={dropdownData}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={(item) => onChange(item.value)}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddressDropdown;