import TemplateController from "../template-controller";
import { getApiUrl, setApiUrl } from "../api";
import { select } from "d3";

export default class ApiChooserTemplateController implements TemplateController {

    private children = new Set<TemplateController>();

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

    registerChild(controller) {
        this.children.add(controller);
    }

    removeChild(controller) {
        this.children.delete(controller);
    }

}