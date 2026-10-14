const cds = require('@sap/cds');

class StorageLocationsRepository {
    async findByCode(req, code, plant_ID) {
        const tx = cds.tx(req);
        return tx.run(SELECT.one.from('smartwarehouse.StorageLocations').where({ code, plant_ID }));
    }

    async findPlantById(req, ID) {
        return cds.tx(req).run(SELECT.one.from('smartwarehouse.Plants').where({ ID }));
    }
}

module.exports = StorageLocationsRepository;
