import TemplateController from "../template-controller";
import {select} from 'd3';
import { authenticator } from "..";
import { getUser } from "../api";
import { formatCurrency } from "../translate";

export default class OrderTemplateController implements TemplateController {

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
        getUser(authenticator.accessToken, this.username).then(user => {
            this.userObject = user;
            this.updateUserInfo();
        });
    }

    private updateUserInfo() {
        this.container.select('.balance-container')
            .classed('red', this.userObject.balance < 0 && this.userObject.balance > -4999)
            .classed('bg-red', this.userObject.balance < -4999)
            .classed('dark-green', this.userObject.balance > 999);
        this.container.select('.balance')
            .text(formatCurrency(this.userObject.balance/100));
        this.container.select('.username')
            .text(this.username);
    }

    deactivateRoute(container) {

    }

}