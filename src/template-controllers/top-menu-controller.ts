import TemplateController from "../template-controller";
import {select} from 'd3';
import {router, authenticator} from '../index';

export default class TopMenuTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

    activateRoute(container) {
        container.select('button.logout')
            .classed('dn', !authenticator.isAuthenticated())
            .on('click', () => {
                authenticator.logout();
                router.changeRoute('login');
            });
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