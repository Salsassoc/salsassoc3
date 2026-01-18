import React from 'react'

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';
import MembershipsSearchForm from './MembershipsSearchForm.js';
import MembershipsResults from './MembershipsResults.js';

const MembershipsList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	const params = new URLSearchParams(window.location.search || '');
	const paramFiscalYearId = (params.has('fiscal_year_id') ? parseInt(params.get('fiscal_year_id')) : null);

	// Define data state
	const [items, setItems] = React.useState([]);
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [filter, setFilter] = React.useState({
		fiscalYearId: null,
	});
	const [loading, setLoading] = React.useState(true);

	// Data loading and initialization
	function loadData()
	{
    	setLoading(true);
		return loadFiscalYears()
			.finally(() => setLoading(false));
	}

	function loadMembershipsList()
	{
		let params = "";
		if (filter.fiscalYearId) {
			params += "&fiscal_year_id=" + filter.fiscalYearId;
		}
		// Sort by membership_date by default
		params += "&sort=date";
		let url = serviceInstance.createServiceUrl("/memberships/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.memberships || [];
				setItems(items);
			});
	}

	function loadFiscalYears(){
		const url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");
		return fetchJSON(url)
			.then((response) => {
				setFiscalYears(response.result.fiscal_years || []);
			});
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/memberships/delete?id="+record.id);

		let opts = {
			method: "DELETE"
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endRemoving();
				return loadData();
			})
			.catch((error) => {
				pageLoader.errorRemoving(error);
			});
	}

	// Compute layout data
	function getLayoutData()
	{
		// Set page title
		let pageTitle = i18n.t("pages.memberships.title");

		// Set page breadcrumb
		const pageBreadcrumb = [
		];

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageBreadcrumb: pageBreadcrumb
		}
		return layoutData;
	}

	// Rendering data
	function getTableHeaderExtra(serviceInstance)
	{
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/memberships/add")} />;
	}

	function onFormSearchFinished(values){
		setFilter({
			fiscalYearId: values.fiscal_year_id,
		});
	}

	// Reload list when filter changes
	React.useEffect(() => {
		if(fiscalYears && fiscalYears.length > 0){
			if(paramFiscalYearId){
				setFilter({ fiscalYearId: paramFiscalYearId });
			}else{
				const current = fiscalYears.find(y => y.is_current);
				if(current && filter.fiscalYearId == null){
					setFilter({ fiscalYearId: current.id });
				}
			}
		}
	}, [fiscalYears]);
	
	// Reload list when filter changes
	React.useEffect(() => {
		if(!loading){
			loadMembershipsList();
		}
	}, [filter]);

	const form = (
		<MembershipsSearchForm
			fiscalYears={fiscalYears}
			defaultFiscalYearId={filter.fiscalYearId}
			onFinish={onFormSearchFinished}
		/>
	);

	const tableContent = <MembershipsResults items={items} onConfirmRemove={onConfirmRemove} />;
	const tableActions = getTableHeaderExtra(serviceInstance);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<TCALayout
				title={i18n.t("pages.memberships.list", { count: (items ? items.length : 0) })}
				content={tableContent}
				form={form}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default MembershipsList;
