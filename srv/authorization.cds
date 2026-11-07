using { CatalogService } from './catalog-service';

annotate CatalogService.Products with @restrict: [
    { grant: 'READ', to: 'authenticated-user' },
    { grant: 'WRITE', to: 'Operator' }
];

annotate CatalogService.Plants with @restrict: [
    { grant: 'READ', to: 'authenticated-user' },
    { grant: 'WRITE', to: 'Operator' }
];

annotate CatalogService.StorageLocations with @restrict: [
    { grant: 'READ', to: 'authenticated-user' },
    { grant: 'WRITE', to: 'Operator' }
];

annotate CatalogService.Stock with @restrict: [
    { grant: 'READ', to: 'authenticated-user' },
    { grant: 'WRITE', to: 'Operator' }
];

annotate CatalogService.StockMovements with @restrict: [
    { grant: 'READ', to: 'authenticated-user' },
    { grant: 'WRITE', to: 'Operator' }
];
