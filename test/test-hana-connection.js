
const cds = require('@sap/cds');

async function main() {
  try {
    const db = await cds.connect.to('db');

    const result = await db.run(
      'SELECT CURRENT_USER, CURRENT_SCHEMA FROM DUMMY'
    );

    console.log('Conexão com SAP HANA Cloud realizada!');
    console.log(result);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao conectar:', error.message);
    process.exit(1);
  }
}

main();
