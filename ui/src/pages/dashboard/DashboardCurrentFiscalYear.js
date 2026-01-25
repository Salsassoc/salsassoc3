import React from 'react';
import { Card, Descriptions } from 'antd';
import dayjs from 'dayjs';
import i18n from '../../utils/i18n.js';
import CurrencyText from "../common/CurrencyText.js";

const DashboardCurrentFiscalYear = ({ fiscalYear, loading = false }) => {
  if (loading) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.current_fiscal_year_title') || ''}</h3>
        <div>{i18n.t('pages.dashboard.loading') || 'Loading...'}</div>
      </div>
    );
  }
  if (!fiscalYear) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{i18n.t('pages.dashboard.current_fiscal_year_title') || ''}</h3>
        <div>{i18n.t('pages.dashboard.no_data') || 'No data'}</div>
      </div>
    );
  }

  const income = Number(fiscalYear.income_amount || 0);
  const outcome = Number(fiscalYear.outcome_amount || 0);
  const balance = income + outcome;

  const balanceColor = balance > 0 ? '#3f8600' : (balance < 0 ? '#cf1322' : undefined);

  const formatDate = (d) => {
    if(!d) return '';
    return dayjs(d, 'YYYY-MM-DD').format(i18n.t('common.date_format'));
  };

  const title = fiscalYear.title || i18n.t('pages.dashboard.current_fiscal_year_title') || '';

  return (
      <Card title={title} size="small">
          <Descriptions size="small" column={{xs:1, lg:3}} >
            <Descriptions.Item label={i18n.t('pages.dashboard.period')} span={2}>
              {formatDate(fiscalYear.start_date)} → {formatDate(fiscalYear.end_date)}
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.members')}>
              {Number(fiscalYear.membership_count || 0)}
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.income')}>
	            <CurrencyText value={income} />
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.outcome')}>
	            <CurrencyText value={outcome} />
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.balance')} span={3}>
	            <CurrencyText value={balance} colored={true} />
            </Descriptions.Item>
          </Descriptions>
      </Card>
  );
};

export default DashboardCurrentFiscalYear;
