
class InventoryRoute {
    constructor(controller) {
        this.controller = controller;
    }

    main(service) {
        service.before('CREATE', 'Stock', req => this.controller.validateCreate(req));
        service.before('UPDATE', 'Stock', req => this.controller.validateUpdate(req));
        service.on('UpdateMinimumStock', req => this.controller.updateMinimumStock(req));
    }
}

module.exports = InventoryRoute;
