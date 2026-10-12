
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
