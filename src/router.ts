import {select, Selection} from 'd3';
import { Route, TemplateComponent } from './route';
import { LoginGuard } from './authentication';
import translate from './translate';
import TemplateController from './template-controller';

export default class Router {
    private routes: Map<string, Route>;
    private loginRoute: string;
    private loginGuard: LoginGuard;

    private activeRoute: string;

    constructor(routes: Map<string, Route>, loginRoute: string, loginGuard: LoginGuard) {
        this.routes = routes;
        this.loginRoute = loginRoute;
        this.loginGuard = loginGuard;

        window.onhashchange = this.loadTemplateForHash.bind(this);

        if (!this.loginGuard.isAuthenticated()) {
            this.changeRoute(loginRoute);
        }
        window.setTimeout(this.loadTemplateForHash.bind(this), 1);
    }

    private getRoute(hash: string): Route {
        if (hash == null) {
            return null;
        }
        let route = this.routes.get(hash);
        if (route == null && hash.indexOf('/') >= 0) {
            route = this.routes.get(hash.substring(0, hash.indexOf('/') ));
        }
        return route;
    }

    changeRoute(page: string) {
        const loc = window.location;
        if (page !== loc.hash) {
            window.location.hash = page;
        }
    }

    private loadTemplateForHash() {
        const hash = window.location.hash.replace(/^#/, '');
        if (hash === this.activeRoute) {
            return;
        }
        const route = this.getRoute(hash);
        if (route == null) {
            if (hash !== this.loginRoute) {
                this.changeRoute(this.loginRoute);
            }
            return;
        }

        let routeParam;

        if (route.param != null) {
            if (hash.indexOf('/') >= 0) {
                routeParam = hash.substr(hash.indexOf('/') + 1);
            }
        }

        if (! this.loginGuard.canAccess(route, routeParam)) {
            if (routeParam != null) {
                this.changeRoute(hash.substring(0, hash.indexOf('/')));
            }
            if (hash !== this.loginRoute) {
                this.changeRoute(this.loginRoute);
            }
            return;
        }

        let lastRoute = this.getRoute(this.activeRoute);
        if (lastRoute != null) {
            this.deactivateTemplates(lastRoute.templates);
        }

        route.templates.forEach((template, containerId) => {
            const container = select<HTMLDivElement, any>(`div#${containerId}`);
            if (container.empty()) {
                console.log(`emplate container with id ${containerId} not found!`);
                return;
            }
            this.replaceTemplate(container, template, routeParam, null);
        });

        translate();

        this.activeRoute = hash;
    }

    private deactivateTemplates(templates: Map<string, TemplateComponent>, outerContainer?: Selection<HTMLDivElement, null, any, null>, parent?: TemplateController) {
        templates.forEach((prevTemplate, containerId) => {
            let container;
            if (outerContainer != null) {
                container = outerContainer.select<HTMLDivElement>(`div#${containerId}`);
            } else {
                container = select<HTMLDivElement, any>(`div#${containerId}`);
            }
            if (prevTemplate != null) {
                if (prevTemplate.nested != null) {
                    this.deactivateTemplates(prevTemplate.nested, container, prevTemplate.controller);
                }
                if (prevTemplate.controller != null) {
                    prevTemplate.controller.deactivateRoute(container);
                }
            }
        });
    }

    private replaceTemplate(container: Selection<HTMLDivElement, null, any, null>, template: TemplateComponent, param?: string, parentController?: TemplateController) {
        const templateSelection = select(`template#${template.template}`);
        if (templateSelection.empty()) {
            console.log(`Template ID ${template.template} not found!`);
            return;
        }

        const clone = document.importNode((templateSelection.node() as any).content, true);
        container.selectAll('*').remove();
        container.each(function() {
            (this as HTMLDivElement).append(clone);
        });

        if (template.controller != null) {
            template.controller.activateRoute(container, parentController, param);
        }

        if (template.nested != null) {
            template.nested.forEach((nestedTemplate, containerId) => {
                const innerContainer = container.select<HTMLDivElement>(`div#${containerId}`);
                this.replaceTemplate(innerContainer, nestedTemplate, param, template.controller);
            });
        }
    }
}