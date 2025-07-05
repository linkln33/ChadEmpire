'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface TokenomicsChartProps {
  data: {
    name: string;
    value: number;
    itemStyle?: {
      color: string;
    };
    emphasis?: {
      itemStyle: {
        color: string;
      };
    };
    tooltip?: {
      formatter: string;
    };
  }[];
}

const TokenomicsChart: React.FC<TokenomicsChartProps> = ({ data }) => {
  // Define colors for each segment
  const colors = {
    'Fair Launch': '#ff1493', // Pink
    'Liquidity': '#00fff7',   // Cyan
    'Rewards Pool': '#ffd700', // Gold
    'Dev & Marketing': '#9400d3' // Purple
  };

  // Update data with consistent colors
  const enhancedData = data.map(item => ({
    ...item,
    itemStyle: {
      color: colors[item.name as keyof typeof colors] || '#ffffff'
    }
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00fff7',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14,
      },
      extraCssText: 'box-shadow: 0 0 10px rgba(0, 255, 247, 0.5);',
    },
    legend: {
      show: false, // Hide default legend
    },
    series: [
      {
        name: 'Token Allocation',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#000',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: function(params: any) {
            return `${params.name}\n${params.value}%`;
          },
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fff',
          textBorderWidth: 0,
          padding: [0, 0, 0, 0],
          align: 'center',
          verticalAlign: 'middle',
          rich: {
            name: {
              fontSize: 14,
              fontWeight: 'bold',
              padding: [0, 0, 0, 0],
              color: '#fff'
            },
            value: {
              fontSize: 16,
              fontWeight: 'bold',
              padding: [0, 0, 0, 0],
              color: '#fff'
            }
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 0,
          smooth: true,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        data: [
          { 
            name: 'Fair Launch', 
            value: 30, 
            itemStyle: { color: '#ff1493' },
            label: { position: 'outside' }
          },
          { 
            name: 'Liquidity', 
            value: 30, 
            itemStyle: { color: '#00fff7' },
            label: { position: 'outside' }
          },
          { 
            name: 'Rewards', 
            value: 30, 
            itemStyle: { color: '#ffd700' },
            label: { position: 'outside' }
          },
          { 
            name: 'Dev', 
            value: 10, 
            itemStyle: { color: '#9400d3' },
            label: { position: 'outside' }
          }
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function () {
          return Math.random() * 200;
        }
      },
    ],
  };

  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        className="bg-transparent"
      />
    </div>
  );
};

export default TokenomicsChart;
