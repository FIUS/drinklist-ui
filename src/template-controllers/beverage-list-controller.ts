import TemplateController from "../template-controller";
import { easeLinear, rgb } from 'd3';
import { getBeverageList } from "../api";
import { authenticator } from "..";
import { formatCurrency } from "../translate";

export default class BeverageListTemplateController implements TemplateController {

    private parent: TemplateController;

    private beverages = [];

    private container;

    getEventDispatcher = () => {
        if (this.parent != null) {
            return this.parent.getEventDispatcher();
        }
    };

    activateRoute(container, parent: TemplateController, param) {
        this.parent = parent;
        const dispatcher = this.getEventDispatcher();
        if (dispatcher != null) {
            dispatcher.on('update.beverageList', () => {
                this.updateRoute();
            });
            try {
                dispatcher.on('beverage.select', (type: string, beverage) => {
                    if (type === 'select') {
                        this.container.selectAll('button.beverage')
                            .classed('bg-gold', false)
                            .classed('bg-white', true);
                        if (beverage != null) {
                            this.container.select(`#beverage_${beverage.id}`)
                                .classed('bg-gold', true)
                                .classed('bg-white', false);
                        }
                    }
                });
            } catch (Error) {}
            try {
                dispatcher.on('order.beverageList', (type: string, beverage) => {
                    if (type === 'start') {
                        this.startOrderAnimation(beverage);
                    } else if (type === 'success') {
                        this.stopOrderAnimation(beverage, true);
                    } else if (type === 'error') {
                        this.stopOrderAnimation(beverage, false);
                    }
                });
            } catch (Error) {}
        }
        this.container = container;
        this.updateRoute();
    }

    updateRoute() {
        getBeverageList(authenticator.accessToken).then((beverages) => {
            this.beverages = beverages;
            this.updateBeverages();
        });
    }

    updateBeverages() {
        const self = this;
        const beverageSelection = this.container.select('.beverage-list')
            .selectAll('button.beverage').data(this.beverages, (d) => d.id);

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

            .attr('id', d => `beverage_${d.id}`)
            .call(beverageSelection => {
                beverageSelection.append('i')
                    .classed('beverage-icon', true)
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
                beverageSelection.select('.beverage-icon')
                    .classed('dark-green', d => d.stock > 10)
                    .classed('gold', d => d.stock <= 10 && d.stock > 3)
                    .classed('dark-red', d => d.stock <= 3);
                beverageSelection.select('.beverage-name').text(d => d.name);
                beverageSelection.select('.beverage-prize').text(d => formatCurrency(d.price/100));
                beverageSelection.select('.beverage-stock')
                    .text(d => `(${d.stock>99 ? '>99' : (d.stock<-99 ? '<-99' : d.stock)})`);
            })
            .on('click', function(d) {
                this.blur();
                const dispatcher = self.getEventDispatcher()
                if (dispatcher != null) {
                    dispatcher.call('beverage', null, 'click', d);
                }
            });
    }

    deactivateRoute(container) {

    }

    private startOrderAnimation(beverage) {
        const button = this.container.select(`button.beverage#beverage_${beverage.id}`);
        button.attr('disabled', true);
        button.interrupt();
        button.transition('bg')
            .duration(1000)
            .ease(easeLinear)
            .style('background-color', rgb(130, 130, 255) as any);
    }

    private stopOrderAnimation(beverage, success: boolean) {
        const color: any = success ? rgb(130, 255, 130) : rgb(255, 130, 130);
        const button = this.container.select(`button.beverage#beverage_${beverage.id}`);
        button.attr('disabled', true);
        button.interrupt();
        button.transition()
            .duration(500)
            .style('background-color', color)
          .transition()
            .duration(500)
            .style('background-color', null);
        button.attr('disabled', null);
    }

}