'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import Image from 'next/image';

export default function TokenomicsPage() {
  const distributionChartRef = useRef<HTMLDivElement>(null);
  const allocationChartRef = useRef<HTMLDivElement>(null);
  const emissionChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize charts after component mounts
    if (distributionChartRef.current && allocationChartRef.current && emissionChartRef.current) {
      // Distribution Chart
      const distributionChart = echarts.init(distributionChartRef.current);
      const distributionOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          top: '5%',
          left: 'center',
          textStyle: {
            color: '#fff'
          }
        },
        series: [
          {
            name: 'Token Distribution',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#121212',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold',
                color: '#fff'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 30, name: 'Fair Launch', itemStyle: { color: '#FF6B35' } },
              { value: 30, name: 'Liquidity', itemStyle: { color: '#4361EE' } },
              { value: 30, name: 'Rewards Pool', itemStyle: { color: '#FFD166' } },
              { value: 10, name: 'Dev & Marketing', itemStyle: { color: '#06D6A0' } }
            ]
          }
        ]
      };
      distributionChart.setOption(distributionOption);

      // Allocation Chart
      const allocationChart = echarts.init(allocationChartRef.current);
      const allocationOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const param = params[0];
            return `${param.name}: ${param.value}%`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: ['Spin Yields', 'Lottery', 'Leaderboards', 'Boosters'],
          axisLabel: {
            color: '#fff'
          }
        },
        series: [
          {
            name: 'Rewards Pool Allocation',
            type: 'bar',
            data: [40, 30, 20, 10],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#FF6B35' },
                { offset: 1, color: '#FFD166' }
              ])
            }
          }
        ]
      };
      allocationChart.setOption(allocationOption);

      // Emission Chart
      const emissionChart = echarts.init(emissionChartRef.current);
      const emissionOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['Total Supply', 'Circulating Supply'],
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['Launch', 'Q1', 'Q2', 'Q3', 'Q4', 'Year 2', 'Year 3'],
            axisLabel: {
              color: '#fff'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Millions',
            axisLabel: {
              color: '#fff',
              formatter: '{value}M'
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        ],
        series: [
          {
            name: 'Total Supply',
            type: 'line',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 107, 53, 0.8)' },
                { offset: 1, color: 'rgba(255, 107, 53, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [1000, 1000, 1000, 1000, 1000, 1000, 1000],
            lineStyle: {
              color: '#FF6B35'
            },
            itemStyle: {
              color: '#FF6B35'
            }
          },
          {
            name: 'Circulating Supply',
            type: 'line',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(67, 97, 238, 0.8)' },
                { offset: 1, color: 'rgba(67, 97, 238, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [300, 400, 500, 600, 700, 850, 950],
            lineStyle: {
              color: '#4361EE'
            },
            itemStyle: {
              color: '#4361EE'
            }
          }
        ]
      };
      emissionChart.setOption(emissionOption);

      // Handle resize
      const handleResize = () => {
        distributionChart.resize();
        allocationChart.resize();
        emissionChart.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        distributionChart.dispose();
        allocationChart.dispose();
        emissionChart.dispose();
      };
    }
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-chad-primary to-orange-500 text-transparent bg-clip-text">
              $CHAD Tokenomics
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The economic engine powering the ChadEmpire ecosystem
          </p>
        </div>

        {/* Chad Warrior Image */}
        <div className="flex justify-center mb-12">
          <div className="relative w-72 h-72 md:w-88 md:h-88">
            <Image 
              src="/images/chad-warrior.svg" 
              alt="Chad Warrior" 
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Token Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-chad-primary/20 shadow-lg shadow-chad-primary/10">
            <h3 className="text-2xl font-bold mb-2 text-chad-primary">Total Supply</h3>
            <p className="text-4xl font-bold font-['Orbitron']">1,000,000,000</p>
            <p className="text-gray-400">$CHAD Tokens</p>
          </div>
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <h3 className="text-2xl font-bold mb-2 text-orange-500">Fair Launch</h3>
            <p className="text-4xl font-bold font-['Orbitron']">30%</p>
            <p className="text-gray-400">Early Stakers & Community</p>
          </div>
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-chad-accent/20 shadow-lg shadow-chad-accent/10">
            <h3 className="text-2xl font-bold mb-2 text-chad-accent">Liquidity</h3>
            <p className="text-4xl font-bold font-['Orbitron']">30%</p>
            <p className="text-gray-400">Paired with SOL on DEXes</p>
          </div>
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <h3 className="text-2xl font-bold mb-2 text-blue-500">Rewards Pool</h3>
            <p className="text-4xl font-bold font-['Orbitron']">30%</p>
            <p className="text-gray-400">Spins, Lottery & Leaderboards</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-2xl font-bold mb-4 text-center text-white">Token Distribution</h3>
            <div ref={distributionChartRef} className="w-full h-80"></div>
          </div>
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-2xl font-bold mb-4 text-center text-white">Token Allocation</h3>
            <div ref={allocationChartRef} className="w-full h-80"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 mb-12">
          <h3 className="text-2xl font-bold mb-4 text-center text-white">Token Emission Schedule</h3>
          <div ref={emissionChartRef} className="w-full h-80"></div>
        </div>

        {/* Allocation Table */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text">
              Token Allocation Breakdown
            </span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-gradient-to-br from-black to-gray-900 rounded-xl border border-gray-800">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-lg font-bold text-chad-primary">Category</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-chad-primary">% Allocation</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-chad-primary">Tokens</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-chad-primary">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 text-white font-semibold">Fair Launch</td>
                  <td className="px-6 py-4 text-white">30%</td>
                  <td className="px-6 py-4 text-white">300,000,000</td>
                  <td className="px-6 py-4 text-gray-300">Distributed to early stakers and community supporters</td>
                </tr>
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 text-white font-semibold">Liquidity</td>
                  <td className="px-6 py-4 text-white">30%</td>
                  <td className="px-6 py-4 text-white">300,000,000</td>
                  <td className="px-6 py-4 text-gray-300">Paired with SOL on DEXes like Jupiter/Raydium</td>
                </tr>
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 text-white font-semibold">Rewards Pool</td>
                  <td className="px-6 py-4 text-white">30%</td>
                  <td className="px-6 py-4 text-white">300,000,000</td>
                  <td className="px-6 py-4 text-gray-300">Used for spin yields, lottery, leaderboards, boosters</td>
                </tr>
                <tr className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 text-white font-semibold">Dev & Marketing</td>
                  <td className="px-6 py-4 text-white">10%</td>
                  <td className="px-6 py-4 text-white">100,000,000</td>
                  <td className="px-6 py-4 text-gray-300">Locked vesting for operational costs, campaigns</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Token Utility */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text">
              $CHAD Token Utility
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-neon transition-all">
              <h3 className="text-xl font-bold mb-3 text-chad-neon">Spin-to-Earn</h3>
              <p className="text-gray-300">Stake $CHAD to earn daily spin tokens and increase your yield potential.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-pink transition-all">
              <h3 className="text-xl font-bold mb-3 text-chad-pink">Booster NFTs</h3>
              <p className="text-gray-300">Purchase and upgrade booster NFTs to enhance your gameplay and earnings.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-gold transition-all">
              <h3 className="text-xl font-bold mb-3 text-chad-gold">Lottery Tickets</h3>
              <p className="text-gray-300">Buy lottery tickets for a chance to win massive $CHAD jackpots.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-neon transition-all">
              <h3 className="text-xl font-bold mb-3 text-chad-neon">Governance</h3>
              <p className="text-gray-300">Vote on key protocol decisions and future game mechanics.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-pink transition-all">
              <h3 className="text-xl font-bold mb-3 text-chad-pink">Deflationary Mechanics</h3>
              <p className="text-gray-300">5% of all yields and lottery purchases are burned, creating deflationary pressure.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-gold transition-all">
              <h3 className="text-xl font-bold mb-3 text-chad-gold">Leaderboard Rewards</h3>
              <p className="text-gray-300">Top players on the leaderboard earn additional $CHAD rewards weekly.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-chad-primary to-orange-500 text-transparent bg-clip-text">
              Join the ChadEmpire
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Become part of the Cult of Infinite Yield and start your journey as a Chad Warrior
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-chad-primary to-orange-500 text-black font-bold rounded-full hover:opacity-90 transition-opacity">
              Buy $CHAD
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-chad-secondary text-white font-bold rounded-full hover:bg-chad-secondary/10 transition-all">
              Read Whitepaper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
