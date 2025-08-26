/**
 * @format
 */

// React Native WebSocket polyfill for SockJS
import 'react-native-get-random-values';

// Global WebSocket polyfill
if (!global.WebSocket) {
  global.WebSocket = require('react-native/Libraries/WebSocket/WebSocket');
}

// SockJS 호환성을 위한 추가 polyfill
if (!global.XMLHttpRequest) {
  global.XMLHttpRequest = require('react-native/Libraries/Network/XMLHttpRequest');
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
