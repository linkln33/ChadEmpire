# Charts Components

This directory contains components related to data visualization and charts in the Chad Empire application.

## Components

### TokenomicsChart

A component that visualizes token distribution and allocation using interactive charts.

**Props:**
- `data` (object): Token distribution data
- `chartType` (string, optional): Type of chart to display ('pie', 'donut', 'bar')
- `interactive` (boolean, optional): Whether the chart has interactive elements
- `showLegend` (boolean, optional): Whether to display the chart legend

**State:**
- `activeSegment`: Currently highlighted segment
- `chartWidth`: Current width of the chart (for responsiveness)
- `isLoading`: Whether chart data is loading

**Key Functions:**
- `renderChart()`: Renders the appropriate chart based on chartType
- `handleSegmentClick()`: Handles interaction with chart segments
- `calculatePercentages()`: Calculates percentage values for display
- `formatLegendData()`: Formats data for the legend display

**Notes:**
- Uses Chart.js for rendering visualizations
- Supports multiple chart types for different data views
- Includes interactive tooltips with detailed information
- Implements responsive design for various screen sizes

## Usage

```jsx
// In a tokenomics page component
import { TokenomicsChart } from '@/components/charts';

// Then in your JSX
const TokenomicsPage = () => {
  const tokenDistribution = {
    community: 40,
    team: 15,
    marketing: 10,
    development: 20,
    reserves: 15
  };
  
  return (
    <div className="tokenomics-container">
      <h2>$CHAD Token Distribution</h2>
      <TokenomicsChart 
        data={tokenDistribution}
        chartType="donut"
        interactive={true}
        showLegend={true}
      />
      <div className="tokenomics-description">
        <p>The $CHAD token has been distributed to ensure long-term sustainability and community ownership.</p>
        {/* Additional tokenomics information */}
      </div>
    </div>
  );
};
```

## Implementation Details

The charts components provide visual representation of important data in the Chad Empire platform:
1. Token distribution and allocation
2. User statistics and performance
3. Game economy metrics
4. Historical data trends

These visualizations help users understand complex data in an intuitive way, enhancing transparency and engagement with the platform's economic model.
