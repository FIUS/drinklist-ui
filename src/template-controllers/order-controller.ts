import TemplateController from "../template-controller";
import {select} from 'd3';
import { authenticator, router } from "..";
import { getUser } from "../api";
import { formatCurrency } from "../translate";

export default class OrderTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

    private username: string;

    private container;
    private userObject;

    activateRoute(container, parent, param) {
        if (param != null && authenticator.isAdmin() || authenticator.isKiosk()) {
            this.username = param;
        } else {
            this.username = authenticator.username;
        }
        this.container = container;

        const canGoBack = authenticator.isAdmin() || authenticator.isKiosk();

        container.select('button.back')
            .classed('dn', !canGoBack)
            .classed('flex', canGoBack)
            .on('click', () => {
                router.changeRoute('users');
            });

        this.updateUserInfo();
    }

    updateRoute() {
        this.children.forEach(child => {if (child.updateRoute != null) {child.updateRoute();}});
        this.updateUserInfo
    }

    private updateUserInfo() {
        getUser(authenticator.accessToken, this.username).then(user => {
            this.userObject = user;
            this.container.select('.balance-container')
                .classed('red', this.userObject.balance < 0 && this.userObject.balance > -4999)
                .classed('bg-red', this.userObject.balance < -4999)
                .classed('dark-green', this.userObject.balance > 999);
            this.container.select('.balance')
                .text(formatCurrency(this.userObject.balance/100));
            this.container.select('.username')
                .text(this.username);
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