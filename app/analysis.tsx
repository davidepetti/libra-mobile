import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import AnalysisScreen from '../src/screens/AnalysisScreen';

export default function AnalysisPage() {
  // Get the route parameters
  const params = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Financial Analysis',
          headerStyle: {
            backgroundColor: '#0A004D',
          },
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
        }}
      />
      <AnalysisScreen route={{ params }} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
