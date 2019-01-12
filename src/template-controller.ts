import { Selection } from "d3";

export default interface TemplateController {
    activateRoute: (container: Selection<HTMLDivElement, null, any, null>) => void;
    deactivateRoute: (container: Selection<HTMLDivElement, null, any, null>) => void;
}