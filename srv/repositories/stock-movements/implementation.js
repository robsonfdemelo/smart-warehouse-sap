const cds = require('@sap/cds');

class StockMovementsRepository {
    async findProduct(req, ID) {
        return cds.tx(req).run(
            SELECT.one.from('smartwarehouse.Products').where({ ID })
        );
    }

    async findStorageLocation(req, ID) {
        return cds.tx(req).run(
            SELECT.one.from('smartwarehouse.StorageLocations').where({ ID })
        );
    }

    async findStock(req, product_ID, storageLocation_ID) {
        return cds.tx(req).run(
            SELECT.one.from('smartwarehouse.Stock')
                .where({ product_ID, storageLocation_ID })
        );
    }

    async increaseStock(req, stock, product_ID, storageLocation_ID, quantity) {
        const tx = cds.tx(req);

        if (stock) {
            const updatedQuantity = Number(stock.quantity) + Number(quantity);

            const result = await tx.run(
                UPDATE('smartwarehouse.Stock')
                    .set({ quantity: updatedQuantity })
                    .where({
                        ID: stock.ID,
                        quantity: stock.quantity
                    })
            );

            if (result !== 1) {
                return req.reject(
                    409,
                    'O saldo foi alterado por outra operação. Tente novamente.'
                );
            }

            return result;
        }

        const ID = cds.utils.uuid();

        await tx.run(
            INSERT.into('smartwarehouse.Stock').entries({
                ID,
                product_ID,
                storageLocation_ID,
                quantity
            })
        );

        return ID;
    }

    async createMovement(req, movement) {
        await cds.tx(req).run(
            INSERT.into('smartwarehouse.StockMovements').entries(movement)
        );

        return movement;
    }
    async decreaseStock(req, stock, quantity) {
        const tx = cds.tx(req);

        const updatedQuantity = Number(
            (Number(stock.quantity) - Number(quantity)).toFixed(3)
        );

        const result = await tx.run(
            UPDATE('smartwarehouse.Stock')
                .set({ quantity: updatedQuantity })
                .where({
                    ID: stock.ID,
                    quantity: stock.quantity
                })
        );

        if (result !== 1) {
            return req.reject(
                409,
                'O saldo foi alterado por outra operação. Tente novamente.'
            );
        }

        return result;
    }
}

module.exports = StockMovementsRepository;