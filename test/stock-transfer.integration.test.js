
const test = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = "http://localhost:4006/odata/v4/catalog";

async function consultar(caminho) {
    const resposta = await fetch(`${baseUrl}/${caminho}`);

    assert.equal(resposta.status, 200);

    return resposta.json();
}

test("Transferencia deve movimentar estoque entre depositos", async () => {
    const produtos = await consultar("Products");
    const depositos = await consultar("StorageLocations");

    const produto = produtos.value.find(
        item => item.code === "MAT0001"
    );

    const origem = depositos.value.find(
        item => item.code === "0001"
    );

    const destino = depositos.value.find(
        item => item.code === "0002"
    );

    assert.ok(produto, "Produto nao encontrado");
    assert.ok(origem, "Deposito de origem nao encontrado");
    assert.ok(destino, "Deposito de destino nao encontrado");

    async function consultarSaldo(depositoID) {
        const estoque = await consultar("Stock");

        console.log(
            "Registros de estoque:",
            JSON.stringify(estoque.value, null, 2)
        );

        const registro = estoque.value.find(
            item =>
                item.product_ID === produto.ID &&
                item.storageLocation_ID === depositoID
        );

        return Number(registro?.quantity ?? 0);
    }

    const origemAntes = await consultarSaldo(origem.ID);
    const destinoAntes = await consultarSaldo(destino.ID);

    console.log("Produto:", produto.ID);
    console.log("Deposito origem:", origem.ID);
    console.log("Deposito destino:", destino.ID);
    console.log("Saldo origem:", origemAntes);
    console.log("Saldo destino:", destinoAntes);

    assert.ok(origemAntes >= 1, "Saldo insuficiente na origem");

    const resposta = await fetch(
        `${baseUrl}/RegisterStockTransfer`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                product_ID: produto.ID,
                sourceLocation_ID: origem.ID,
                destinationLocation_ID: destino.ID,
                quantity: 1,
                reference: "TESTE-INTEGRACAO-TRANSFERENCIA",
                notes: "Teste automatizado de transferencia"
            })
        }
    );

    assert.equal(resposta.status, 200, await resposta.text());

    const origemDepois = await consultarSaldo(origem.ID);
    const destinoDepois = await consultarSaldo(destino.ID);

    console.log("Saldo origem depois:", origemDepois);
    console.log("Saldo destino depois:", destinoDepois);

    assert.equal(origemDepois, origemAntes - 1);
    assert.equal(destinoDepois, destinoAntes + 1);

    assert.equal(
        origemDepois + destinoDepois,
        origemAntes + destinoAntes
    );
});
