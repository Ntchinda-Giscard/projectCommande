import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, Text } from 'react-native';

type LoadingModalProps = {
  visible: boolean;
  message?: string;
};

const LoadingModal = ({ visible, message = 'Loading...' }: LoadingModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="gray" />
          <Text className='text-lg font-semibold text-white' >{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});
