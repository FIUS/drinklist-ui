import Router from "./router";
import {Route, TemplateComponent} from "./route";
import { Authentication } from "./authentication";
import LoginTemplateController from "./template-controllers/login-controller";
import ApiChooserTemplateController from "./template-controllers/api-chooser-controller";
import TopMenuTemplateController from "./template-controllers/top-menu-controller";
import BeverageListTemplateController from "./template-controllers/beverage-list-controller";
import OrderTemplateController from "./template-controllers/order-controller";
import TransactionHistoryTemplateController from "./template-controllers/transaction-history-controller";
import UserChooserTemplateController from "./template-controllers/user-chooser-controller";

const routes = new Map<string, Route>();

const loginTemplates = new Map<string, TemplateComponent>();
loginTemplates.set('content', {template: 'login', controller: new LoginTemplateController()});
loginTemplates.set('footer', {template: 'api-chooser', controller: new ApiChooserTemplateController()});


const nestedOrderTemplates = new Map<string, TemplateComponent>();
nestedOrderTemplates.set('beverage-list-container', {template: 'beverage-list', controller: new BeverageListTemplateController()});
nestedOrderTemplates.set('transaction-history-container', {template: 'transaction-history', controller: new TransactionHistoryTemplateController()});

const orderTemplates = new Map<string, TemplateComponent>();
orderTemplates.set('header', {template: 'top-menu', controller: new TopMenuTemplateController()});
orderTemplates.set('content', {template: 'order', controller: new OrderTemplateController(), nested: nestedOrderTemplates});

const usersTemplates = new Map<string, TemplateComponent>();
usersTemplates.set('header', {template: 'top-menu', controller: new TopMenuTemplateController()});
usersTemplates.set('content', {template: 'user-chooser', controller: new UserChooserTemplateController()});


routes.set('login', {
    templates: loginTemplates,
    authenticated: false,
    needsKioskLogin: false,
    needsAdminLogin: false,
    allowKioskParamAccess: false,
    allowCurrentUserParamAccess: false,
});

routes.set('order', {
    templates: orderTemplates,
    authenticated: true,
    needsKioskLogin: false,
    needsAdminLogin: false,
    allowKioskParamAccess: true,
    allowCurrentUserParamAccess: true,
    param: 'username',
});

routes.set('users', {
    templates: usersTemplates,
    authenticated: true,
    needsKioskLogin: true,
    needsAdminLogin: false,
    allowKioskParamAccess: false,
    allowCurrentUserParamAccess: false,
    param: 'username',
});



export const authenticator = new Authentication()

export const router = new Router(routes, 'login', authenticator);

