/**
 * Process CSV data to ensure it has the required columns
 * @param {Array} data - Raw CSV data
 * @param {String} ratioColumn - The name of the ratio column
 * @returns {Array} - Processed data
 */
export const processCSVData = (data, ratioColumn) => {
  // Filter out empty rows
  const filteredData = data.filter(row => {
    return row && typeof row === 'object' && Object.keys(row).length > 0;
  });

  // Map to ensure consistent column names
  return filteredData.map(row => {
    // Make sure we have a Date column
    let date = row.Date || row.date;
    if (!date) {
      // Try to find a date column
      const dateCol = Object.keys(row).find(key => 
        /date/i.test(key) || 
        (typeof row[key] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(row[key]))
      );
      if (dateCol) {
        date = row[dateCol];
      } else {
        // Use current date as fallback
        date = new Date().toISOString().split('T')[0];
      }
    }

    // Ensure ratio column exists
    let ratio = row[ratioColumn];
    if (ratio === undefined || ratio === null) {
      // Try to find a matching column
      const ratioCol = Object.keys(row).find(key => 
        new RegExp(ratioColumn, 'i').test(key) || 
        // For example, if looking for pb_ratio, also match p/b, price/book, etc.
        (ratioColumn === 'pb_ratio' && /p\/?b|price\/?book/i.test(key)) ||
        (ratioColumn === 'pe_ratio' && /p\/?e|price\/?earnings/i.test(key)) ||
        (ratioColumn === 'pfcf_ratio' && /p\/?fcf|price\/?free.?cash.?flow/i.test(key)) ||
        (ratioColumn === 'ps_ratio' && /p\/?s|price\/?sales/i.test(key)) ||
        (ratioColumn === 'ev_ebitda' && /ev\/?ebitda|enterprise.?value\/?ebitda/i.test(key))
      );
      if (ratioCol) {
        ratio = row[ratioCol];
      } else {
        // Use 0 as fallback
        ratio = 0;
      }
    }

    // Ensure it's a number
    if (typeof ratio === 'string') {
      ratio = parseFloat(ratio.replace(',', '.')) || 0;
    }
    
    // Validate the ratio number (handle NaN, Infinity, etc.)
    if (isNaN(ratio) || !isFinite(ratio)) {
      ratio = 0;
    }

    // Create a standardized row
    const newRow = {
      Date: date,
      [ratioColumn]: ratio,
    };

    // Add any other useful columns
    if (row.company || row.Company) {
      newRow.company = row.company || row.Company;
    }

    if (row.ticker || row.Ticker || row.symbol || row.Symbol) {
      newRow.ticker = row.ticker || row.Ticker || row.symbol || row.Symbol;
    }

    return newRow;
  });
};

/**
 * Calculate the annualized profit for a given holding period
 * @param {Array} data - The data array
 * @param {Number} holdingPeriod - The holding period in years
 * @param {String} ratioColumn - The name of the ratio column
 * @returns {Array} - Data with annualized profit added
 */
export const calculateAnnualizedProfit = (data, holdingPeriod, ratioColumn) => {
  if (!data || data.length === 0) {
    return [];
  }

  const result = [...data];
  
  // Sort by date ascending
  result.sort((a, b) => new Date(a.Date) - new Date(b.Date));

  // For each data point, calculate future return
  for (let i = 0; i < result.length; i++) {
    const currentPoint = result[i];
    
    // Skip points with invalid ratio values
    if (isNaN(currentPoint[ratioColumn]) || !isFinite(currentPoint[ratioColumn])) {
      currentPoint[`annualized_profit_${holdingPeriod}_years`] = 0;
      continue;
    }
    
    const currentDate = new Date(currentPoint.Date);
    
    // Find a data point approximately holdingPeriod years into the future
    const targetDate = new Date(
      currentDate.getFullYear() + holdingPeriod,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Find the closest future data point
    const futurePoints = result.filter(point => new Date(point.Date) >= targetDate);
    
    if (futurePoints.length === 0) {
      // If no future point, annualized profit is unknown
      currentPoint[`annualized_profit_${holdingPeriod}_years`] = 0;
      continue;
    }
    
    // Get the closest future point
    futurePoints.sort((a, b) => 
      Math.abs(new Date(a.Date) - targetDate) - Math.abs(new Date(b.Date) - targetDate)
    );
    const futurePoint = futurePoints[0];
    
    // Skip if future point has invalid ratio
    if (isNaN(futurePoint[ratioColumn]) || !isFinite(futurePoint[ratioColumn])) {
      currentPoint[`annualized_profit_${holdingPeriod}_years`] = 0;
      continue;
    }

    // Calculate annualized return
    // Inverse relationship: Lower ratio is better for future returns
    // Return = (Initial Ratio / Future Ratio)^(1/years) - 1
    const initialRatio = currentPoint[ratioColumn];
    const futureRatio = futurePoint[ratioColumn];
    
    // Calculate years between the two data points
    const yearsDiff = (new Date(futurePoint.Date) - new Date(currentPoint.Date)) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Only calculate if ratios are valid and positive
    if (initialRatio > 0 && futureRatio > 0 && yearsDiff > 0) {
      // The formula assumes higher initial ratios lead to lower future returns
      const annualizedReturn = Math.pow(initialRatio / futureRatio, 1 / yearsDiff) - 1;
      
      // Validate the result
      if (!isNaN(annualizedReturn) && isFinite(annualizedReturn)) {
        currentPoint[`annualized_profit_${holdingPeriod}_years`] = annualizedReturn;
      } else {
        currentPoint[`annualized_profit_${holdingPeriod}_years`] = 0;
      }
    } else {
      currentPoint[`annualized_profit_${holdingPeriod}_years`] = 0;
    }
  }

  return result;
};
