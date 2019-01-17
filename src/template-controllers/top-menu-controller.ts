import TemplateController from "../template-controller";
import {select, dispatch} from 'd3';
import {router, authenticator} from '../index';

export default class TopMenuTemplateController implements TemplateController {

    private dispatcher;

    constructor() {
        this.dispatcher = dispatch('route');
    }

    getEventDispatcher = () => this.dispatcher;

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

}