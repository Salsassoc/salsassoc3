import React from 'react';
import { Button, Table, Tag, Space, Alert } from 'antd';
import { AppContext } from '../layout/AppContext.js';
import { fetchJSON } from '../authentication/backend.js';

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
			.catch((e) => setError(e?.message || String(e)))
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
				setMessage(`Migrations appliquées: ${applied.length}, ignorées: ${skipped.length}`);
				return loadList();
			})
			.catch((e) => setError(e?.message || String(e)))
			.finally(() => setRunning(false));
	}

	React.useEffect(() => {
		loadList();
	}, []);

	const columns = [
		{ title: 'Num', dataIndex: 'num', key: 'num', width: 90 },
		{ title: 'Fichier', dataIndex: 'filename', key: 'filename' },
		{ title: 'Statut', key: 'passed', width: 140, render: (_, r) => (r.passed ? <Tag color="green">Passée</Tag> : <Tag>En attente</Tag>) },
		{ title: 'Date (UTC)', dataIndex: 'migration_date', key: 'migration_date', width: 220 },
	];

	return (
		<div style={{ padding: 16 }}>
			<h2 style={{ marginBottom: 12 }}>/migrations</h2>
			<p>Liste des migrations disponibles et leur statut.</p>
			<Space style={{ marginBottom: 12 }}>
				<Button type="primary" onClick={runMigrations} loading={running}>
					Exécuter les migrations
				</Button>
				<Button onClick={loadList} disabled={running} loading={loading}>
					Rafraîchir
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
