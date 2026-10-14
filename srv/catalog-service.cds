using {smartwarehouse as db} from '../db/schema';

service CatalogService {
    entity Products         as projection on db.Products;
    entity Plants           as projection on db.Plants;
    entity StorageLocations as projection on db.StorageLocations;
    entity Stock            as projection on db.Stock;
    entity StockMovements   as projection on db.StockMovements;

    action RegisterStockEntry(product_ID: UUID,
                              destinationLocation_ID: UUID,
                              quantity: Decimal(15, 3),
                              reference: String(100),
                              notes: String(255))    returns StockMovements;

    action RegisterStockExit(product_ID: UUID,
                             sourceLocation_ID: UUID,
                             quantity: Decimal(15, 3),
                             reference: String(100),
                             notes: String(255))     returns StockMovements;

    action RegisterStockTransfer(product_ID: UUID,
                                 sourceLocation_ID: UUID,
                                 destinationLocation_ID: UUID,
                                 quantity: Decimal(15, 3),
                                 reference: String(100),
                                 notes: String(255)) returns StockMovements;
}
