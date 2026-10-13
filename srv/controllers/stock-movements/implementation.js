class StockMovementsController {
    constructor(service) {
        this.service = service;
    }

    async registerEntry(req) {
        return this.service.registerEntry(req);
    }

    async registerExit(req) {
        return this.service.registerExit(req);
    }

    async registerTransfer(req) {
        return this.service.registerTransfer(req);
    }
}

module.exports = StockMovementsController;