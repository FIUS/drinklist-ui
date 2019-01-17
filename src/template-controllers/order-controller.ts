import TemplateController from "../template-controller";
import {select, dispatch} from 'd3';
import { authenticator, router } from "..";
import { getUser, orderBeverage } from "../api";
import { formatCurrency } from "../translate";

export default class OrderTemplateController implements TemplateController {

    private dispatcher;

    private username: string;

    private container;
    private userObject;

    constructor() {
        this.dispatcher = dispatch('update', 'beverage', 'order', 'history');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container, parent, param) {
        if (param != null && authenticator.isAdmin() || authenticator.isKiosk()) {
            this.username = param;
        } else {
            this.username = authenticator.username;
        }
        this.container = container;

        this.dispatcher.on('beverage.click', (type: string, beverage) => {
            if (type === 'click') {
                orderBeverage(authenticator.accessToken, this.username, beverage).then(
                    () => {
                        this.dispatcher.call('order', null, 'success', beverage);
                        this.updateRoute();
                    },
                    (err) => {
                        this.dispatcher.call('order', null, 'error', beverage, err);
                    },
                );
            }
        });

        this.dispatcher.on('history', (type: string) => {
            if (type === 'update') {
                this.updateRoute();
            }
        });

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
        this.dispatcher.call('update');
        this.updateUserInfo;
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

}