import TemplateController from "../template-controller";
import {select, isoParse} from 'd3';
import { authenticator } from "..";
import { getTimeFormat, formatCurrency } from "../translate";
import { getTransactionHistory } from "../api";



export default class TransactionHistoryTemplateController implements TemplateController {

    private username: string;

    private container;

    activateRoute(container, parent: TemplateController, param) {
        if ((parent as any).username != null) {
            this.username = (parent as any).username;
        } else if (param != null) {
            this.username = param;
        } else {
            this.username = authenticator.username;
        }
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
                if (transaction.cancels != null) {
                    cancelled.add(transaction.cancels.id);
                }
            });
            const historySelection = this.container.select('.transaction-history')
                .selectAll('div.transaction').data(history, d => d.id);

            historySelection.exit().remove();
            historySelection.enter()
                .append('div')
                .classed('transaction', true)
                .attr('id', d => d.id)
                .call(historySelection => {
                    historySelection.append('span').classed('timestamp', true);
                    historySelection.append('span').classed('reason', true);
                    historySelection.append('div').classed('beverages', true).classed('flex', true).classed('flex-grow-1', true);
                })
              .merge(historySelection)
                .classed('flex', true)
                .call(historySelection => {
                    historySelection.classed('dark-green', d => d.reason === 'CANCEL')
                    historySelection.classed('o-50', d => cancelled.has(d.id))
                    historySelection.select('.timestamp')
                        .classed('mr3', true)
                        .text(d => {
                            let parsed = isoParse(d.timestamp);
                            return timeFormatter(parsed);
                        });
                    historySelection.select('.reason')
                        .classed('mr3', true)
                        .classed('w4', true)
                        .text(d => d.reason);
                }).each(function (d) {
                    const beverageSelection = select(this).select('.beverages')
                        .selectAll('div.beverage').data(d.beverages);
                        console.log(d)

                    beverageSelection.exit().remove();
                    beverageSelection.enter()
                        .append('div')
                        .classed('beverage', true)
                        .classed('flex', true)
                        .classed('flex-grow-1', true)
                        .call(beverageSelection => {
                            beverageSelection.append('div')
                                .classed('w2', true)
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
                            beverageSelection.classed('dark-green', d => (d as any).count < 0);
                            beverageSelection.select('.beverage-count').text(d => (d as any).count.toString() + ' x');
                            beverageSelection.select('.beverage-name').text(d => (d as any).beverage.name);
                            beverageSelection.select('.beverage-price').text(d => 'a ' + formatCurrency((d as any).price/100));
                        })
                });
        });
    }

    deactivateRoute(container) {

    }

}