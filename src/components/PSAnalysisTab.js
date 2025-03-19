import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Divider, DataTable } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

import { processCSVData, calculateAnnualizedProfit } from '../utils/dataProcessing';

const screenWidth = Dimensions.get('window').width;

const PSAnalysisTab = ({ files, holdingPeriod }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [percentileData, setPercentileData] = useState([]);

  useEffect(() => {
    const loadAndProcessFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!files || files.length === 0) {
          throw new Error('No P/S files provided');
        }

        // Array to hold all data from files
        let allData = [];

        // Read and parse each file
        for (const file of files) {
          const fileUri = file.uri;
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          
          // Parse CSV content
          Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                // Process the data to ensure it has required columns
                const processedData = processCSVData(results.data, 'ps_ratio');
                allData = [...allData, ...processedData];
              }
            },
            error: (error) => {
              console.error('Error parsing CSV:', error);
              setError(`Error parsing CSV: ${error.message}`);
            }
          });
        }

        // Sort data by date
        allData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        // Calculate annualized profit
        const dataWithProfit = calculateAnnualizedProfit(allData, holdingPeriod, 'ps_ratio');

        // Calculate statistics
        const psValues = dataWithProfit.map(item => item.ps_ratio).filter(val => !isNaN(val));
        const stats = {
          current: psValues[psValues.length - 1] || 0,
          mean: psValues.reduce((sum, val) => sum + val, 0) / psValues.length,
          median: psValues.sort((a, b) => a - b)[Math.floor(psValues.length / 2)],
          min: Math.min(...psValues),
          max: Math.max(...psValues)
        };

        // Calculate percentile data
        const percentiles = [10, 25, 50, 75, 90];
        const percentileValues = percentiles.map(p => {
          const index = Math.floor(psValues.length * (p / 100));
          return psValues[index];
        });

        const percentileData = percentiles.map((percentile, index) => {
          const value = percentileValues[index];
          // Filter data points close to this percentile value
          const filteredData = dataWithProfit.filter(item => 
            item.ps_ratio >= value * 0.95 && item.ps_ratio <= value * 1.05
          );
          
          // Calculate average profit for these data points
          const profitValues = filteredData.map(item => item[`annualized_profit_${holdingPeriod}_years`]);
          const avgProfit = profitValues.length > 0 
            ? profitValues.reduce((sum, val) => sum + val, 0) / profitValues.length 
            : 0;
          
          return {
            percentile,
            value: value.toFixed(2),
            profit: (avgProfit * 100).toFixed(2)
          };
        });

        setData(dataWithProfit);
        setStats(stats);
        setPercentileData(percentileData);
      } catch (error) {
        console.error('Error loading P/S data:', error);
        setError(`Error loading P/S data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAndProcessFiles();
  }, [files, holdingPeriod]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0A004D" />
        <Text>Loading P/S data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No P/S data available</Text>
      </View>
    );
  }

  // Prepare data for trend chart
  const trendData = {
    labels: data
      .filter(item => !isNaN(item.ps_ratio) && isFinite(item.ps_ratio))
      .map(item => new Date(item.Date).toLocaleDateString())
      .filter((_, i, arr) => i % Math.ceil(arr.length / 6) === 0),
    datasets: [
      {
        data: data
          .filter(item => !isNaN(item.ps_ratio) && isFinite(item.ps_ratio))
          .map(item => item.ps_ratio),
        color: () => '#0A004D',
        strokeWidth: 2
      }
    ],
  };

  // Prepare data for scatter plot
  const scatterData = {
    labels: data
      .filter(item => 
        !isNaN(item.ps_ratio) && 
        isFinite(item.ps_ratio) && 
        !isNaN(item[`annualized_profit_${holdingPeriod}_years`]) && 
        isFinite(item[`annualized_profit_${holdingPeriod}_years`])
      )
      .map(item => new Date(item.Date).toLocaleDateString()),
    datasets: [
      {
        data: data
          .filter(item => 
            !isNaN(item.ps_ratio) && 
            isFinite(item.ps_ratio) && 
            !isNaN(item[`annualized_profit_${holdingPeriod}_years`]) && 
            isFinite(item[`annualized_profit_${holdingPeriod}_years`])
          )
          .map(item => (item[`annualized_profit_${holdingPeriod}_years`] || 0) * 100),
        color: () => 'rgba(10, 0, 77, 1)',
        strokeWidth: 2
      },
      {
        data: data
          .filter(item => 
            !isNaN(item.ps_ratio) && 
            isFinite(item.ps_ratio) && 
            !isNaN(item[`annualized_profit_${holdingPeriod}_years`]) && 
            isFinite(item[`annualized_profit_${holdingPeriod}_years`])
          )
          .map(item => item.ps_ratio),
        color: () => 'rgba(10, 0, 77, 0.7)',
        strokeWidth: 2
      }
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Price to Sales (P/S) Analysis</Title>
          <Text>Holding Period: {holdingPeriod} years</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Key Statistics</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{stats.current.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mean</Text>
              <Text style={styles.statValue}>{stats.mean.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Median</Text>
              <Text style={styles.statValue}>{stats.median.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min</Text>
              <Text style={styles.statValue}>{stats.min.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max</Text>
              <Text style={styles.statValue}>{stats.max.toFixed(2)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>P/S Ratio Over Time</Title>
          <LineChart
            data={trendData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: () => `rgba(10, 0, 77, 1)`,
              labelColor: () => `rgba(0, 0, 0, 0.7)`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>P/S Ratio vs Annualized Return</Title>
          <LineChart
            data={scatterData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: () => `rgba(10, 0, 77, 1)`,
              labelColor: () => `rgba(0, 0, 0, 0.7)`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartNote}>Note: Each point represents P/S ratio and its corresponding {holdingPeriod}-year annualized return</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Expected Returns by Percentile</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Percentile</DataTable.Title>
              <DataTable.Title>P/S Value</DataTable.Title>
              <DataTable.Title numeric>Annualized Profit (%)</DataTable.Title>
            </DataTable.Header>

            {percentileData.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.percentile}%</DataTable.Cell>
                <DataTable.Cell>{item.value}</DataTable.Cell>
                <DataTable.Cell numeric>{item.profit}%</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chart: {
    marginTop: 16,
    borderRadius: 8,
  },
  chartNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PSAnalysisTab;
