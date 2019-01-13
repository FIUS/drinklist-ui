import TemplateController from "./template-controller";

export interface TemplateComponent {
    template: string;
    controller?: TemplateController;
    nested?: Map<string, TemplateComponent>;
}

export interface Route {
    templates: Map<string, TemplateComponent>;
    authenticated: boolean;
    needsKioskLogin: boolean;
    needsAdminLogin: boolean;
    allowKioskParamAccess: boolean;
    allowCurrentUserParamAccess: boolean;
    param?: string;
}
