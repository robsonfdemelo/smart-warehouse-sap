class PlantsRoute {
    constructor(controller) {
        this.controller = controller;
    }

    main(service) {
        service.before('CREATE', 'Plants', req => this.controller.validateCreate(req));
        service.before('UPDATE', 'Plants', req => this.controller.validateUpdate(req));
    }
}

module.exports = PlantsRoute;
