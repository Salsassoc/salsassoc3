import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/plots';
import i18n from '../../utils/i18n.js';
import dayjs from "dayjs";

// Stacked column chart showing memberships renewal repartition per fiscal year
const DashboardMembershipsRenewal = ({ fiscalYears = [], loading = false }) => {

	function getColor(type) {
		if (type === 'new'){
			return '#52c41a'; // green
		}
		if (type === 'last_year'){
			return '#1890ff'; // blue
		}
		return '#faad14'; // orange for older
	}

	function getShortYear(year) {
		return dayjs(year.start_date).format('YYYY') + "/" + dayjs(year.end_date).format('YY');
	}

	const data = React.useMemo(() => {
		const out = [];
		const years = [...(fiscalYears || [])].reverse();
		years.forEach((y) => {
			const total = Number(y.membership_count || 0);
			const r = y.memberships_renewal || { new: 0, last_year: 0, older: 0 };
			const n = Number(r.new || 0);
			const ly = Number(r.last_year || 0);
			const od = Number(r.older || 0);
			const toPercent = (n) => (total > 0 ? (n * 100) / total : 0);
			out.push(
				{ label: y.title, type: 'new', value: toPercent(n), total: n, color: getColor('new'), year: y.title, year_short: getShortYear(y) },
				{ label: y.title, type: 'last_year', value: toPercent(ly), total: ly, color: getColor('last_year'), year: y.title, year_short: getShortYear(y) },
				{ label: y.title, type: 'older', value: toPercent(od), total: od, color: getColor('older'), year: y.title, year_short: getShortYear(y) },
			);
		});
		return out;
	}, [fiscalYears]);

	if (loading) {
		return (
			<div style={{ marginBottom: 24 }}>
				<h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.memberships_renewal')}</h3>
				<div>{i18n.t('pages.dashboard.loading') || 'Loading...'}</div>
			</div>
		);
	}
	if (!data || data.length === 0) {
		return (
			<div style={{ marginBottom: 24 }}>
				<h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.memberships_renewal')}</h3>
				<div>{i18n.t('pages.dashboard.no_data') || 'No data'}</div>
			</div>
		);
	}

	function getTypeLabel(t) {
		if (t === 'new'){
			return i18n.t('pages.dashboard.memberships_renewal_new');
		}
		if (t === 'last_year'){
			return i18n.t('pages.dashboard.memberships_renewal_last_year');
		}
		return i18n.t('pages.dashboard.memberships_renewal_older');
	};

	const config = {
		data,
		xField: 'year_short',
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
			// Default legend is fine; series names resolved via color field
		},
		axis: {
			x: {
				labelFormatter: (d) => d,
				//labelAutoRotate: false,
				//labelAutoWrap: true,
			},
			y: {
				labelFormatter: (d) => d*100 + " %",
			},
		},
		tooltip: {
			title: (d) => `${d.year}`,
			items: [
				(datum, index, data, column) => ({
					name: getTypeLabel(datum.type),
					value: datum.total + " (" + datum.value.toFixed(0) + " %)",
				}),
			],
		},
		label: {
			text: (d) => (d.value ? `${d.value.toFixed(0)}%` : ''),
			//text: (d) => (d.total ? `${d.total}` : ''),
			fill: '#fff',
		},
		style: {
			fill: (d) => getColor(d.type),
		},
		color: (d) => getColor(d.type),
	};

	return (
		<Card title={i18n.t('pages.dashboard.memberships_renewal')}>
			<Column {...config} />
		</Card>
	);
};

export default DashboardMembershipsRenewal;
