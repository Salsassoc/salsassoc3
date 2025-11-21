import React from 'react';

import {Row, Col} from "antd";

import i18n from '../../utils/i18n.js';
import { AppContext } from '../../layout/AppContext.js';
import { fetchJSON } from '../../authentication/backend.js';
import PageContentLayout from '../../layout/PageContentLayout.js';

import DashboardMemberships from './DashboardMemberships.js';
import DashboardBalance from './DashboardBalance.js';

const Dashboard = () => {
  const appContext = React.useContext(AppContext);
  const serviceInstance = appContext.serviceInstance;

  const [fiscalYears, setFiscalYears] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  function loadData() {
    setLoading(true);
    const url = serviceInstance.createServiceUrl('/fiscal_years/list?order=desc');
    return fetchJSON(url)
      .then((resp) => {
        const list = resp.result.fiscal_years || [];
        setFiscalYears(list);
      })
      .finally(() => setLoading(false));
  }

  function getLayoutData() {
    const pageTitle = i18n.t('pages.dashboard.title');
    return { pageTitle, pageStatic: true };
  }

  const content = (
    <Row gutter={[16, 16]} style={{width: "100%"}}>
      <Col span={12}>
        <DashboardMemberships fiscalYears={fiscalYears} loading={loading} />
      </Col>
      <Col  span={12}>
        <DashboardBalance fiscalYears={fiscalYears} loading={loading} />
      </Col>
    </Row>
  );

  return (
    <PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
      {content}
    </PageContentLayout>
  );
};

export default Dashboard;
