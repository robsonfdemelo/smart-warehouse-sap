class StorageLocationsService {
    constructor(repository) {
        this.repository = repository;
    }

    async validateCode(req, isUpdate) {
        const code = req.data.code?.trim();
        const plant_ID = req.data.plant_ID;
        if (code !== undefined) {
            if (!code) return req.reject(400, 'Informe o código do depósito.');
            req.data.code = code;
        } else if (!isUpdate) {
            return req.reject(400, 'Informe o código do depósito.');
        }
        if (!plant_ID && !isUpdate) return req.reject(400, 'Informe o centro do depósito.');
        if (plant_ID) {
            const plant = await this.repository.findPlantById(req, plant_ID);
            if (!plant) return req.reject(400, 'Centro não encontrado.');
        }
        const currentId = isUpdate ? req.data.ID || req.params?.[0]?.ID : null;
        if (isUpdate && (!code || !plant_ID)) return;
        const existing = await this.repository.findByCode(req, code, plant_ID);
        if (existing && (!isUpdate || !currentId || existing.ID !== currentId)) {
            return req.reject(409, `O depósito ${code} já está cadastrado neste centro.`);
        }
    }
}

module.exports = StorageLocationsService;
