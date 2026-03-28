import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Button, Card, Form, Input, Alert } from 'antd';

import i18n from '../utils/i18n.js';

import { userService } from '../authentication/user.service.js';

import {AppContext} from "../layout/AppContext.js";
import BaseLayout from '../layout/BaseLayout.js';

const Login = (props) =>
{
	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;

	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [userCount, setUserCount] = useState(null);

	useEffect(() => {
		const url = serviceInstance.createServiceUrl("/users/count");
		fetch(url)
			.then(res => res.json())
			.then(data => {
				setUserCount(data.count);
			})
			.catch(err => console.error("Failed to check user count", err));
	}, [serviceInstance]);

	function onFinish(values)
	{
		//event.preventDefault();
		const username = values.username;
		const password = values.password;

		// stop here if form is invalid
		if (!(username && password)) {
			return;
		}

		setError(null);
		setLoading(true);

		userService.login(username, password)
			.then(
				user => {
					//const objUser = new User(user);
					//appContext.setUser(objUser);
					setError(null);
					setLoading(false);
					const { from } = props.router.location.state || { from: { pathname: "/" } };
					props.router.navigate(from);
				},
				error => {
					let errorMessage = null;
					switch(error.statusCode){
					case 401:
						errorMessage = i18n.t('Login_Unauthorized'); break;
					case 503:
						errorMessage = i18n.t('Login_ServiceUnavailable'); break;
					default:
						errorMessage = i18n.t('Login_AuthenticationFailed'); break;
					}
					setError([errorMessage]);
					setLoading(false);
				}
			);
	};

	// Compute layout data
	const layoutData = {
		pageTitle: i18n.t("pages.login.login"),
		pageStatic: true,
	}

	// Handle dataObject update
	React.useEffect(() => {
		userService.logout();
		appContext.clearUser();
	}, []);

	return (
		<BaseLayout layoutData={layoutData}>
            <Layout.Content
                style={{
                    margin: '7px 0px 7px 0px',
                    padding: 0,
					align: "center"
                }}
            >
				<Card title={i18n.t("pages.login.login")} style={{ margin: 'auto', width: "100%", maxWidth: "450px" }}>
					{userCount === 0 && (
						<Alert
							type="info"
							message={i18n.t("pages.login.no_user")}
							description={
								<Link to="/initialize">{i18n.t("pages.login.create_first_user")}</Link>
							}
							style={{ marginBottom: 12 }}
						/>
					)}
					{error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
					<Form
						name="login"
						layout="vertical"
						initialValues={{ username: 'admin', password: 'password', remember: true }}
						onFinish={onFinish}
					>
						<Form.Item
							label={i18n.t("pages.login.username")}
							name="username"
							rules={[{ required: true, message: 'Please input your username!' }]}
						>
							<Input autoFocus />
						</Form.Item>
						<Form.Item
							label={i18n.t("pages.login.password")}
							name="password"
							rules={[{ required: true, message: 'Please input your password!' }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit" block loading={loading}>
							{i18n.t("pages.login.login")}
							</Button>
						</Form.Item>
					</Form>
				</Card>
            </Layout.Content>
		</BaseLayout>
	);
};

export default Login;