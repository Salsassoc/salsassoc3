import React, { Component } from 'react';

import User from '../models/User.js';

const AppContext = React.createContext();

class AppContextProvider extends Component {

    constructor(props) {
        super(props);

        let user = null;
        if(localStorage.getItem('user')) {
            user = new User(JSON.parse(localStorage.getItem('user')));
        }

        // Set default state
        this.state = {
            user: user,
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
