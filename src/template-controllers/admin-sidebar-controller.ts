import TemplateController from "../template-controller";
import { authenticator, router } from "..";

export default class AdminSidebarTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

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
            console.log('USER');
        });
    }

    updateRoute() {

    }

    deactivateRoute(container) {

    }

    registerChild(controller) {
        this.children.add(controller);
    }

    removeChild(controller) {
        this.children.delete(controller);
    }

}