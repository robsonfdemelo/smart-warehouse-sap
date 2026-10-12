
namespace smartwarehouse;

using { cuid, managed } from '@sap/cds/common';

entity Products : cuid, managed {
    code        : String(20) @mandatory;
    name        : String(100) @mandatory;
    description : String(255);
    category    : String(50);
    unit        : String(10);
    active      : Boolean default true;
}

entity Plants : cuid, managed {
    code   : String(10) @mandatory;
    name   : String(100) @mandatory;
    active : Boolean default true;
}

entity StorageLocations : cuid, managed {
    code   : String(10) @mandatory;
    name   : String(100) @mandatory;
    plant  : Association to Plants not null;
    active : Boolean default true;
}

@assert.unique: { productStorage: [product, storageLocation] }
entity Stock : cuid, managed {
    product         : Association to Products not null;
    storageLocation : Association to StorageLocations not null;
    quantity        : Decimal(15,3) default 0;
}
