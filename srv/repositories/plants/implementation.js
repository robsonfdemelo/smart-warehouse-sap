const cds = require('@sap/cds');

class PlantsRepository {
    async findByCode(req, code) {
        const tx = cds.tx(req);
        return tx.run(SELECT.one.from('smartwarehouse.Plants').where({ code }));
    }
}

module.exports = PlantsRepository;
