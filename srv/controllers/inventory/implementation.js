
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

    async updateMinimumStock(req) {
        return this.service.updateMinimumStock(req);
    }
}

module.exports = InventoryController;
