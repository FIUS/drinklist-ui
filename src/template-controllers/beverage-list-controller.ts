import TemplateController from "../template-controller";
import {select} from 'd3';
import { getBeverageList } from "../api";
import { authenticator } from "..";
import { formatCurrency } from "../translate";

export default class BeverageListTemplateController implements TemplateController {

    activateRoute(container, parent: TemplateController) {
        console.log(parent)
        getBeverageList(authenticator.accessToken).then((beverages) => {
            const beverageSelection = container.select('.beverage-list')
                .selectAll('button.beverage').data(beverages, (d) => d.id);

            beverageSelection.exit().remove();
            beverageSelection.enter().append('button')
                .classed('beverage', true)
                .classed('flex', true)
                .attr('id', d => d.id)
                .call(beverageSelection => {
                    beverageSelection.append('i')
                        .classed('self-start', true)
                        .classed('fas', true)
                        .classed('fa-circle', true);
                    beverageSelection.append('span')
                        .classed('beverage-stock', true)
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
                    beverageSelection.select('.beverage-name').text(d => d.name);
                    beverageSelection.select('.beverage-prize').text(d => formatCurrency(d.price/100));
                    beverageSelection.select('.beverage-stock').text(d => `(${d.stock>99 ? '>99' : (d.stock<-99 ? '<-99' : d.stock)})`);
                });
        })
    }

    deactivateRoute(container) {

    }

}