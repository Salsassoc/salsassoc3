import React, { Component } from 'react';

import ServiceInstance from '../utils/service-instance.js';
import PageLoader from '../utils/PageLoader.js';

import Config from '../Config.js';

import User from '../models/User.js';

const AppContext = React.createContext();

class AppContextProvider extends Component {

    constructor(props) {
        super(props);

        // Service instance
        this.serviceInstance = new ServiceInstance(new Config());

        // Current user
        let user = null;
        if(localStorage.getItem('user')) {
            user = new User(JSON.parse(localStorage.getItem('user')));
        }

        // Define page loader
        let pageLoader = new PageLoader();
        pageLoader.setStatusHandler(this.handlePageLoaderStatus);

        // Set default state
        this.state = {
            user: user,
            pageLoader: pageLoader,
        };
    }

    setUser = (user) => {
        this.setState({
            user: user,
        });
    }

    clearUser = () => {
        this.setState({
            user: null,
        });
    }

    hasUser() {
        return localStorage.getItem('user');
    }

    render() {
        const value = {
            serviceInstance: this.serviceInstance,
            // Page loader
            pageLoader: this.state.pageLoader,
            setPageLoader: this.setPageLoader,
            // Session data
            user: this.state.user,
            setUser: this.setUser,
            clearUser: this.clearUser,
        }

        return (
            <AppContext.Provider value={value}>
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

export { AppContext };

export default AppContextProvider;
