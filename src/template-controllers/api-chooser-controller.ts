import TemplateController from "../template-controller";
import { getApiUrl, setApiUrl } from "../api";
import { select, dispatch } from "d3";

export default class ApiChooserTemplateController implements TemplateController {

    private dispatcher;

    constructor() {
        this.dispatcher = dispatch('update');
    }

    getEventDispatcher = () => this.dispatcher;

    activateRoute(container) {
        container.select('input.api-url')
            .on('focus', function() {
                select(this)
                    .classed('bn', false)
                    .classed('gray', false);
            })
            .on('blur', function() {
                const input = select(this)
                    .classed('bn', true)
                    .classed('gray', true);
                const value = input.property('value');
                if (value == null || value == '') {
                    setApiUrl(null);
                } else {
                    try {
                        const url = new URL(value);
                        setApiUrl(url);
                    } catch (TypeError) {}
                }
                input.property('value', getApiUrl());
            })
            .property('value', getApiUrl());
    }

    deactivateRoute(container) {

    }

}