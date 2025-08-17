/**
 * Hana Bank Smart Consulting Tablet App
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomerTablet from './src/components/CustomerTablet';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#00b894" />
      <CustomerTablet />
    </SafeAreaProvider>
  );
}

export default App;
