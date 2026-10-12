class StorageLocationsRoute {
    constructor(controller) {
        this.controller = controller;
    }

    main(service) {
        service.before('CREATE', 'StorageLocations', req => this.controller.validateCreate(req));
        service.before('UPDATE', 'StorageLocations', req => this.controller.validateUpdate(req));
    }
}

module.exports = StorageLocationsRoute;
