import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';
import i18n from '../../utils/i18n.js';
import dayjs from "dayjs";

const DashboardAverageAge = ({ fiscalYears = [], loading = false }) => {

	function getShortYear(year) {
		return dayjs(year.start_date).format('YYYY') + "/" + dayjs(year.end_date).format('YY');
	}

	const data = React.useMemo(() => {
		return [...(fiscalYears || [])]
			.reverse()
			.filter((y) => y.memberships_avg_age !== null && y.memberships_avg_age !== undefined)
			.map((y) => ({
				label: y.title,
				value: Number(y.memberships_avg_age),
				year_short: getShortYear(y)
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
		xField: 'year_short',
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
			x: {
				labelFormatter: (d) => d,
				//labelAutoRotate: false,
				//labelAutoWrap: true,
			},
			y: {
				labelFormatter: (d) => `${d} ${i18n.language === 'fr' ? 'ans' : 'y'}`,
			},
		},
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
