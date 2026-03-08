import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/charts';
import i18n from '../../utils/i18n.js';
import dayjs from "dayjs";

const DashboardBalance = ({ fiscalYears = [], loading = false }) => {

	function getShortYear(year) {
		return dayjs(year.start_date).format('YYYY') + "/" + dayjs(year.end_date).format('YY');
	}

  const data = React.useMemo(() => {
    return [...(fiscalYears || [])].reverse().map((y) => {
      const income = y.income_amount || 0;
      const outcome = y.outcome_amount || 0;
      const balance = (income + outcome);
      return {
		  label: y.title,
	      value: balance,
	      year_short: getShortYear(y)
	  };
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
    xField: 'year_short',
    yField: 'value',
    xAxis: { title: { text: i18n.t('pages.dashboard.axis_year') || '' } },
    yAxis: { title: { text: i18n.t('pages.dashboard.axis_value') || '' } },
    animation: false,
    axis: {
	    x: {
		    labelFormatter: (d) => d,
		    //labelAutoRotate: false,
		    //labelAutoWrap: true,
	    },
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
      <Card title={i18n.t('pages.dashboard.balance_trend')}>
        <Column {...config} />
      </Card>
  );
};

export default DashboardBalance;
