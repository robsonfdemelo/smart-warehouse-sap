const productsRoute = require('./factories/routes/products');
const plantsRoute = require('./factories/routes/plants');
const storageLocationsRoute = require('./factories/routes/storage-locations');
const inventoryRoute = require('./factories/routes/inventory');

module.exports = function () {
    productsRoute.main(this);
    plantsRoute.main(this);
    storageLocationsRoute.main(this);
    inventoryRoute.main(this);
};
