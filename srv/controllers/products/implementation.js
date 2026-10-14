class ProductsController {
    constructor(service) {
        this.service = service;
    }

    async validateCreate(req) {
        await this.service.validateCode(req, false);
        this.service.validateName(req);
    }

    async validateUpdate(req) {
        await this.service.validateCode(req, true);
        this.service.validateName(req);
    }
}

module.exports = ProductsController;
