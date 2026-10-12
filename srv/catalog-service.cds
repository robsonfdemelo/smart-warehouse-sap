using { smartwarehouse as db } from '../db/schema';

service CatalogService {
    entity Products as projection on db.Products;
}