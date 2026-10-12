using { smartwarehouse as db } from '../db/schema';

service CatalogService {
    entity Products as projection on db.Products;
    entity Plants as projection on db.Plants;
    entity StorageLocations as projection on db.StorageLocations;
}
