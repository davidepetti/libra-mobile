import React from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import HomeScreen from '@/src/screens/HomeScreen';

export default function HomeTab() {
  return <HomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
