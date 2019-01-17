import TemplateController from "../template-controller";
import {select, easeElasticInOut, dispatch} from 'd3';
import {router, authenticator} from '../index';
import translate from "../translate";

export default class LoginTemplateController implements TemplateController {

    private dispatcher;

    constructor() {
        this.dispatcher = dispatch('update');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container) {
        if (authenticator.isAuthenticated()) {
            router.changeRoute('order');
        }
        container.select('form').on('submit', function() {
            const event = require('d3').event; // live binding needed!

            event.preventDefault();
            const form = select(this);
            const username = form.select('input.username').property('value');
            const password = form.select('input.password').property('value');
            form.select('input.password').property('value', '');
            authenticator.login(username, password).then(() => {
                form.select('input.username').property('value', '');
                if (authenticator.isAdmin() || authenticator.isKiosk()) {
                    router.changeRoute('users');
                } else {
                    router.changeRoute('order');
                }
            }, (err) => {
                container.select('.error')
                    .attr('data-translation', err.message.startsWith('401') ? 'login.error' : 'login.api-error')
                  .transition()
                    .duration(150)
                    .ease(easeElasticInOut)
                    .style('opacity', '1')
                  .transition()
                    .delay('5000')
                    .duration(750)
                    .ease(easeElasticInOut)
                    .style('opacity', '0');
                translate();
            });
        });
        container.select('input.username').node().focus();
    }

    deactivateRoute(container) {

    }

}