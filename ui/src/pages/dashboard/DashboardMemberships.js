import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/charts';
import i18n from '../../utils/i18n.js';
import dayjs from "dayjs";

const DashboardMemberships = ({ fiscalYears = [], loading = false }) => {

	function getShortYear(year) {
		return dayjs(year.start_date).format('YYYY') + "/" + dayjs(year.end_date).format('YY');
	}

	function getColor(type) {
		if (type === 'membership_only'){
			return '#faad14'; // green
		}
		if (type === 'course'){
			return '#1890ff'; // green
		}
		return 'red'; // orange for older
	}
	function getTypeLabel(t) {
		if (t === 'total'){
			return i18n.t('pages.members.membership_count');
		}
		if (t === 'course'){
			return i18n.t('pages.dashboard.membership_type_course');
		}
		if (t === 'membership_only'){
			return i18n.t('pages.dashboard.membership_type_only');
		}
		return undefined;
	};

	// Build two-series dataset: total memberships and course-enrolled memberships
	const data = React.useMemo(() => {
		const years = [...(fiscalYears || [])].reverse();
		const totalLabel = i18n.t('pages.members.membership_count');
		const courseLabel = i18n.t('models.cotisation.type_course');
		const rows = [];

		years.forEach((y) => {
			const yearShort = getShortYear(y);

			const membershipOnlyCount = (y.memberships_course_count == 0 ? 0 : y.membership_count - y.memberships_course_count);
			const membershipCourseCount = (y.memberships_course_count == 0 ? y.membership_count : y.memberships_course_count);

			rows.push({
				type: 'membership_only',
				label: y.title,
				year_short: yearShort,
				series: totalLabel,
				value: Number(membershipOnlyCount),
			});
			rows.push({
				type: 'course',
				label: y.title,
				year_short: yearShort,
				series: courseLabel,
				value: Number(membershipCourseCount),
				total: Number(y.membership_count || 0),
			});
		});
		return rows;
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
 		xField: 'year_short',
 		yField: 'value',
		stack: true,
 		label: {
 			//text: (d) => `${d.value}`,
		    text: (d) => (d.type === 'course' ? `${d.total}` : `${d.value}`),
 			textBaseline: 'bottom',
 		},
 		xAxis: {
			 title: {
				 text: i18n.t('pages.dashboard.axis_year') || '' }
	        },
 		yAxis: {
			 title: {
				 text: i18n.t('pages.dashboard.axis_value') || ''
			 }
	    },
 		axis: {
			x: {
				labelFormatter: (d) => d,
				//labelAutoRotate: false,
				//labelAutoWrap: true,
			},
		    y: {
			    labelFormatter: (d) => d,
		    },
 		},
		// Force course series to green color as requested
		tooltip: {
			title: (d) => `${d.label}`,
			items: [
				(datum, index, data, column) => ({
					name: getTypeLabel(datum.type),
					value: datum.value,
				}),
			],
		},
 		legend: { position: 'top' },
 		animation: false,
		style: {
			fill: (d) => getColor(d.type),
		},
		color: (d) => getColor(d.type),
 	};

  return (
    <Card title={i18n.t('pages.dashboard.memberships_trend')}>
      <Column {...config} />
    </Card>
  );
};

export default DashboardMemberships;
