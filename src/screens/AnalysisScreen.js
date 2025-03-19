import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button, Text, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { LineChart, ScatterChart } from 'react-native-chart-kit';

// Import our tab screens for different metrics
import PBAnalysisTab from '../components/PBAnalysisTab';
import PEAnalysisTab from '../components/PEAnalysisTab';
import PFCFAnalysisTab from '../components/PFCFAnalysisTab';
import PSAnalysisTab from '../components/PSAnalysisTab';
import EVEBITDAAnalysisTab from '../components/EVEBITDAAnalysisTab';

const Tab = createMaterialTopTabNavigator();

const AnalysisScreen = ({ route }) => {
  const { 
    pbFiles: pbFilesStr, 
    peFiles: peFilesStr, 
    pfcfFiles: pfcfFilesStr, 
    psFiles: psFilesStr, 
    evEbitdaFiles: evEbitdaFilesStr, 
    holdingPeriod 
  } = route.params;

  // Parse JSON strings back to objects
  const pbFiles = pbFilesStr ? JSON.parse(pbFilesStr) : [];
  const peFiles = peFilesStr ? JSON.parse(peFilesStr) : [];
  const pfcfFiles = pfcfFilesStr ? JSON.parse(pfcfFilesStr) : [];
  const psFiles = psFilesStr ? JSON.parse(psFilesStr) : [];
  const evEbitdaFiles = evEbitdaFilesStr ? JSON.parse(evEbitdaFilesStr) : [];

  // Keep track of which tabs should be shown based on uploaded files
  const showPBTab = pbFiles && pbFiles.length > 0;
  const showPETab = peFiles && peFiles.length > 0;
  const showPFCFTab = pfcfFiles && pfcfFiles.length > 0;
  const showPSTab = psFiles && psFiles.length > 0;
  const showEVEBITDATab = evEbitdaFiles && evEbitdaFiles.length > 0;

  // Create appropriate tabs for available data
  const renderTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: { backgroundColor: '#f5f5f5' },
          tabBarIndicatorStyle: { backgroundColor: '#0A004D' },
        }}
      >
        {showPBTab && (
          <Tab.Screen 
            name="P/B" 
            children={() => <PBAnalysisTab files={pbFiles} holdingPeriod={holdingPeriod} />}
          />
        )}
        {showPETab && (
          <Tab.Screen 
            name="P/E" 
            children={() => <PEAnalysisTab files={peFiles} holdingPeriod={holdingPeriod} />}
          />
        )}
        {showPFCFTab && (
          <Tab.Screen 
            name="P/FCF" 
            children={() => <PFCFAnalysisTab files={pfcfFiles} holdingPeriod={holdingPeriod} />}
          />
        )}
        {showPSTab && (
          <Tab.Screen 
            name="P/S" 
            children={() => <PSAnalysisTab files={psFiles} holdingPeriod={holdingPeriod} />}
          />
        )}
        {showEVEBITDATab && (
          <Tab.Screen 
            name="EV/EBITDA" 
            children={() => <EVEBITDAAnalysisTab files={evEbitdaFiles} holdingPeriod={holdingPeriod} />}
          />
        )}
      </Tab.Navigator>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AnalysisScreen;
