
const cds = require("@sap/cds");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
    const dbPath = path.resolve(
        process.env.TEST_DB_PATH || "test/integration.sqlite"
    );

    fs.mkdirSync(path.dirname(dbPath), {
        recursive: true
    });

    if (fs.existsSync(dbPath)) {
        throw new Error(
            "Banco de integracao ja existe. Preparacao cancelada para evitar sobrescrita."
        );
    }

    const db = await cds.connect.to("db", {
        kind: "sqlite",
        credentials: {
            url: dbPath
        }
    });

    try {
        const model = await cds.load([
            "db/schema.cds",
            "srv/catalog-service.cds"
        ]);

        await cds.deploy(model).to(db, {
            schema: true,
            data: false
        });

        const { Products, Plants, StorageLocations, Stock } =
            cds.entities("smartwarehouse");

        const centroID = cds.utils.uuid();
        const depositoPrincipalID = cds.utils.uuid();
        const depositoSecundarioID = cds.utils.uuid();

        let produto = await db.run(
            SELECT.one.from(Products).where({
                code: "MAT0001"
            })
        );

        if (!produto) {
            const produtoID = cds.utils.uuid();

            await db.run(
                INSERT.into(Products).entries({
                    ID: produtoID,
                    code: "MAT0001",
                    name: "Notebook Dell",
                    unit: "UN",
                    active: true
                })
            );

            produto = { ID: produtoID };
        }

        await db.run(
            INSERT.into(Plants).entries({
                ID: centroID,
                code: "1000",
                name: "Centro de Testes",
                active: true
            })
        );

        await db.run(
            INSERT.into(StorageLocations).entries([
                {
                    ID: depositoPrincipalID,
                    code: "0001",
                    name: "Estoque Principal",
                    plant_ID: centroID,
                    active: true
                },
                {
                    ID: depositoSecundarioID,
                    code: "0002",
                    name: "Estoque Secundario",
                    plant_ID: centroID,
                    active: true
                }
            ])
        );

        await db.run(
            INSERT.into(Stock).entries({
                ID: cds.utils.uuid(),
                product_ID: produto.ID,
                storageLocation_ID: depositoPrincipalID,
                quantity: 100
            })
        );

        const produtosMAT0001 = await db.run(
            SELECT.from(Products).where({
                code: "MAT0001"
            })
        );

        if (produtosMAT0001.length !== 1) {
            throw new Error(
                "O banco de testes deve conter exatamente um produto MAT0001."
            );
        }

        console.log("Banco de integracao preparado:", dbPath);
        console.log("Produto MAT0001:", produto.ID);
        console.log("Saldo inicial:", 100);
    } finally {
        await db.disconnect();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
