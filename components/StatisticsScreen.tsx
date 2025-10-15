import apiService from '@/services/ApiService';
import { useLanguage } from '@/utils/languageContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { colors, spacing, styles } from '@/styles/styles';

const screenWidth = Dimensions.get('window').width;

interface StatsData {
  time_period: string;
  bottles_count: number;
  total_amount: number;
  average_amount: number;
}

interface StatsResponse {
  period: string;
  data: StatsData[];
}

type TimePeriod = '24h' | '7d' | '30d';

export default function StatisticsScreen() {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h');
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatsData();
  }, [selectedPeriod]);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: StatsResponse = await apiService.getBottleStats(selectedPeriod);
      setStatsData(response.data || []);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(t('statisticsError'));
      Alert.alert(t('statisticsError'), t('statisticsErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const formatTimePeriod = (period: string, timePeriod: TimePeriod): string => {
    const date = new Date(period);
    
    switch (timePeriod) {
      case '24h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '7d':
      case '30d':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      default:
        return period;
    }
  };

  const getChartData = () => {
    if (statsData.length === 0) {
      return {
        labels: [t('noData')],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    if (selectedPeriod === '24h') {
      // For 24h, create proportional time-based positions
      const firstBottleTime = new Date(statsData[0].time_period);
      
      // Calculate positions based on time differences
      const dataPoints = statsData.map(item => {
        const bottleTime = new Date(item.time_period);
        const hoursDiff = (bottleTime.getTime() - firstBottleTime.getTime()) / (1000 * 60 * 60); // Difference in hours
        const amount = typeof item.total_amount === 'string' ? parseFloat(item.total_amount) : item.total_amount;
        return {
          x: hoursDiff, // Position based on elapsed time
          y: typeof amount === 'number' && !isNaN(amount) ? amount : 0
        };
      });

      // Create labels with exact times
      const labels = statsData.map(item => {
        const time = new Date(item.time_period);
        return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      });

      // Extract just the amounts for the chart (positions will be proportional)
      const amounts = dataPoints.map(point => point.y);

      return {
        labels: labels,
        datasets: [{
          data: amounts,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 2
        }]
      };
    } else {
      // For 7d and 30d, use existing logic
      const labels = statsData.map(item => formatTimePeriod(item.time_period, selectedPeriod));
      const amounts = statsData.map(item => {
        const amount = item.total_amount;
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return typeof numericAmount === 'number' && !isNaN(numericAmount) ? numericAmount : 0;
      });

      const validData = amounts.filter(amount => typeof amount === 'number' && !isNaN(amount));
      const validLabels = labels.slice(0, validData.length);

      return {
        labels: validLabels.length > 10 ? validLabels.filter((_, index) => index % Math.ceil(validLabels.length / 10) === 0) : validLabels,
        datasets: [{
          data: validData.length > 0 ? validData : [0],
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }
  };

  const getTotalStats = () => {
    if (statsData.length === 0) {
      return { totalBottles: 0, totalAmount: 0, averageAmount: 0 };
    }

    const totalBottles = statsData.reduce((sum, item) => {
      const count = typeof item.bottles_count === 'string' ? parseInt(item.bottles_count) : item.bottles_count;
      return sum + (typeof count === 'number' && !isNaN(count) ? count : 0);
    }, 0);
    
    const totalAmount = statsData.reduce((sum, item) => {
      const amount = typeof item.total_amount === 'string' ? parseFloat(item.total_amount) : item.total_amount;
      return sum + (typeof amount === 'number' && !isNaN(amount) ? amount : 0);
    }, 0);
    
    const averageAmount = totalBottles > 0 ? Math.round(totalAmount / totalBottles) : 0;

    return { totalBottles, totalAmount, averageAmount };
  };

  const getChartConfig = () => {
    const maxValue = Math.max(...statsData.map(item => {
      const amount = item.total_amount;
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return typeof numericAmount === 'number' && !isNaN(numericAmount) ? numericAmount : 0;
    }));
    
    return {
      backgroundColor: colors.background.primary,
      backgroundGradientFrom: colors.background.primary,
      backgroundGradientTo: colors.background.primary,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: colors.primary.main
      },
      // Format Y-axis labels
      formatYLabel: (yLabel: string) => `${Math.round(parseFloat(yLabel))}ml`
    };
  };

  const periodOptions: { key: TimePeriod; label: string }[] = [
    { key: '24h', label: t('last24Hours') },
    { key: '7d', label: t('last7Days') },
    { key: '30d', label: t('last30Days') },
  ];

  const totalStats = getTotalStats();

  if (loading) {
    return (
      <View style={styles.statisticsLoadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.statisticsLoadingText}>{t('loadingStatistics')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.statisticsContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.statisticsHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.xl }}>
          <TouchableOpacity
            onPress={() => {
              try {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  // If no previous screen, go to dashboard manually
                  router.replace('/');
                }
              } catch (error) {
                router.replace('/');
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.background.secondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.text.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.sm,
                marginBottom: spacing.sm

}}>
                <Ionicons name="bar-chart" size={20} color={colors.background.tertiary} />
              </View>
              <Text style={styles.statisticsTitle}>{t('statsTitle')}</Text>
            </View>
            <Text style={styles.statisticsSubtitle}>{t('bottleConsumptionOverTime')}</Text>
          </View>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.statisticsPeriodSelector}>
        {periodOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.statisticsPeriodButton,
              selectedPeriod === option.key && styles.statisticsPeriodButtonActive
            ]}
            onPress={() => setSelectedPeriod(option.key)}
          >
            <Text style={[
              styles.statisticsPeriodButtonText,
              selectedPeriod === option.key && styles.statisticsPeriodButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.statisticsSummaryContainer}>
        <View style={styles.statisticsSummaryItem}>
          <Ionicons name="water" size={24} color={colors.primary.main} />
          <Text style={styles.statisticsSummaryValue}>{totalStats.totalBottles}</Text>
          <Text style={styles.statisticsSummaryLabel}>{t('bottlesLabel')}</Text>
        </View>
        
        <View style={styles.statisticsSummaryItem}>
          <Ionicons name="flask" size={24} color={colors.secondary.main} />
          <Text style={styles.statisticsSummaryValue}>{totalStats.totalAmount}ml</Text>
          <Text style={styles.statisticsSummaryLabel}>{t('totalLabel')}</Text>
        </View>
        
        <View style={styles.statisticsSummaryItem}>
          <Ionicons name="trending-up" size={24} color={colors.accent.warm} />
          <Text style={styles.statisticsSummaryValue}>{totalStats.averageAmount}ml</Text>
          <Text style={styles.statisticsSummaryLabel}>{t('averageLabel')}</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.statisticsChartContainer}>
        <Text style={styles.statisticsChartTitle}>
          {selectedPeriod === '24h' ? t('hourlyConsumption') : t('dailyConsumption')}
        </Text>
        
        {error ? (
          <View style={styles.statisticsErrorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.accent.error} />
            <Text style={styles.statisticsErrorText}>{error}</Text>
            <TouchableOpacity style={styles.statisticsRetryButton} onPress={loadStatsData}>
              <Text style={styles.statisticsRetryButtonText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statisticsChartWrapper}>
            <LineChart
              data={getChartData()}
              width={screenWidth - 50}
              height={200}
              chartConfig={getChartConfig()}
              bezier
              style={styles.statisticsChart}
              fromZero={true}
            />
          </View>
        )}
      </View>

      {/* Data Table */}
      {statsData.length > 0 && (
        <View style={styles.statisticsTableContainer}>
          <Text style={styles.statisticsTableTitle}>{t('detailedData')}</Text>
          <View style={styles.statisticsTableHeader}>
            <Text style={styles.statisticsTableHeaderText}>
              {selectedPeriod === '24h' ? t('hourLabel') : t('dateLabel')}
            </Text>
            <Text style={styles.statisticsTableHeaderText}>{t('bottlesLabel')}</Text>
            <Text style={styles.statisticsTableHeaderText}>{t('amountLabel')}</Text>
          </View>
          
          {statsData.slice(0, 10).map((item, index) => (
            <View key={index} style={styles.statisticsTableRow}>
              <Text style={styles.statisticsTableCell}>
                {formatTimePeriod(item.time_period, selectedPeriod)}
              </Text>
              <Text style={styles.statisticsTableCell}>{item.bottles_count}</Text>
              <Text style={styles.statisticsTableCell}>{item.total_amount}ml</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}