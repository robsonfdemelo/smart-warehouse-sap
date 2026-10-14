
const productsService = require('../../services/catalog/products-service');

module.exports = function (service) {
    service.before('CREATE', 'Products', async (req) => {
        await productsService.validateCreate(req);
    });
};
