import { Route } from "./route";
import { login, refreshToken } from "./api";

const JWT_TOKEN_KEY = 'DRINKLIST_JWT_TOKEN';
const JWT_REFRESH_TOKEN_KEY = 'DRINKLIST_JWT_REFRESH_TOKEN';

export interface LoginGuard {
    canAccess: (route: Route) => boolean;
    isAuthenticated: () => boolean;
}

export class Authentication implements LoginGuard {

    private tokenRefreshTask;

    private startWatchdog() {
        if (this.tokenRefreshTask == null) {
            this.tokenRefreshTask = window.setInterval(this.refreshAccessToken.bind(this), 60 * 1000);
        }
    }

    constructor() {
        if (this.isAuthenticated()) {
            this.startWatchdog();
        }
    }

    canAccess(route: Route): boolean {
        return true;
    }

    isAuthenticated(): boolean {
        const token = this.refreshToken;
        return (token != null) && (this.getTokenExpiration(token) > new Date());
    }

    isKiosk() {
        return this.isAuthenticated() && this.isKioskToken(this.refreshToken);
    }

    isAdmin() {
        return this.isAuthenticated() && this.isAdminToken(this.refreshToken);
    }

    get accessToken() {
        return localStorage.getItem(JWT_TOKEN_KEY);
    }

    get refreshToken() {
        return localStorage.getItem(JWT_REFRESH_TOKEN_KEY);
    }

    get username() {
        if (this.isAuthenticated()) {
            return this.getTokenUsername(this.refreshToken);
        }
        return null;
    }

    decodeToken(token: string) {
        return JSON.parse(atob(token.split('.')[1]));
    }

    getTokenExpiration(token: string) {
        const decoded = this.decodeToken(token);
        const exp = new Date(0);
        exp.setUTCSeconds(decoded.exp);
        return exp;
    }

    getTokenUsername(token: string) {
        const decoded = this.decodeToken(token);
        return decoded.identity;
    }

    isKioskToken(token: string) {
        const decoded = this.decodeToken(token);
        return decoded.user_claims === 2;
    }

    isAdminToken(token: string) {
        const decoded = this.decodeToken(token);
        return decoded.user_claims === 3;
    }

    login(username: string, password: string) {
        return login(username, password).then(tokens => {
            this.updateTokens(tokens);
            this.startWatchdog();
            return true;
        });
    }

    logout() {
        if (this.tokenRefreshTask != null) {
            window.clearInterval(this.tokenRefreshTask);
        }
        localStorage.removeItem(JWT_TOKEN_KEY);
        localStorage.removeItem(JWT_REFRESH_TOKEN_KEY);
    }

    refreshAccessToken() {
        let future = new Date()
        future = new Date(future.getTime() + (3 * 60 * 1000));
        const accessTokenExp = this.getTokenExpiration(this.accessToken);
        if (accessTokenExp > future) {
            return;
        }
        const token = this.refreshToken;
        const exp = this.getTokenExpiration(token);
        if (exp < future) {
            this.logout();
            return;
        }
        refreshToken(token).then(tokens => {
            this.updateTokens(tokens);
            return true;
        });
    }

    updateTokens(tokens) {
        if (tokens['access_token'] != null) {
            localStorage.setItem(JWT_TOKEN_KEY, tokens['access_token']);
        }
        if (tokens['refresh_token'] != null) {
            localStorage.setItem(JWT_REFRESH_TOKEN_KEY, tokens['refresh_token']);
        }
    }
}