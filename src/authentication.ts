import { Route } from "./route";

export interface LoginGuard {
    canAccess: (route: Route) => boolean;
    isAuthenticated: () => boolean;
}

export class Authentication implements LoginGuard {
    canAccess(route: Route) {
        return true;
    }
    isAuthenticated() {
        return false;
    }
}