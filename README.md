# Libra Mobile - Financial Metrics Analyzer

A React Native mobile app for analyzing financial metrics, built with Expo.

## Features

- Upload and analyze financial metric CSV data files
- Support for multiple financial metrics:
  - Price-to-Book (P/B) ratio
  - Price-to-Earnings (P/E) ratio
  - Price-to-Free Cash Flow (P/FCF) ratio
  - Price-to-Sales (P/S) ratio
  - Enterprise Value to EBITDA (EV/EBITDA) ratio
- Visualize historical trends of financial metrics
- Calculate expected returns based on different holding periods
- Analyze relationship between metrics and future returns

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo Go app (for testing on physical devices)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

Scan the QR code with the Expo Go app on your mobile device or use an emulator/simulator to preview the app.

## CSV File Format

The app expects CSV files for financial metrics with at least the following columns:
- Date: The date of the measurement (YYYY-MM-DD format)
- Ratio column: The value of the financial ratio (P/B, P/E, etc.)

Optional columns that will be recognized:
- Company or Ticker: Company name or ticker symbol

## Usage

1. Open the app and go to the "Analyze" tab
2. Upload CSV files for the metrics you want to analyze
3. Select a holding period (1, 3, 5, or 10 years)
4. Tap "Start Analysis" to view the results
5. Switch between different metric tabs to view analysis for each metric

## Technical Details

- Built with React Native and Expo
- Uses expo-router for navigation
- Visualizations with react-native-chart-kit
- CSV parsing with Papa Parse
- UI components from react-native-paper
