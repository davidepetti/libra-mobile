import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';

export default function AnalyzeTab() {
  const router = useRouter();

  // When user taps upload button, navigate to HomeScreen
  const goToDataUpload = () => {
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Financial Metrics Analysis',
          headerStyle: {
            backgroundColor: '#0A004D',
          },
          headerTintColor: '#fff',
        }}
      />
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Upload Your Data</Title>
          <Paragraph>To perform financial metrics analysis, you need to first upload your data files.</Paragraph>
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              style={styles.button}
              onPress={goToDataUpload}
            >
              Upload Files
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Available Metrics</Title>
          <Paragraph>This analyzer supports the following financial metrics:</Paragraph>
          <View style={styles.metricsContainer}>
            <Text style={styles.metricItem}>• Price-to-Book (P/B) Ratio</Text>
            <Text style={styles.metricItem}>• Price-to-Earnings (P/E) Ratio</Text>
            <Text style={styles.metricItem}>• Price-to-Free Cash Flow (P/FCF) Ratio</Text>
            <Text style={styles.metricItem}>• Price-to-Sales (P/S) Ratio</Text>
            <Text style={styles.metricItem}>• Enterprise Value to EBITDA (EV/EBITDA)</Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#0A004D',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  metricsContainer: {
    marginTop: 8,
  },
  metricItem: {
    fontSize: 16,
    marginBottom: 8,
  }
});
