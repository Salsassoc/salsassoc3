import React from 'react';

import i18n from '../utils/i18n.js';

import PageContentLayout from '../layout/PageContentLayout.js';

const Dashboard = () => {

    function loadData()
    {
        return loadMonitoring()
            .then(_res => loadRecordingState())
            .then(_res => loadPreferences())
            .then(_res => loadUsers());
    }

	// Compute layout data
	function getLayoutData()
	{
		// Set page title
		let pageTitle = i18n.t("Dashboard_Title");

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageStatic: true,
		}
		return layoutData;
	}

	return (
	<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
		<h1>Welcome to Salsassoc!</h1>
		<p>This is your home page.</p>
	</PageContentLayout>
	);
};

export default Dashboard;