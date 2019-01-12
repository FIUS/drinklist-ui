import TemplateController from "./template-controller";

export interface TemplateComponent {
    template: string;
    controller?: TemplateController;
}

export interface Route {
    templates: Map<string, TemplateComponent>;
    authenticated: boolean;
    needsKioskLogin: boolean;
    needsAdminLogin: boolean;
    routeController?: TemplateController;
}
