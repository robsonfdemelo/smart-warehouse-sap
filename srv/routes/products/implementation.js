class ProductsRoute {
    constructor(controller) {
        this.controller = controller;
    }

    main(service) {
        service.before('CREATE', 'Products', req => this.controller.validateCreate(req));
        service.before('UPDATE', 'Products', req => this.controller.validateUpdate(req));
    }
}

module.exports = ProductsRoute;
