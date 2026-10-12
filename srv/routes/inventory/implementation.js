class InventoryRoute {
    constructor(controller) {
        this.controller = controller;
    }

    main(service) {
        service.before('CREATE', 'Stock', req => this.controller.validateCreate(req));
        service.before('UPDATE', 'Stock', req => this.controller.validateUpdate(req));
    }
}

module.exports = InventoryRoute;
