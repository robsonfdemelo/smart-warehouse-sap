const Repository = require('../../repositories/inventory/implementation');
const Service = require('../../services/inventory/implementation');
const Controller = require('../../controllers/inventory/implementation');
const Route = require('../../routes/inventory/implementation');

const repository = new Repository();
const service = new Service(repository);
const controller = new Controller(service);

module.exports = new Route(controller);
