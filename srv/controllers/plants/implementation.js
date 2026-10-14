class PlantsController {
    constructor(service) {
        this.service = service;
    }

    async validateCreate(req) {
        await this.service.validateCode(req, false);
    }

    async validateUpdate(req) {
        await this.service.validateCode(req, true);
    }
}

module.exports = PlantsController;
