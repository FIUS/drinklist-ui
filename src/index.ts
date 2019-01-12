import Router from "./router";
import {Route, TemplateComponent} from "./route";
import { Authentication } from "./authentication";
import LoginTemplateController from "./template-controllers/login-controller";
import ApiChooserTemplateController from "./template-controllers/api-chooser-controller";
import TopMenuTemplateController from "./template-controllers/top-menu-controller";

const routes = new Map<string, Route>();

const loginTemplates = new Map<string, TemplateComponent>();
loginTemplates.set('content', {template: 'login', controller: new LoginTemplateController()});
loginTemplates.set('footer', {template: 'api-chooser', controller: new ApiChooserTemplateController()});

const orderTemplates = new Map<string, TemplateComponent>();
orderTemplates.set('header', {template: 'top-menu', controller: new TopMenuTemplateController()});
orderTemplates.set('content', {template: 'order'});

routes.set('login', {
    templates: loginTemplates,
    authenticated: false,
    needsKioskLogin: false,
    needsAdminLogin: false,
});

routes.set('order', {
    templates: orderTemplates,
    authenticated: true,
    needsKioskLogin: false,
    needsAdminLogin: false,
});

export const authenticator = new Authentication()

export const router = new Router(routes, 'login', authenticator);

