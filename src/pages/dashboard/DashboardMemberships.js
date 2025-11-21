import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';
import i18n from '../../utils/i18n.js';

const DashboardMemberships = ({ fiscalYears = [], loading = false }) => {
  const data = React.useMemo(() => {
    return [...(fiscalYears || [])].reverse().map((y) => ({
      label: y.title,
      value: Number(y.membership_count || 0),
    }));
  }, [fiscalYears]);

  if (loading) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.memberships_trend')}</h3>
        <div>{i18n.t('pages.dashboard.loading') || 'Loading...'}</div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.memberships_trend')}</h3>
        <div>{i18n.t('pages.dashboard.no_data') || 'No data'}</div>
      </div>
    );
  }

  const config = {
    data,
    xField: 'label',
    yField: 'value',
    smooth: true,
    label: {
      text: (d) => `${(d.value)}`,
      textBaseline: 'bottom',
    },
    point: { size: 4, shape: 'circle' },
    xAxis: { title: { text: i18n.t('pages.dashboard.axis_year') || '' } },
    yAxis: { title: { text: i18n.t('pages.dashboard.axis_value') || '' } },
    axis: {
      x: false,
    },
    height: 300,
    animation: false,
  };

  return (
    <Card title={i18n.t('pages.dashboard.memberships_trend')}>
      <Line {...config} />
    </Card>
  );
};

export default DashboardMemberships;
