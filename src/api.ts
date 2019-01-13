let endpointMap = new Map<string, URL>();

let completedRequests = new Set<string>();

import {json, geoNaturalEarth1} from 'd3';
import { callbackify } from 'util';
import { request } from 'http';

const API_URL_KEY = 'DRINKLIST_API_URL';

enum METHOD {
    GET='GET',
    PUT='PUT',
    POST='POST',
    DELETE='DELETE',
}

export function getApiUrl(): URL {
    const loc = window.location;
    const localStorageUrl = localStorage.getItem(API_URL_KEY);

    if (localStorageUrl != null) {
        return new URL(localStorageUrl);
    }

    const currentUrl = new URL(`${loc.protocol}${loc.hostname}`);
    currentUrl.port = '5000';

    return currentUrl;
}

export function setApiUrl(url: URL) {
    endpointMap = new Map<string, URL>();
    completedRequests = new Set<string>();
    if (url == null) {
        localStorage.removeItem(API_URL_KEY);
        return;
    }
    localStorage.setItem(API_URL_KEY, url.href);
}

function getRoot() {
    return json(getApiUrl().href).then((root) => {
        for (const ref in root) {
            if (root.hasOwnProperty(ref)) {
                const baseHref = getApiUrl().href.replace(/\/?$/, '/');
                endpointMap.set(ref, new URL(baseHref + root[ref].replace(/^\//, '')));
            }
        }
        completedRequests.add('root');
        return root;
    });
}

function getAuth() {
    return callRef('authentication').then((auth) => {
        for (const ref in auth) {
            if (auth.hasOwnProperty(ref)) {
                const baseHref = getApiUrl().href.replace(/\/?$/, '/');
                endpointMap.set(ref, new URL(baseHref + auth[ref].replace(/^\//, '')));
            }
        }
        completedRequests.add('auth');
        return auth;
    });
}

function callRef(ref: string, suffix='', method: METHOD = METHOD.GET, data?, token?:string) {
    let url = endpointMap.get(ref);
    if (url == null) {
        if (!completedRequests.has('root')) {
            return getRoot().then(() => callRef(ref, suffix, method, data, token));
        } else  if (!completedRequests.has('auth')) {
            return getAuth().then(() => callRef(ref, suffix, method, data, token));
        }
    }
    return callUrl(url, suffix, method, data, token);
}

function callUrl(url: URL, suffix: string, method: METHOD, data: any, token: string) {
    const requestInit: RequestInit = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        }
    };
    if (data != null) {
        requestInit.body = JSON.stringify(data);
    }
    if (token != null) {
        requestInit.headers['Authorization'] = `Bearer ${token}`;
    }
    if (suffix == null) {
        suffix = '';
    }
    return json(url.href.replace(/\/?$/, '/') + suffix.replace(/^\//, ''), requestInit);
}

export function login(username: string, password: string) {
    return callRef('login', '', METHOD.POST, {username: username, password: password});
}

export function refreshToken(token: string) {
    return callRef('refresh', '', METHOD.POST, null, token);
}

export function getBeverageList(token: string) {
    return callRef('beverages', '', METHOD.GET, null, token);
}

export function getUser(token: string, username: string) {
    return callRef('users', username + '/', METHOD.GET, null, token);
}

export function getTransactionHistory(token: string, username: string) {
    return callRef('users', username + '/transactions/', METHOD.GET, null, token);
}

export function orderBeverage(token: string, username: string, beverage) {
    return callRef('users', username + '/transactions/', METHOD.POST, {
        beverages: [{
            beverage: beverage,
            count: -1,
        }],
        amount: 0,
        reason: beverage.name
    }, token);
}

export function revertOrder(token: string, username: string, order) {
    return callRef('users', username + '/transactions/' + order.id + '/', METHOD.DELETE, {reason: 'User undo'}, token);
}
