const productsRoute = require('./factories/routes/products');
const plantsRoute = require('./factories/routes/plants');
const storageLocationsRoute = require('./factories/routes/storage-locations');

module.exports = function () {
    productsRoute.main(this);
    plantsRoute.main(this);
    storageLocationsRoute.main(this);
};
