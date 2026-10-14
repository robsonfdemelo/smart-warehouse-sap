const cds = require('@sap/cds');

class ProductsRepository {
    async findByCode(req, code) {
        const tx = cds.tx(req);
        return tx.run(
            SELECT.one.from('smartwarehouse.Products').where({ code })
        );
    }
}

module.exports = ProductsRepository;
