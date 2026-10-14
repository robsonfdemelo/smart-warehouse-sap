
const test = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = "http://localhost:4006/odata/v4/catalog";

async function consultar(caminho) {
    const resposta = await fetch(`${baseUrl}/${caminho}`);

    assert.equal(resposta.status, 200);

    return resposta.json();
}

test("Saida com saldo insuficiente deve ser rejeitada", async () => {
    const produtos = await consultar("Products");
    const depositos = await consultar("StorageLocations");

    const produto = produtos.value.find(
        item => item.code === "MAT0001"
    );

    const deposito = depositos.value.find(
        item => item.code === "0001"
    );

    assert.ok(produto, "Produto nao encontrado");
    assert.ok(deposito, "Deposito nao encontrado");

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
        `${baseUrl}/RegisterStockExit`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                product_ID: produto.ID,
                sourceLocation_ID: deposito.ID,
                quantity: saldoAnterior + 1000,
                reference: "TESTE-SALDO-INSUFICIENTE",
                notes: "Teste de validacao"
            })
        }
    );

    assert.equal(resposta.status, 400);

    const saldoAtual = await consultarSaldo();

    assert.equal(
        saldoAtual,
        saldoAnterior,
        "O estoque nao deveria ter sido alterado"
    );
});


test("Entrada com quantidade zero deve ser rejeitada", async () => {
    const produtos = await consultar("Products");
    const depositos = await consultar("StorageLocations");

    const produto = produtos.value.find(
        item => item.code === "MAT0001"
    );

    const deposito = depositos.value.find(
        item => item.code === "0001"
    );

    assert.ok(produto);
    assert.ok(deposito);

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
                quantity: 0,
                reference: "TESTE-QUANTIDADE-ZERO",
                notes: "Validacao de quantidade zero"
            })
        }
    );

    assert.equal(resposta.status, 400);
});

test("Entrada com quantidade negativa deve ser rejeitada", async () => {
    const produtos = await consultar("Products");
    const depositos = await consultar("StorageLocations");

    const produto = produtos.value.find(
        item => item.code === "MAT0001"
    );

    const deposito = depositos.value.find(
        item => item.code === "0001"
    );

    assert.ok(produto);
    assert.ok(deposito);

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
                quantity: -5,
                reference: "TESTE-QUANTIDADE-NEGATIVA",
                notes: "Validacao de quantidade negativa"
            })
        }
    );

    assert.equal(resposta.status, 400);
});



test("Transferencia para o mesmo deposito deve ser rejeitada", async () => {
    const produtos = await consultar("Products");
    const depositos = await consultar("StorageLocations");

    const produto = produtos.value.find(
        item => item.code === "MAT0001"
    );

    const deposito = depositos.value.find(
        item => item.code === "0001"
    );

    assert.ok(produto, "Produto nao encontrado");
    assert.ok(deposito, "Deposito nao encontrado");

    async function consultarEstado() {
        const estoque = await consultar("Stock");
        const movimentos = await consultar("StockMovements");

        const registro = estoque.value.find(
            item =>
                item.product_ID === produto.ID &&
                item.storageLocation_ID === deposito.ID
        );

        return {
            saldo: Number(registro?.quantity ?? 0),
            movimentos: movimentos.value.length
        };
    }

    const antes = await consultarEstado();

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
                sourceLocation_ID: deposito.ID,
                destinationLocation_ID: deposito.ID,
                quantity: 1,
                reference: "TESTE-MESMO-DEPOSITO",
                notes: "Validacao de origem e destino"
            })
        }
    );

    assert.equal(resposta.status, 400);

    const depois = await consultarEstado();

    assert.equal(depois.saldo, antes.saldo);
    assert.equal(depois.movimentos, antes.movimentos);
});
