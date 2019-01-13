import TemplateController from "../template-controller";
import {select, easeLinear, rgb} from 'd3';
import { getBeverageList, orderBeverage, createBeverage } from "../api";
import { authenticator } from "..";
import { formatCurrency } from "../translate";

export default class BeverageEditorTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

    private container;

    activateRoute(container, parent: TemplateController, param) {
        this.container = container;

        const self = this;

        container.select('form').on('submit', function() {
            const event = require('d3').event; // live binding needed!
            event.preventDefault();
            const form = select(this);
            const name = form.select('input.name').property('value');
            const price = parseInt(form.select('input.price').property('value'), 10);
            const stock = parseInt(form.select('input.stock').property('value'), 10);
            createBeverage(authenticator.accessToken, name, price, stock).then(self.updateRoute.bind(self), self.updateRoute.bind(self));
        });

        this.updateRoute();
    }

    updateRoute() {
        getBeverageList(authenticator.accessToken).then((beverages) => {
            const self = this;
            const beverageSelection = this.container.select('.beverages')
                .selectAll('.beverage').data(beverages, (d) => d.id);

            beverageSelection.exit().remove();
            beverageSelection.enter().append('div')
                .classed('beverage', true)
                .classed('flex', true)
                .classed('items-center', true)
                .classed('pa2', true)
                .classed('ma1', true)
                .classed('ba', true)
                .classed('br2', true)
                .classed('hover-bg-near-white', true)

                .attr('id', d => d.id)
                .call(beverageSelection => {
                    beverageSelection.append('i')
                        .classed('beverage-icon', true)
                        .classed('self-start', true)
                        .classed('fas', true)
                        .classed('fa-circle', true);
                    beverageSelection.append('span')
                        .classed('beverage-stock', true)
                        .classed('tc', true)
                        .classed('w3', true);
                    beverageSelection.append('span')
                        .classed('beverage-name', true)
                        .classed('flex-grow-1', true)
                        .classed('tl', true);
                    beverageSelection.append('span')
                        .classed('beverage-prize', true)
                        .classed('self-end', true)
                        .classed('ml2', true);
                })
              .merge(beverageSelection)
                .call((beverageSelection) => {
                    beverageSelection.select('.beverage-icon')
                        .classed('dark-green', d => d.stock > 10)
                        .classed('gold', d => d.stock < 10 && d.stock > 3)
                        .classed('dark-red', d => d.stock < 3);
                    beverageSelection.select('.beverage-name').text(d => d.name);
                    beverageSelection.select('.beverage-prize').text(d => formatCurrency(d.price/100));
                    beverageSelection.select('.beverage-stock')
                        .text(d => `(${d.stock>99 ? '>99' : (d.stock<-99 ? '<-99' : d.stock)})`);
                });
        })
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