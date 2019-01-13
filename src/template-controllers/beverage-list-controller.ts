import TemplateController from "../template-controller";
import {select, easeLinear, rgb} from 'd3';
import { getBeverageList, orderBeverage } from "../api";
import { authenticator } from "..";
import { formatCurrency } from "../translate";

export default class BeverageListTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

    private username: string;

    private parent: TemplateController;

    private container;

    activateRoute(container, parent: TemplateController, param) {
        if ((parent as any).username != null) {
            this.username = (parent as any).username;
        } else if (param != null) {
            this.username = param;
        } else {
            this.username = authenticator.username;
        }
        this.parent = parent;
        this.container = container;
        this.updateRoute();
    }

    updateRoute() {
        getBeverageList(authenticator.accessToken).then((beverages) => {
            const self = this;
            const beverageSelection = this.container.select('.beverage-list')
                .selectAll('button.beverage').data(beverages, (d) => d.id);

            beverageSelection.exit().remove();
            beverageSelection.enter().append('button')
                .classed('beverage', true)
                .classed('flex', true)
                .classed('pa2', true)
                .classed('ma1', true)
                .classed('ba', true)
                .classed('br2', true)
                .classed('grow', true)
                .classed('pointer', true)
                .classed('bg-white', true)
                .classed('hover-bg-near-white', true)

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
                })
                .on('click', function(d) {
                    const button = select(this);
                    button.attr('disabled', true);
                    const bTransition = button.transition('bg')
                        .duration(1000)
                        .ease(easeLinear)
                        .style('background-color', rgb(130, 130, 255) as any);
                    orderBeverage(authenticator.accessToken, self.username, d).then(() => {
                        self.updateParent();
                        bTransition.selection().interrupt();
                        button.transition()
                            .duration(500)
                            .style('background-color', rgb(130, 255, 130) as any)
                          .transition()
                            .duration(500)
                            .style('background-color', null);
                        button.attr('disabled', null);
                    }, () => {
                        self.updateParent();
                        bTransition.selection().interrupt();
                        button.transition()
                            .duration(500)
                            .style('background-color', rgb(255, 130, 130) as any)
                          .transition()
                            .duration(500)
                            .style('background-color', null);
                        button.attr('disabled', null);
                    });
                });
        })
    }

    private updateParent() {
        window.setTimeout(() => {
            this.parent.updateRoute();
        }, 50);
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