class PlantsService {
    constructor(repository) {
        this.repository = repository;
    }

    async validateCode(req, isUpdate) {
        const code = req.data.code?.trim();
        if (code === undefined && isUpdate) return;
        if (!code) return req.reject(400, 'Informe o código.');
        req.data.code = code;
        const currentId = isUpdate ? req.data.ID || req.params?.[0]?.ID : null;
        
        const existing = await this.repository.findByCode(req, code);
        if (existing && (!isUpdate || !currentId || existing.ID !== currentId)) {
            return req.reject(409, `O código ${code} já está cadastrado.`);
        }
    }
}

module.exports = PlantsService;
