import React from 'react';
import { Column } from '@ant-design/charts';
import i18n from '../../utils/i18n.js';

const DashboardBalance = ({ fiscalYears = [], loading = false }) => {
  const data = React.useMemo(() => {
    return [...(fiscalYears || [])].reverse().map((y) => {
      const income = y.income_amount || 0;
      const outcome = y.outcome_amount || 0;
      const balance = (income + outcome);
      return { label: y.title, value: balance };
    });
  }, [fiscalYears]);

  if (loading) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.balance_trend')}</h3>
        <div>{i18n.t('pages.dashboard.loading') || 'Loading...'}</div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.balance_trend')}</h3>
        <div>{i18n.t('pages.dashboard.no_data') || 'No data'}</div>
      </div>
    );
  }

  const config = {
    data,
    xField: 'label',
    yField: 'value',
    xAxis: { title: { text: i18n.t('pages.dashboard.axis_year') || '' } },
    yAxis: { title: { text: i18n.t('pages.dashboard.axis_value') || '' } },
    height: 300,
    animation: false,
    axis: {
      y: {
        labelFormatter: (d) => d + " €",
      },
    },
    tooltip: {
      items: [
        {
          channel: 'y',
          name: i18n.t('pages.dashboard.balance'),
          valueFormatter: (d) => d.toFixed(2) + " €",
        },
      ],
    },
    style: {
      fill: ({ value }) => {
        if (value > 0) {
          return '#3f8600';
        }
        return '#cf1322';
      },
    },
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.balance_trend')}</h3>
      <Column {...config} />
    </div>
  );
};

export default DashboardBalance;
