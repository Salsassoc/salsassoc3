import React from 'react'

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';
import MembersSearchForm from './MembersSearchForm.js';
import MembersResults from './MembersResults.js';

const MembersList = (props) => {

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
		gender: ''
	});
	const [loading, setLoading] = React.useState(true);

	// Data loading and initialization
	function loadData()
	{
    	setLoading(true);
		return loadFiscalYears()
			.finally(() => setLoading(false));
	}

	function loadMembersList()
	{
		let params = "";
		if (filter.fiscalYearId) {
			params += "&fiscal_year_id=" + filter.fiscalYearId;
		}
		if (filter.gender !== undefined && filter.gender !== null && filter.gender !== '') {
			params += "&gender=" + filter.gender;
		}
		let url = serviceInstance.createServiceUrl("/members/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.members;
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

		let url = serviceInstance.createServiceUrl("/members/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.members.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/members/add")} />;
	}

	function onFormSearchFinished(values){
		setFilter({
			fiscalYearId: values.fiscal_year_id,
			gender: values.gender
		});
	}

	// Default to current fiscal year when list is loaded
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

	// Reload when filter changes
	React.useEffect(() => {
		if(!loading){
			loadMembersList();
		}
	}, [filter]);

	const tableContent = <MembersResults items={items} onConfirmRemove={onConfirmRemove} />;

 	const form = (
		<MembersSearchForm
			fiscalYears={fiscalYears}
			defaultFiscalYearId={filter.fiscalYearId}
			defaultGender={filter.gender}
			onFinish={onFormSearchFinished}
		/>
	);

	const tableActions = getTableHeaderExtra(serviceInstance);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<TCALayout
				title={i18n.t("pages.members.list", { count: (items ? items.length : 0) })}
				content={tableContent}
				form={form}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default MembersList;
