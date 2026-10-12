const productsRoute = require('./factories/routes/products');

module.exports = function () {
    productsRoute.main(this);
};
