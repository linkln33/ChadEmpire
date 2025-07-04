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
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      itemGap: 20,
      formatter: (name: string) => {
        const item = data.find(d => d.name === name);
        return `${name}: ${item?.value}%`;
      },
      icon: 'circle',
    },
    series: [
      {
        name: 'Token Allocation',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#000',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}: {c}%',
            color: '#fff',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          scaleSize: 10,
        },
        labelLine: {
          show: false,
        },
        data: data,
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
