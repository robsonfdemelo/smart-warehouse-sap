
using {smartwarehouse as db} from '../db/schema';

service CatalogService {
    entity Products         as projection on db.Products;
    entity Plants           as projection on db.Plants;
    entity StorageLocations as projection on db.StorageLocations;
    entity Stock            as projection on db.Stock;
    entity StockMovements   as projection on db.StockMovements;

    @requires: 'Operator'
    action RegisterStockEntry(product_ID: UUID,
                              destinationLocation_ID: UUID,
                              quantity: Decimal(15, 3),
                              reference: String(100),
                              notes: String(255)) returns StockMovements;

    @requires: 'Operator'
    action RegisterStockExit(product_ID: UUID,
                             sourceLocation_ID: UUID,
                             quantity: Decimal(15, 3),
                             reference: String(100),
                             notes: String(255)) returns StockMovements;

    @requires: 'Operator'
    action RegisterStockTransfer(product_ID: UUID,
                                 sourceLocation_ID: UUID,
                                 destinationLocation_ID: UUID,
                                 quantity: Decimal(15, 3),
                                 reference: String(100),
                                 notes: String(255)) returns StockMovements;

    @requires: 'Operator'
    action UpdateMinimumStock(
        stock_ID: UUID,
        minimumQuantity: Decimal(15, 3)
    ) returns Stock;
}
