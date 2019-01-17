import TemplateController from "../template-controller";
import {select, dispatch} from 'd3';
import { getBeverageList, orderBeverage, createBeverage } from "../api";
import { authenticator } from "..";
import { formatCurrency } from "../translate";

export default class BeverageEditorTemplateController implements TemplateController {

    private dispatcher;

    private selected;

    private container;

    constructor() {
        this.dispatcher = dispatch('update', 'beverage');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container, parent: TemplateController, param) {
        this.container = container;

        this.dispatcher.on('beverage.click', (type: string, beverage) => {
            if (type === 'click') {
                if (this.selected != null && this.selected.id === beverage.id) {
                    this.selected = null;
                } else {
                    this.selected = beverage;
                }
                this.dispatcher.call('beverage', null, 'select', this.selected);
                this.updateForm();
            }
        });

        const self = this;

        container.select('form').on('submit', function() {
            const event = require('d3').event; // live binding needed!
            event.preventDefault();
            const form = select(this);
            const name = form.select('input.name').property('value');
            const price = parseInt(form.select('input.price').property('value'), 10);
            const stock = parseInt(form.select('input.stock').property('value'), 10);
            if (this.selected == null) {
                createBeverage(authenticator.accessToken, name, price, stock).then(self.updateRoute.bind(self), self.updateRoute.bind(self));
            } else {
                //TODO
            }
        });

        container.select('button.delete').on('click', () => {
            if (this.selected != null) {
                //TODO
            }
        });

        this.updateForm();
    }

    updateRoute() {
        this.selected = null;
        this.dispatcher.call('update');
        this.updateForm();
    }

    updateForm() {
        this.container.select('form input.name').property('value', this.selected != null ? this.selected.name: '');
        this.container.select('form input.price').property('value', this.selected != null ? this.selected.price: '');
        this.container.select('form input.stock').property('value', this.selected != null ? this.selected.stock: '');
        this.container.select('form button.new').classed('dn', this.selected != null);
        this.container.select('form button.edit').classed('dn', this.selected == null);
        this.container.select('button.delete').classed('dn', this.selected == null);
    }

    deactivateRoute(container) {

    }

}