class ProductsController {
    constructor(service) {
        this.service = service;
    }

    async validateCreate(req) {
        await this.service.validateCode(req, false);
<<<<<<< HEAD
        this.service.validateName(req);
=======
>>>>>>> origin/main
    }

    async validateUpdate(req) {
        await this.service.validateCode(req, true);
<<<<<<< HEAD
        this.service.validateName(req);
=======
>>>>>>> origin/main
    }
}

module.exports = ProductsController;
