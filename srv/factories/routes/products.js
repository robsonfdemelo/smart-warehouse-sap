const ProductsRepository = require('../../repositories/products/implementation');
const ProductsService = require('../../services/products/implementation');
const ProductsController = require('../../controllers/products/implementation');
const ProductsRoute = require('../../routes/products/implementation');

const repository = new ProductsRepository();
const service = new ProductsService(repository);
const controller = new ProductsController(service);

module.exports = new ProductsRoute(controller);
