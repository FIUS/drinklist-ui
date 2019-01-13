import TemplateController from "../template-controller";
import {select, isoParse, easeBounce} from 'd3';
import { authenticator } from "..";
import { getTimeFormat, formatCurrency } from "../translate";
import { getTransactionHistory, revertOrder } from "../api";



export default class TransactionHistoryTemplateController implements TemplateController {

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
        const timeParser = getTimeFormat();
        const timeFormatter = timeParser.format('%c');
        getTransactionHistory(authenticator.accessToken, this.username).then(history => {
            history.sort((a, b) => {
                if (a.timestamp > b.timestamp) {
                    return -1;
                } else if (a.timestamp < b.timestamp) {
                    return 1;
                }
                return 0;
            });
            const cancelled = new Set<number>();
            history.forEach(transaction => {
                if (transaction.cancels != null && transaction.cancels.id != null) {
                    cancelled.add(transaction.cancels.id);
                }
            });
            const historySelection = this.container.select('.transaction-history')
                .selectAll('div.transaction').data(history, d => d.id);

            historySelection.exit().remove();
            historySelection.enter().append('div')
                .classed('transaction', true)
                .classed('flex', true)
                .attr('id', d => d.id)
                .call(historySelection => {
                    const outer = historySelection.append('div')
                        .classed('content', true)
                        .classed('flex', true)
                        .classed('flex-column', true)
                        .classed('flex-grow-1', true);
                    const firstRow = outer.append('div')
                        .classed('flex', true);
                    firstRow.append('span').classed('timestamp', true);
                    firstRow.append('span').classed('reason', true);
                    firstRow.append('span').classed('amount', true);
                    outer.append('div').classed('beverages', true).classed('flex', true).classed('flex-grow-1', true);
                    historySelection.append('div')
                        .classed('return', true)
                        .classed('w3', true)
                        .classed('black', true)
                        .classed('no-underline', true)
                        .classed('flex', true)
                        .classed('justify-center', true)
                        .classed('items-center', true)
                      .append('i')
                        .classed('fas', true)
                        .classed('fa-undo', true);
                })
              .merge(historySelection)
                .call(historySelection => {
                    historySelection.select('.content')
                        .classed('dark-green', d => d.amount > 0)
                        .classed('o-50', d => cancelled.has(d.id))
                        .classed('strike', d => cancelled.has(d.id))
                    historySelection.select('.timestamp')
                        .classed('mr3', true)
                        .text(d => {
                            let parsed = new Date().setUTCSeconds(d.timestamp);
                            return timeFormatter(parsed);
                        });
                    historySelection.select('.reason')
                        .classed('mr3', true)
                        .classed('flex-grow-1', true)
                        .text(d => d.reason);
                    historySelection.select('.amount')
                        .classed('w4', true)
                        .classed('tr', true)
                        .classed('dark-red', d => d.amount < 0)
                        .classed('dark-green', d => d.amount > 0)
                        .classed('b', d => d.amount > 0)
                        .text(d => '𝚺 = ' + formatCurrency(d.amount/100));
                    historySelection.select('.return>.fas')
                        .style('display', d => {
                            let past = new Date();
                            past = new Date(past.getTime() - (5 * 60 * 1000));
                            if (d.timestamp < past.getUTCSeconds()) {
                                if (! authenticator.isAdmin()) {
                                    return 'none';
                                }
                            }
                        })
                        .classed('pointer', true)
                        .classed('grow', true)
                        .on('click', (order) => {
                            revertOrder(authenticator.accessToken, this.username,  order).then(() => {
                                this.parent.updateRoute();
                            });
                        })
                      .transition()
                        .delay((d) => {
                            let past = new Date();
                            past = new Date(past.getTime() - (5* 60 * 1000) + 2000);
                            const time = d.timestamp;
                            if (time > past.getUTCSeconds()) {
                                return (time * 1000) - past.getTime();
                            } else {
                                return 0;
                            }
                        })
                        .duration(2000)
                        .ease(easeBounce)
                        .style('opacity', 0);
                }).each(function (d) {
                    const beverageSelection = select(this).select('.beverages')
                        .selectAll('div.beverage').data(d.beverages);

                    beverageSelection.exit().remove();
                    beverageSelection.enter()
                        .append('div')
                        .classed('beverage', true)
                        .classed('o-60', true)
                        .classed('flex', true)
                        .classed('flex-grow-1', true)
                        .call(beverageSelection => {
                            beverageSelection.append('div')
                                .classed('w2', true)
                                .classed('ml4', true)
                                .classed('mr2', true)
                                .classed('tr', true)
                                .classed('beverage-count', true);
                            beverageSelection.append('div')
                                .classed('flex-grow-1', true)
                                .classed('beverage-name', true);
                            beverageSelection.append('div')
                                .classed('w3', true)
                                .classed('beverage-price', true);
                        })
                      .merge(beverageSelection as any)
                        .call(beverageSelection => {
                            beverageSelection.classed('dark-green', d => (d as any).count > 0);
                            beverageSelection.select('.beverage-count').text(d => (d as any).count.toString() + ' x');
                            beverageSelection.select('.beverage-name').text(d => (d as any).beverage.name);
                            beverageSelection.select('.beverage-price').text(d => 'a ' + formatCurrency((d as any).price/100));
                        })
                });
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