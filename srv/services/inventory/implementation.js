
class InventoryService {
    constructor(repository) {
        this.repository = repository;
    }

    async validateStock(req, isUpdate) {
        const currentId = isUpdate ? req.data.ID || req.params?.[0]?.ID : null;
        const current = isUpdate ? await this.repository.findStock(req, currentId) : null;

        if (isUpdate && !current) return req.reject(404, 'Registro de estoque não encontrado.');

        const product_ID = req.data.product_ID ?? current?.product_ID;
        const storageLocation_ID = req.data.storageLocation_ID ?? current?.storageLocation_ID;
        const quantity = req.data.quantity ?? current?.quantity ?? 0;

        if (!product_ID) return req.reject(400, 'Informe o produto.');
        if (!storageLocation_ID) return req.reject(400, 'Informe o depósito.');

        if (quantity === '' || quantity === null || !Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
            return req.reject(400, 'A quantidade deve ser um número maior ou igual a zero.');
        }

        const [product, storageLocation] = await Promise.all([
            this.repository.findProduct(req, product_ID),
            this.repository.findStorageLocation(req, storageLocation_ID)
        ]);

        if (!product) return req.reject(400, 'Produto não encontrado.');
        if (!storageLocation) return req.reject(400, 'Depósito não encontrado.');

        const existing = await this.repository.findByProductAndLocation(req, product_ID, storageLocation_ID);
        if (existing && existing.ID !== currentId) {
            return req.reject(409, 'Já existe estoque para este produto neste depósito.');
        }

        if (!isUpdate && req.data.quantity === undefined) req.data.quantity = 0;
    }

    async updateMinimumStock(req) {
        const { stock_ID, minimumQuantity } = req.data;

        if (!stock_ID) {
            return req.reject(400, 'Informe o ID do registro de estoque.');
        }

        if (
            minimumQuantity === undefined ||
            minimumQuantity === null ||
            minimumQuantity === '' ||
            !Number.isFinite(Number(minimumQuantity)) ||
            Number(minimumQuantity) < 0
        ) {
            return req.reject(400, 'O estoque mínimo deve ser um número maior ou igual a zero.');
        }

        const current = await this.repository.findStock(req, stock_ID);

        if (!current) {
            return req.reject(404, 'Registro de estoque não encontrado.');
        }

        return this.repository.updateMinimumStock(req, stock_ID, minimumQuantity);
    }
}

module.exports = InventoryService;
