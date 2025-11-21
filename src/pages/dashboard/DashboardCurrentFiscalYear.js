import React from 'react';
import { Card, Descriptions } from 'antd';
import dayjs from 'dayjs';
import i18n from '../../utils/i18n.js';

function formatCurrency(value) {
  try {
    const n = Number(value || 0);
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
  } catch(_e){
    return (Number(value || 0)).toFixed(2) + ' €';
  }
}

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
          <Descriptions size="small" column={3} >
            <Descriptions.Item label={i18n.t('pages.dashboard.period') || 'Période'} span={2}>
              {formatDate(fiscalYear.start_date)} → {formatDate(fiscalYear.end_date)}
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.members') || 'Adhésions'}>
              {Number(fiscalYear.membership_count || 0)}
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.income') || 'Recettes'}>
              {formatCurrency(income)}
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.outcome') || 'Dépenses'}>
              {formatCurrency(outcome)}
            </Descriptions.Item>
            <Descriptions.Item label={i18n.t('pages.fiscal_years.balance') || 'Balance'} span={3}>
              <span style={{ color: balanceColor }}>{formatCurrency(balance)}</span>
            </Descriptions.Item>
          </Descriptions>
      </Card>
  );
};

export default DashboardCurrentFiscalYear;
