import { Selection, Dispatch } from "d3";

export default interface TemplateController {
    getEventDispatcher: () => Dispatch<any>;
    activateRoute: (container: Selection<HTMLDivElement, null, any, null>, parent?: TemplateController, param?: string) => void;
    deactivateRoute: (container: Selection<HTMLDivElement, null, any, null>) => void;
}