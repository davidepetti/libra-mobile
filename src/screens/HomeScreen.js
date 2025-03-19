import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Text, Card, Title, Paragraph, Divider } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();
  const [pbFiles, setPbFiles] = useState([]);
  const [peFiles, setPeFiles] = useState([]);
  const [pfcfFiles, setPfcfFiles] = useState([]);
  const [psFiles, setPsFiles] = useState([]);
  const [evEbitdaFiles, setEvEbitdaFiles] = useState([]);
  const [holdingPeriod, setHoldingPeriod] = useState(5); // Default to 5 years

  const pickDocument = async (fileType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      // Handle selected files
      const files = result.assets;
      
      // Store files in the appropriate state based on fileType
      switch (fileType) {
        case 'pb':
          setPbFiles([...pbFiles, ...files]);
          break;
        case 'pe':
          setPeFiles([...peFiles, ...files]);
          break;
        case 'pfcf':
          setPfcfFiles([...pfcfFiles, ...files]);
          break;
        case 'ps':
          setPsFiles([...psFiles, ...files]);
          break;
        case 'ev_ebitda':
          setEvEbitdaFiles([...evEbitdaFiles, ...files]);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const clearFiles = (fileType) => {
    switch (fileType) {
      case 'pb':
        setPbFiles([]);
        break;
      case 'pe':
        setPeFiles([]);
        break;
      case 'pfcf':
        setPfcfFiles([]);
        break;
      case 'ps':
        setPsFiles([]);
        break;
      case 'ev_ebitda':
        setEvEbitdaFiles([]);
        break;
      case 'all':
        setPbFiles([]);
        setPeFiles([]);
        setPfcfFiles([]);
        setPsFiles([]);
        setEvEbitdaFiles([]);
        break;
      default:
        break;
    }
  };

  const getFileCount = (fileArray) => {
    return fileArray.length;
  };

  const getFileNames = (files) => {
    if (!files || files.length === 0) return [];
    return files.map(file => file.name);
  };
  
  const renderUploadedFileNames = (files) => {
    if (!files || files.length === 0) return null;
    
    return (
      <View style={styles.fileNamesList}>
        {files.map((file, index) => (
          <Text key={index} style={styles.fileName}>
            {file.name}
          </Text>
        ))}
      </View>
    );
  };

  const startAnalysis = () => {
    // Check if any files are uploaded
    if (!(pbFiles.length || peFiles.length || pfcfFiles.length || psFiles.length || evEbitdaFiles.length)) {
      Alert.alert('No Files', 'Please upload at least one data file to start analysis');
      return;
    }

    // Navigate to analysis screen with file data
    router.push({
      pathname: '/analysis',
      params: {
        pbFiles: JSON.stringify(pbFiles),
        peFiles: JSON.stringify(peFiles),
        pfcfFiles: JSON.stringify(pfcfFiles),
        psFiles: JSON.stringify(psFiles),
        evEbitdaFiles: JSON.stringify(evEbitdaFiles),
        holdingPeriod,
      }
    });
  };
  
  // Automatically start analysis after file upload
  useEffect(() => {
    // Check if any of the file arrays have at least one entry
    if (pbFiles.length || peFiles.length || pfcfFiles.length || psFiles.length || evEbitdaFiles.length) {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        startAnalysis();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pbFiles, peFiles, pfcfFiles, psFiles, evEbitdaFiles]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <Card style={styles.header}>
        <Card.Content>
          <Title style={styles.title}>Financial Metrics Analyzer</Title>
          <Paragraph>Upload your data files to analyze financial metrics</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.fileSection}>
        <Title style={styles.sectionTitle}>Upload Data Files</Title>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.fileRow}>
              <Text>P/B Files</Text>
              <Text>{getFileCount(pbFiles)} files</Text>
              <Button mode="contained" onPress={() => pickDocument('pb')}>
                Upload
              </Button>
              {pbFiles.length > 0 && (
                <Button mode="outlined" onPress={() => clearFiles('pb')}>
                  Clear
                </Button>
              )}
            </View>
            {renderUploadedFileNames(pbFiles)}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.fileRow}>
              <Text>P/E Files</Text>
              <Text>{getFileCount(peFiles)} files</Text>
              <Button mode="contained" onPress={() => pickDocument('pe')}>
                Upload
              </Button>
              {peFiles.length > 0 && (
                <Button mode="outlined" onPress={() => clearFiles('pe')}>
                  Clear
                </Button>
              )}
            </View>
            {renderUploadedFileNames(peFiles)}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.fileRow}>
              <Text>P/FCF Files</Text>
              <Text>{getFileCount(pfcfFiles)} files</Text>
              <Button mode="contained" onPress={() => pickDocument('pfcf')}>
                Upload
              </Button>
              {pfcfFiles.length > 0 && (
                <Button mode="outlined" onPress={() => clearFiles('pfcf')}>
                  Clear
                </Button>
              )}
            </View>
            {renderUploadedFileNames(pfcfFiles)}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.fileRow}>
              <Text>P/S Files</Text>
              <Text>{getFileCount(psFiles)} files</Text>
              <Button mode="contained" onPress={() => pickDocument('ps')}>
                Upload
              </Button>
              {psFiles.length > 0 && (
                <Button mode="outlined" onPress={() => clearFiles('ps')}>
                  Clear
                </Button>
              )}
            </View>
            {renderUploadedFileNames(psFiles)}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.fileRow}>
              <Text>EV/EBITDA Files</Text>
              <Text>{getFileCount(evEbitdaFiles)} files</Text>
              <Button mode="contained" onPress={() => pickDocument('ev_ebitda')}>
                Upload
              </Button>
              {evEbitdaFiles.length > 0 && (
                <Button mode="outlined" onPress={() => clearFiles('ev_ebitda')}>
                  Clear
                </Button>
              )}
            </View>
            {renderUploadedFileNames(evEbitdaFiles)}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Holding Period</Title>
            <View style={styles.holdingPeriodContainer}>
              {[1, 3, 5, 10].map(period => (
                <Button 
                  key={period}
                  mode={holdingPeriod === period ? "contained" : "outlined"}
                  onPress={() => setHoldingPeriod(period)}
                  style={styles.periodButton}
                >
                  {period} year{period > 1 ? 's' : ''}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={startAnalysis} 
          style={styles.analyzeButton}
          labelStyle={styles.analyzeButtonLabel}
        >
          Start Analysis
        </Button>

        {(pbFiles.length || peFiles.length || pfcfFiles.length || psFiles.length || evEbitdaFiles.length) > 0 && (
          <Button 
            mode="outlined" 
            onPress={() => clearFiles('all')} 
            style={styles.clearAllButton}
          >
            Clear All Files
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    backgroundColor: '#0A004D',
  },
  title: {
    color: 'white',
    fontSize: 22,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  fileSection: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  holdingPeriodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  periodButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  analyzeButton: {
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: '#0A004D',
    padding: 8,
  },
  analyzeButtonLabel: {
    fontSize: 16,
  },
  clearAllButton: {
    marginBottom: 12,
  },
  fileNamesList: {
    marginTop: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
