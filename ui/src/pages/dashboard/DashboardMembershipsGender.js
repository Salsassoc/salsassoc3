import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/plots';
import i18n from '../../utils/i18n.js';

const DashboardMembershipsGender = ({ fiscalYears = [], loading = false }) => {

	function getColor(type) {
		if (type === 'female'){
			return '#eb2f96'; // pink
		}
		if (type === 'male'){
			return '#1890ff'; // blue
		}
		return '#8c8c8c'; // grey
	}

	const data = React.useMemo(() => {
		const out = [];
		const years = [...(fiscalYears || [])].reverse();
		years.forEach((y) => {
		  const total = Number(y.membership_count || 0);
		  const g = y.memberships_gender || { male: 0, female: 0, unknown: 0 };
		  const male = Number(g.male || 0);
		  const female = Number(g.female || 0);
		  const unknown = Number(g.unknown || 0);
		  const toPercent = (n) => (total > 0 ? (n * 100) / total : 0);
		  out.push(
		    { label: y.title, type: 'female', value: toPercent(female), percent: toPercent(female), count: female, color: getColor('female'), year: y.title },
		    { label: y.title, type: 'male', value: toPercent(male), percent: toPercent(male), count: male, color: getColor('male'), year: y.title },
		    { label: y.title, type: 'unknown', value: toPercent(unknown), percent: toPercent(unknown), count: unknown, color: getColor('unknown'), year: y.title },
		  );
		});
		return out;
	}, [fiscalYears]);

	if (loading) {
		return (
		  <div style={{ marginBottom: 24 }}>
		    <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.memberships_gender')}</h3>
		    <div>{i18n.t('pages.dashboard.loading') || 'Loading...'}</div>
		  </div>
		);
	}
	if (!data || data.length === 0) {
		return (
		  <div style={{ marginBottom: 24 }}>
		    <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.memberships_gender')}</h3>
		    <div>{i18n.t('pages.dashboard.no_data') || 'No data'}</div>
		  </div>
		);
	}

	function getTypeLabel(t) {
		if (t === 'female'){
			return i18n.t('models.member.gender_female');
		}
		if (t === 'male'){
			return i18n.t('models.member.gender_male');
		}
		return i18n.t('models.member.gender_unknown');
	};

	const config = {
		data,
		xField: 'label',
		yField: 'value',
		stack: true,
		percent: true,
		xAxis: {
			title: {
				text: i18n.t('pages.dashboard.axis_year') || ''
			}
		},
		animation: false,
		legend: {
			// Keep default legend (series names). Counts are displayed in tooltip per data item.
		},
		axis: {
			x: false,
			y: {
				labelFormatter: (d) => d*100 + " %",
			},
		},
		tooltip: {
			title: (d) => `${d.year}`,
			items: [
				{
				    channel: 'y',
					field: 'percent',
					name: i18n.t('pages.dashboard.percent'),
					valueFormatter: (d) => d.toFixed(0) + " %",
				},
			],
		},
		label: {
			text: (d) => (d.value ? `${d.value.toFixed(0)}%` : ''),
			//position: 'middle',
			fill: '#fff',
		},
		style: {
			fill: (d) => getColor(d.type)
		},
  };

  return (
    <Card title={i18n.t('pages.dashboard.memberships_gender')}>
      <Column {...config} />
    </Card>
  );
};

export default DashboardMembershipsGender;
