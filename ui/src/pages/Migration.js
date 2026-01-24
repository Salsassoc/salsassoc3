import React from 'react';
import { Button, Table, Tag, Space, Alert } from 'antd';
import { AppContext } from '../layout/AppContext.js';
import { fetchJSON } from '../authentication/backend.js';
import i18n from '../utils/i18n.js';

const Migration = () => {
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;

	const [items, setItems] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [running, setRunning] = React.useState(false);
	const [error, setError] = React.useState(null);
	const [message, setMessage] = React.useState(null);

	function loadList() {
		setLoading(true);
		setError(null);
		const url = serviceInstance.createServiceUrl('/migrations/list');
		return fetchJSON(url)
			.then((res) => {
				const list = (res.result && res.result.migrations) ? res.result.migrations : [];
				// Safety: sort by num desc
				list.sort((a, b) => (b.num || 0) - (a.num || 0));
				setItems(list);
			})
			.catch((e) => setError(i18n.t('migrations.list.failure', { error: e?.message || String(e) })))
			.finally(() => setLoading(false));
	}

	function runMigrations() {
		setRunning(true);
		setError(null);
		setMessage(null);
		const url = serviceInstance.createServiceUrl('/migrations/migrate');
		const opts = { method: 'POST' };
		fetchJSON(url, opts)
			.then((res) => {
				const applied = (res.result && res.result.migrate && res.result.migrate.applied) || [];
				const skipped = (res.result && res.result.migrate && res.result.migrate.skipped) || [];
				setMessage(i18n.t('migrations.run.success', { applied: applied.length, skipped: skipped.length }));
				return loadList();
			})
			.catch((e) => {
				// Message d'erreur explicite lorsque /migrations/migrate échoue
				const errText = (typeof e?.toString === 'function') ? e.toString() : (e?.message || String(e));
				setError(i18n.t('migrations.run.failure', { error: errText }));
			})
			.finally(() => setRunning(false));
	}

	React.useEffect(() => {
		loadList();
	}, []);

	const columns = [
		{ title: i18n.t('migrations.columns.num'), dataIndex: 'num', key: 'num', width: 90 },
		{ title: i18n.t('migrations.columns.filename'), dataIndex: 'filename', key: 'filename' },
		{ title: i18n.t('migrations.columns.status'), key: 'passed', width: 140, render: (_, r) => (r.passed ? <Tag color="green">{i18n.t('migrations.status.passed')}</Tag> : <Tag>{i18n.t('migrations.status.pending')}</Tag>) },
		{ title: i18n.t('migrations.columns.dateUtc'), dataIndex: 'migration_date', key: 'migration_date', width: 220 },
	];

	return (
		<div style={{ padding: 16 }}>
			<h2 style={{ marginBottom: 12 }}>/migrations</h2>
			<p>{i18n.t('migrations.description')}</p>
			<Space style={{ marginBottom: 12 }}>
				<Button type="primary" onClick={runMigrations} loading={running}>
					{i18n.t('migrations.actions.run')}
				</Button>
				<Button onClick={loadList} disabled={running} loading={loading}>
					{i18n.t('common.refresh')}
				</Button>
			</Space>
			{error ? (
				<div style={{ marginBottom: 12 }}>
					<Alert type="error" message={error} />
				</div>
			) : null}
			{message ? (
				<div style={{ marginBottom: 12 }}>
					<Alert type="success" message={message} />
				</div>
			) : null}
			<Table
				rowKey={(r) => `${r.num}-${r.filename}`}
				dataSource={items}
				columns={columns}
				loading={loading}
				pagination={false}
			/>
		</div>
	);
};

export default Migration;
