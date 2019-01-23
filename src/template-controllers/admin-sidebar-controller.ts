import TemplateController from "../template-controller";
import { authenticator, router } from "..";
import { dispatch } from "d3";

export default class AdminSidebarTemplateController implements TemplateController {

    private dispatcher;

    constructor() {
        this.dispatcher = dispatch('update');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container, parent, param) {
        const isAdmin = authenticator.isAdmin();

        container.select('div')
            .classed('dn', !isAdmin)
            .classed('flex', isAdmin);

        container.select('button.home').on('click', () => {
            router.changeRoute('users');
        });
        container.select('button.beverages').on('click', () => {
            router.changeRoute('beverage-editor');
        });
        container.select('button.users').on('click', () => {
            router.changeRoute('user-editor');
        });
    }

    updateRoute() {

    }

    deactivateRoute(container) {

    }

}