let apiUrl;

const API_URL_KEY = 'API_URL';

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
    if (url == null) {
        localStorage.removeItem(API_URL_KEY);
        return;
    }
    localStorage.setItem(API_URL_KEY, url.href);
}
