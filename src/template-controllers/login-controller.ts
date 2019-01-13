import TemplateController from "../template-controller";
import {select, easeElasticInOut} from 'd3';
import {router, authenticator} from '../index';

export default class LoginTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

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
                  .transition()
                    .duration(150)
                    .ease(easeElasticInOut)
                    .style('opacity', '1')
                  .transition()
                    .delay('5000')
                    .duration(750)
                    .ease(easeElasticInOut)
                    .style('opacity', '0');

            });
        });
        container.select('input.username').node().focus();
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