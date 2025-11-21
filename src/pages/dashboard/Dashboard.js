import React from 'react';

import {Row, Col} from "antd";

import i18n from '../../utils/i18n.js';
import { AppContext } from '../../layout/AppContext.js';
import { fetchJSON } from '../../authentication/backend.js';
import PageContentLayout from '../../layout/PageContentLayout.js';

import DashboardMemberships from './DashboardMemberships.js';
import DashboardBalance from './DashboardBalance.js';
import DashboardCurrentFiscalYear from './DashboardCurrentFiscalYear.js';

const Dashboard = () => {
  const appContext = React.useContext(AppContext);
  const serviceInstance = appContext.serviceInstance;

  const [fiscalYears, setFiscalYears] = React.useState([]);
  const [currentFiscalYear, setCurrentFiscalYear] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  function loadData() {
    setLoading(true);

    return loadFiscalYears()
        .then(_result => loadFiscalYearCurrent())
        .finally(() => setLoading(false));
  }

  function loadFiscalYears()
  {
      let url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");

      return fetchJSON(url, null)
          .then((response) => {
            const list = response.result.fiscal_years || [];
            setFiscalYears(list);
          });
  }

  function loadFiscalYearCurrent()
  {
      let url = serviceInstance.createServiceUrl("/fiscal_years/current");

      return fetchJSON(url, null)
          .then((response) => {
            const fiscal_year = response.result.fiscal_year;
            setCurrentFiscalYear(fiscal_year)
          }).catch(() => setCurrentFiscalYear(null));
  }

  function getLayoutData() {
    const pageTitle = i18n.t('pages.dashboard.title');
    return { pageTitle, pageStatic: true };
  }

  const content = (
    <div style={{width: "100%"}}>
      <Row gutter={[16, 16]} style={{width: "100%"}}>
        <Col span={24}>
          <DashboardCurrentFiscalYear fiscalYear={currentFiscalYear} loading={loading} />
        </Col>
      </Row>
      <br/>
      <Row gutter={[16, 16]} style={{width: "100%"}}>
        <Col span={12}>
          <DashboardMemberships fiscalYears={fiscalYears} loading={loading} />
        </Col>
        <Col span={12}>
          <DashboardBalance fiscalYears={fiscalYears} loading={loading} />
        </Col>
      </Row>
    </div>
  );

  return (
    <PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
      {content}
    </PageContentLayout>
  );
};

export default Dashboard;
