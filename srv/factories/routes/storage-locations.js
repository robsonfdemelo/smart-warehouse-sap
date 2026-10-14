const Repository = require('../../repositories/storage-locations/implementation');
const Service = require('../../services/storage-locations/implementation');
const Controller = require('../../controllers/storage-locations/implementation');
const Route = require('../../routes/storage-locations/implementation');

const repository = new Repository();
const service = new Service(repository);
const controller = new Controller(service);

module.exports = new Route(controller);
