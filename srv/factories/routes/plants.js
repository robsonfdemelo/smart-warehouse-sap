const Repository = require('../../repositories/plants/implementation');
const Service = require('../../services/plants/implementation');
const Controller = require('../../controllers/plants/implementation');
const Route = require('../../routes/plants/implementation');

const repository = new Repository();
const service = new Service(repository);
const controller = new Controller(service);

module.exports = new Route(controller);
