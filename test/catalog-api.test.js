const test = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = "http://localhost:4004/odata/v4/catalog";

async function getCollection(entity) {
    const response = await fetch(`${baseUrl}/${entity}`);

    assert.equal(response.status, 200);

    const data = await response.json();

    assert.ok(Array.isArray(data.value));

    return data.value;
}

test("API deve listar produtos", async () => {
    const products = await getCollection("Products");

    assert.ok(products.length > 0);
});

test("Produtos devem possuir codigo e nome", async () => {
    const products = await getCollection("Products");

    for (const product of products) {
        assert.ok(product.code);
        assert.ok(product.name);
    }
});

test("API deve listar depositos", async () => {
    const locations = await getCollection("StorageLocations");

    assert.ok(locations.length > 0);
});

test("Estoque nao pode possuir saldo negativo", async () => {
    const stock = await getCollection("Stock");

    for (const item of stock) {
        assert.ok(
            Number(item.quantity) >= 0,
            `Saldo negativo no registro ${item.ID}`
        );
    }
});

test("Movimentacoes devem possuir tipo valido", async () => {
    const movements = await getCollection("StockMovements");

    const validTypes = ["IN", "OUT", "TRANSFER"];

    for (const movement of movements) {
        assert.ok(
            validTypes.includes(movement.type),
            `Tipo invalido: ${movement.type}`
        );
    }
});