class StockMovementsRoute {
    constructor(controller) {
        this.controller = controller;
    }

    main(service) {
        service.on('RegisterStockEntry', req =>
            this.controller.registerEntry(req)
        );

        service.on('RegisterStockExit', req =>
            this.controller.registerExit(req)
        );

        service.on('RegisterStockTransfer', req =>
            this.controller.registerTransfer(req)
        );

        service.before(['CREATE', 'UPDATE', 'DELETE'], 'StockMovements', req =>
            req.reject(405, 'Utilize as operações de movimentação de estoque.')
        );
    }
}

module.exports = StockMovementsRoute;
