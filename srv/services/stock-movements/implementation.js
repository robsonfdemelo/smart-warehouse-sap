
const cds = require('@sap/cds');

class StockMovementsService {
    constructor(repository) {
        this.repository = repository;
    }

    async registerEntry(req) {
        const {
            product_ID,
            destinationLocation_ID,
            quantity,
            reference,
            notes
        } = req.data;

        const amount = Number(quantity);

        if (!product_ID) {
            return req.reject(400, 'Informe o produto.');
        }

        if (!destinationLocation_ID) {
            return req.reject(400, 'Informe o depósito de destino.');
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return req.reject(400, 'A quantidade deve ser maior que zero.');
        }

        const product = await this.repository.findProduct(req, product_ID);
        const location = await this.repository.findStorageLocation(
            req,
            destinationLocation_ID
        );

        if (!product || !product.active) {
            return req.reject(400, 'Produto não encontrado ou inativo.');
        }

        if (!location || !location.active) {
            return req.reject(400, 'Depósito não encontrado ou inativo.');
        }

        const stock = await this.repository.findStock(
            req,
            product_ID,
            destinationLocation_ID
        );

        await this.repository.increaseStock(
            req,
            stock,
            product_ID,
            destinationLocation_ID,
            amount
        );

        const movement = {
            ID: cds.utils.uuid(),
            type: 'IN',
            product_ID,
            sourceLocation_ID: null,
            destinationLocation_ID,
            quantity: amount,
            reference: reference || null,
            notes: notes || null
        };

        return this.repository.createMovement(req, movement);
    }

    async registerExit(req) {
        const {
            product_ID,
            sourceLocation_ID,
            quantity,
            reference,
            notes
        } = req.data;

        const amount = Number(quantity);

        if (!product_ID) {
            return req.reject(400, 'Informe o produto.');
        }

        if (!sourceLocation_ID) {
            return req.reject(400, 'Informe o depósito de origem.');
        }

        if (
            quantity === null ||
            quantity === undefined ||
            quantity === '' ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return req.reject(400, 'A quantidade deve ser maior que zero.');
        }

        const product = await this.repository.findProduct(req, product_ID);
        const location = await this.repository.findStorageLocation(
            req,
            sourceLocation_ID
        );

        if (!product || !product.active) {
            return req.reject(400, 'Produto não encontrado ou inativo.');
        }

        if (!location || !location.active) {
            return req.reject(400, 'Depósito não encontrado ou inativo.');
        }

        const stock = await this.repository.findStock(
            req,
            product_ID,
            sourceLocation_ID
        );

        if (!stock) {
            return req.reject(400, 'Não existe estoque para este produto no depósito.');
        }

        if (Number(stock.quantity) < amount) {
            return req.reject(400, 'Saldo insuficiente para realizar a saída.');
        }

        await this.repository.decreaseStock(req, stock, amount);

        const movement = {
            ID: cds.utils.uuid(),
            type: 'OUT',
            product_ID,
            sourceLocation_ID,
            destinationLocation_ID: null,
            quantity: amount,
            reference: reference || null,
            notes: notes || null
        };

        return this.repository.createMovement(req, movement);
    }

    async registerTransfer(req) {
        const {
            product_ID,
            sourceLocation_ID,
            destinationLocation_ID,
            quantity,
            reference,
            notes
        } = req.data;

        const amount = Number(quantity);

        if (!product_ID) {
            return req.reject(400, 'Informe o produto.');
        }

        if (!sourceLocation_ID || !destinationLocation_ID) {
            return req.reject(400, 'Informe os depósitos de origem e destino.');
        }

        if (sourceLocation_ID === destinationLocation_ID) {
            return req.reject(
                400,
                'Os depósitos de origem e destino devem ser diferentes.'
            );
        }

        if (
            quantity === null ||
            quantity === undefined ||
            quantity === '' ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return req.reject(400, 'A quantidade deve ser maior que zero.');
        }

        const product = await this.repository.findProduct(req, product_ID);

        if (!product || !product.active) {
            return req.reject(400, 'Produto não encontrado ou inativo.');
        }

        const sourceLocation = await this.repository.findStorageLocation(
            req,
            sourceLocation_ID
        );

        const destinationLocation = await this.repository.findStorageLocation(
            req,
            destinationLocation_ID
        );

        if (!sourceLocation || !sourceLocation.active) {
            return req.reject(
                400,
                'Depósito de origem não encontrado ou inativo.'
            );
        }

        if (!destinationLocation || !destinationLocation.active) {
            return req.reject(
                400,
                'Depósito de destino não encontrado ou inativo.'
            );
        }

        if (sourceLocation.plant_ID !== destinationLocation.plant_ID) {
            return req.reject(
                400,
                'A transferência deve ocorrer entre depósitos do mesmo centro.'
            );
        }

        const sourceStock = await this.repository.findStock(
            req,
            product_ID,
            sourceLocation_ID
        );

        if (!sourceStock || Number(sourceStock.quantity) < amount) {
            return req.reject(
                400,
                'Saldo insuficiente no depósito de origem.'
            );
        }

        const destinationStock = await this.repository.findStock(
            req,
            product_ID,
            destinationLocation_ID
        );

        await this.repository.decreaseStock(
            req,
            sourceStock,
            amount
        );

        await this.repository.increaseStock(
            req,
            destinationStock,
            product_ID,
            destinationLocation_ID,
            amount
        );

        const movement = {
            ID: cds.utils.uuid(),
            type: 'TRANSFER',
            product_ID,
            sourceLocation_ID,
            destinationLocation_ID,
            quantity: amount,
            reference: reference || null,
            notes: notes || null
        };

        return this.repository.createMovement(req, movement);
    }
}

module.exports = StockMovementsService;
