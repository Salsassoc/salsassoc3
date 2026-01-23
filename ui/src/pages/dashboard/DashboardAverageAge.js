import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';
import i18n from '../../utils/i18n.js';

const DashboardAverageAge = ({ fiscalYears = [], loading = false }) => {
	const data = React.useMemo(() => {
		return [...(fiscalYears || [])]
			.reverse()
			.filter((y) => y.memberships_avg_age !== null && y.memberships_avg_age !== undefined)
			.map((y) => ({
				label: y.title,
				value: Number(y.memberships_avg_age),
			}));
	}, [fiscalYears]);

	if (loading) {
		return (
			<div style={{ marginBottom: 24 }}>
				<h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.average_age_trend')}</h3>
				<div>{i18n.t('pages.dashboard.loading') || 'Loading...'}</div>
			</div>
		);
	}
	if (!data || data.length === 0) {
		return (
			<div style={{ marginBottom: 24 }}>
				<h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.average_age_trend')}</h3>
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
			text: (d) => `${Number(d.value).toFixed(1)}`,
			textBaseline: 'bottom',
		},
		point: { size: 4, shape: 'circle' },
		xAxis: { title: { text: i18n.t('pages.dashboard.axis_year') || '' } },
		yAxis: { title: { text: i18n.t('pages.dashboard.axis_age') || '' } },
		axis: {
			x: false,
			y: {
				labelFormatter: (d) => `${d} ${i18n.language === 'fr' ? 'ans' : 'y'}`,
			},
		},
		height: 300,
		animation: false,
		tooltip: {
			items: [
				{
					channel: 'y',
					name: i18n.t('pages.dashboard.axis_age'),
					valueFormatter: (d) => `${Number(d).toFixed(1)}`,
				},
			],
		},
	};

	return (
		<Card title={i18n.t('pages.dashboard.average_age_trend')}>
			<Line {...config} />
		</Card>
	);
};

export default DashboardAverageAge;
