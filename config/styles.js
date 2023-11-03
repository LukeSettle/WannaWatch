import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  enabledButtonContainer: {
    backgroundColor: '#e74c3c',
  },
  disabledButtonContainer: {
    backgroundColor: '#e74c3c',
    opacity: 0.5,
  },
  pressedButtonContainer: {
    backgroundColor: '#c0392b',
  },
  buttonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  }
});

export default globalStyles;