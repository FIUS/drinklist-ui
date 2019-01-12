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
                endpointMap.set(ref, new URL(root[ref], getApiUrl()));
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
                endpointMap.set(ref, new URL(auth[ref], getApiUrl()));
            }
        }
        completedRequests.add('auth');
        return auth;
    });
}

function callRef(ref: string, method: METHOD = METHOD.GET, data?, token?:string) {
    let url = endpointMap.get(ref);
    if (url == null) {
        if (!completedRequests.has('root')) {
            return getRoot().then(() => callRef(ref, method, data, token));
        } else  if (!completedRequests.has('auth')) {
            return getAuth().then(() => callRef(ref, method, data, token));
        }
    }
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
        requestInit.headers['X-Authentication'] = `Bearer ${token}`;
    }
    return json(url.href, requestInit);
}

export function login(username: string, password: string) {
    return callRef('login', METHOD.POST, {username: username, password: password});
}

export function refreshToken(token: string) {
    return callRef('refresh', METHOD.POST, null, token);
}
