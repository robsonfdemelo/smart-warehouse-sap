const Repository = require('../../repositories/stock-movements/implementation');
const Service = require('../../services/stock-movements/implementation');
const Controller = require('../../controllers/stock-movements/implementation');
const Route = require('../../routes/stock-movements/implementation');

const repository = new Repository();
const service = new Service(repository);
const controller = new Controller(service);

module.exports = new Route(controller);