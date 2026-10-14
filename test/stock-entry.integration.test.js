
const test = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = "http://localhost:4006/odata/v4/catalog";

async function consultar(caminho) {
    const resposta = await fetch(`${baseUrl}/${caminho}`);

    assert.equal(resposta.status, 200);

    return resposta.json();
}

test("Entrada deve aumentar o estoque em 1 unidade", async () => {
    const produtos = await consultar("Products");
    const depositos = await consultar("StorageLocations");

    const produto = produtos.value.find(
        item => item.code === "MAT0001"
    );

    const deposito = depositos.value.find(
        item => item.code === "0001"
    );

    assert.ok(produto, "Produto MAT0001 nao encontrado");
    assert.ok(deposito, "Deposito 0001 nao encontrado");

    async function consultarSaldo() {
        const estoque = await consultar("Stock");

        const registro = estoque.value.find(
            item =>
                item.product_ID === produto.ID &&
                item.storageLocation_ID === deposito.ID
        );

        return Number(registro?.quantity ?? 0);
    }

    const saldoAnterior = await consultarSaldo();

    const resposta = await fetch(
        `${baseUrl}/RegisterStockEntry`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                product_ID: produto.ID,
                destinationLocation_ID: deposito.ID,
                quantity: 1,
                reference: "TESTE-INTEGRACAO-ENTRADA",
                notes: "Teste automatizado de entrada"
            })
        }
    );

    assert.equal(
        resposta.status,
        200,
        await resposta.text()
    );

    const saldoAtual = await consultarSaldo();

    assert.equal(saldoAtual, saldoAnterior + 1);
});
