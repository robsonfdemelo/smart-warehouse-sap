class ProductsService {
    constructor(repository) {
        this.repository = repository;
    }

<<<<<<< HEAD
    validateName(req) {
        if (req.data.name === undefined) return;
        if (typeof req.data.name !== 'string' || !req.data.name.trim()) {
            return req.reject(400, 'Informe o nome do produto.');
        }
        req.data.name = req.data.name.trim();
    }

    async validateCode(req, isUpdate) {
        const code = typeof req.data.code === 'string' ? req.data.code.trim() : req.data.code;
=======
    async validateCode(req, isUpdate) {
        const code = req.data.code?.trim();
>>>>>>> origin/main
        if (code === undefined) return;
        if (!code) return req.reject(400, 'Informe o código do produto.');

        req.data.code = code;
        const currentId = isUpdate ? req.data.ID || req.params?.[0]?.ID : null;
        const existing = await this.repository.findByCode(req, code);

        if (existing && (!isUpdate || !currentId || existing.ID !== currentId)) {
            return req.reject(409, `O produto ${code} já está cadastrado.`);
        }
    }
}

module.exports = ProductsService;
