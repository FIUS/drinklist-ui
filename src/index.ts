import Router from "./router";
import {Route, TemplateComponent} from "./route";
import { Authentication } from "./authentication";
import LoginTemplateController from "./login-controller";

const routes = new Map<string, Route>();

const loginTemplates = new Map<string, TemplateComponent>();
loginTemplates.set('content', {template: 'login', controller: new LoginTemplateController()});

routes.set('login', {
    templates: loginTemplates,
    authenticated: false,
    needsKioskLogin: false,
    needsAdminLogin: false,
});

const router = new Router(routes, 'login', new Authentication());

