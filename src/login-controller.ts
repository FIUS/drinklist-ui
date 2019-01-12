import TemplateController from "./template-controller";
import {select} from 'd3';

export default class LoginTemplateController implements TemplateController {

    activateRoute(container) {
        console.log('HI')
        container.select('form').on('submit', function() {
            const event = require('d3').event; // live binding needed!

            event.preventDefault();
            const username = select(this).select('input.username').property('value');
            const password = select(this).select('input.password').property('value');
            console.log(username, password)
        });
        container.select('input.username').node().focus();
    }

    deactivateRoute(container) {

    }

}