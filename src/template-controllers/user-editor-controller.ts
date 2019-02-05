import TemplateController from "../template-controller";
import {select, dispatch} from 'd3';
import { getBeverageList, orderBeverage, createBeverage, getUserList, deActivateUser, addAmountToUserBalance } from "../api";
import { authenticator } from "..";
import translate, { formatCurrency } from "../translate";

export default class UserEditorTemplateController implements TemplateController {

    private dispatcher;

    private users = [];
    private selected;

    private container;

    constructor() {
        this.dispatcher = dispatch('update');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container, parent: TemplateController, param) {
        this.container = container;

        const self = this;

        container.select('form.new-user').on('submit', function() {
            const event = require('d3').event; // live binding needed!
            event.preventDefault();
            const form = select(this);
            const username = form.select('input.username').property('value');
            // TODO
        });

        this.updateRoute();
    }

    updateRoute() {
        const oldSelected = this.selected;
        this.selected = null;
        this.dispatcher.call('update');
        getUserList(authenticator.accessToken).then((users) => {
            this.users = users.sort((a, b) => {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                }
                return 0;
            });
            if (oldSelected != null) {
                this.users.forEach((user) => {
                    if (user.name === oldSelected.name) {
                        this.selected = user;
                    }
                });
            }
            this.updateElements();
        }, (err) => console.log(err));
    }

    updateElements() {
        console.log(this.users)
        const users = this.container.select('.user-list').selectAll('button.user')
            .data(this.users, d => d.id);

        users.exit().remove();
        users.enter().append('button')
            .classed('user', true)
            .classed('f4', true)
            .classed('f3-ns', true)
            .classed('ma1', true)
            .classed('pa2', true)
            .classed('br2', true)
            .classed('pointer', true)
            .classed('grow', true)
            .classed('ba', true)
            .classed('hover-bg-near-white', true)
            .call(users => {
                users.append('span').classed('username', true);
            })
          .merge(users)
            .classed('deleted', d => !d.active)
            .classed('bg-white', d => d.active)
            .classed('bg-gold', (d) => this.selected != null && d.id === this.selected.id)
            .call(users => {
                users.select('.username')
                    .text(d => d.name);
            })
            .on('click', (d) => {
                if (this.selected != null && this.selected.id === d.id) {
                    this.selected = null;
                } else {
                    this.selected = d;
                }
                this.updateElements();
            });

        this.container.select('.update-user')
            .classed('dn', this.selected == null)
          .select('span.user').text(this.selected != null ? this.selected.name : '');
        this.container.select('button.toggle-active')
            .attr('data-translation', (this.selected != null && this.selected.active) ?
                    'user-editor.deactivate': 'user-editor.activate')
            .on('click', () => {
                if (this.selected == null) {
                    return;
                }
                deActivateUser(authenticator.accessToken, this.selected.name, !this.selected.active).then(() => {
                    this.updateRoute();
                }, (err) => {console.log(err);});
            });

        this.container.select('span.current-balance')
            .classed('red', this.selected != null && this.selected.balance < 0)
            .text(this.selected != null ? formatCurrency(this.selected.balance/100) : '–');

        const self = this;

        if (this.selected != null) {
            this.container.select('form.update-balance').on('submit', function() {
                if (self.selected == null) {
                    return;
                }
                const event = require('d3').event; // live binding needed!
                event.preventDefault();
                const form = select(this);
                const amount = parseInt(form.select('input.amount').property('value'), 10);
                const reason = form.select('input.reason').property('value');
                addAmountToUserBalance(authenticator.accessToken, self.selected.name, amount, reason).then(() => {
                    self.updateRoute();
                }, (err) => {console.log(err);});
            });
        } else {
            this.container.select('form.update-balance').on('submit', null);
        }

        translate();
    }

    deactivateRoute(container) {

    }

}