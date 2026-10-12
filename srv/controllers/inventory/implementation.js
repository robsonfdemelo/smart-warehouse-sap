class InventoryController {
    constructor(service) {
        this.service = service;
    }

    async validateCreate(req) {
        await this.service.validateStock(req, false);
    }

    async validateUpdate(req) {
        await this.service.validateStock(req, true);
    }
}

module.exports = InventoryController;
