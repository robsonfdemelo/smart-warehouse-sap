const cds = require('@sap/cds');

class InventoryRepository {
    async findProduct(req, ID) {
        return cds.tx(req).run(SELECT.one.from('smartwarehouse.Products').where({ ID }));
    }

    async findStorageLocation(req, ID) {
        return cds.tx(req).run(SELECT.one.from('smartwarehouse.StorageLocations').where({ ID }));
    }

    async findStock(req, ID) {
        return cds.tx(req).run(SELECT.one.from('smartwarehouse.Stock').where({ ID }));
    }

    async findByProductAndLocation(req, product_ID, storageLocation_ID) {
        return cds.tx(req).run(SELECT.one.from('smartwarehouse.Stock').where({ product_ID, storageLocation_ID }));
    }
}

module.exports = InventoryRepository;
