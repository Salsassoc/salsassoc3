import Config from '../Config.js';
import ServiceInstance from '../utils/service-instance.js';
import {Buffer} from 'buffer';

import { FetchJsonResultError } from './backend.js';

export const userService = {
    login,
    logout,
    saveSetting,
    loadSetting
};

function stringToBase64(szData) {
    szData = encodeURIComponent(szData);
    return szData.replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
}

function login(username, password)
{
    let params = {
        method: "POST",
        headers: new Headers({
            'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64'),
            'Accept': 'application/json',
        })
    }

    const serviceInstance = new ServiceInstance(new Config());

    const url = serviceInstance.createServiceUrl("/authenticate");
    return fetch(url, params)
        .then(handleResponse)
        .then(user => {
            // login successful if there's a user in the response
            if (user) {
                // store user details and basic auth credentials in local storage 
                // to keep user logged in between page refreshes
                const authdata = window.btoa(stringToBase64(username + ':' + password));
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('authdata', authdata);
            }

            return user;
        });
}

function logout()
{
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('authdata');
}

function handleResponse(response)
{
    if (!response.ok) {
        if (response.status === 401) {
            // auto logout if 401 response returned from api
            logout();
            //location.reload(true);
        }

        return response.text().then(text => {
            throw new FetchJsonResultError(response, JSON.parse(text))
        });
    }

    return response.text().then(text => {
        const data = text && JSON.parse(text);
        const user = data.user;
        return user;
    });
    /*
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }


    console.log("handleResponse error");
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
    */
}

function saveSetting(key, value){
    let settings = JSON.parse(localStorage.getItem('settings'));
    if(!settings){
        settings = {};
    }
    settings[key] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
}

function loadSetting(key, defaultValue){
    let settings = JSON.parse(localStorage.getItem('settings'));
    if(settings && settings[key] !== undefined){
        return settings[key];
    }
    return defaultValue;
}
