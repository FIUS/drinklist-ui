import TemplateController from "../template-controller";
import {select, dispatch} from 'd3';
import { getUserList } from "../api";
import { authenticator, router } from "..";

export default class UserChooserTemplateController implements TemplateController {

    private dispatcher;

    private container;

    private users = [];

    private searchstring: string;

    private activeUsers = [];

    constructor() {
        this.dispatcher = dispatch('route');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container, parent: TemplateController, param) {
        this.container = container;

        this.users = [];
        this.activeUsers = [];
        this.searchstring = '';

        const self = this;

        container.select('input.user-search')
            .on('focus', function() {
                select(this).property('value', '');
            })
            .on('input', function() {
                self.searchstring = select(this).property('value');
                self.updateRoute.bind(self)();
            })
            .on('keydown.Enter', () => {
                const event = require('d3').event; // live binding needed!

                if (event.code !== 'Enter') {
                    return;
                }
                if (this.activeUsers != null && this.activeUsers.length == 1) {
                    router.changeRoute(`order/${this.activeUsers[0].name}`)
                }
            })
            .node().focus();

        getUserList(authenticator.accessToken).then(users => {
            users.sort((a, b) => {
                if (a.active === b.active) {
                    if (a.name > b.name) {
                        return 1;
                    } else if (a.name < b.name) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
                if (a.active) {
                    return -1;
                }
                if (b.active) {
                    return 1;
                }
            });
            this.users = users;
            this.updateRoute();
        });
    }

    updateRoute() {

        const filterUsername = d => {
            if (d.active) {
                if ((this.searchstring == null || this.searchstring == '')) {
                    return true;
                }
                if (d.name.toLowerCase().includes(this.searchstring.toLowerCase())) {
                    return true;
                }
            }
            return false;
        }

        const users = this.container.select('.users').selectAll('button.user')
            .data(this.users, d => d.id);

        users.exit().remove();
        users.enter().append('button')
            .classed('user', true)
            .classed('f3', true)
            .classed('ma1', true)
            .classed('pa3', true)
            .classed('bn', true)
            .classed('br2', true)
            .call(users => {
                users.append('span').classed('username', true);
            })
          .merge(users)
            .classed('pointer', d => d.active)
            .classed('grow', d => d.active)
            .attr('disabled', d => !d.active ? true : null)
            .classed('bg-gold', filterUsername)
            .classed('active', filterUsername)
            .call(users => {
                users.select('.username')
                    .text(d => d.name);
            })
            .on('click', (d) => {
                router.changeRoute(`order/${d.name}`)
            });

        let activeUsers = [];
        this.users.forEach(user => {
            if (filterUsername(user)) {
                activeUsers.push(user);
            }
        });
        this.activeUsers = activeUsers;
    }

    deactivateRoute(container) {
    }

}