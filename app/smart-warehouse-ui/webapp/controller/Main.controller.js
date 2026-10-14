sap.ui.define([

    "sap/ui/core/mvc/Controller",

    "sap/ui/model/json/JSONModel",

    "sap/m/MessageToast",

    "sap/m/MessageBox",

    "smartwarehouse/ui/model/formatter"

], function (Controller, JSONModel, MessageToast, MessageBox, formatter) {

    "use strict";

    return Controller.extend("smartwarehouse.ui.controller.Main", {

        formatter: formatter,

        onInit: function () {

            this.getView().setModel(new JSONModel({

                totalProducts: 0,

                totalLocations: 0,

                totalQuantity: 0,

                loading: true

            }), "dashboard");

            this.getView().setModel(new JSONModel({

                type: "ENTRY",

                title: "Entrada de estoque",

                product_ID: "",

                sourceLocation_ID: "",

                destinationLocation_ID: "",

                quantity: "",

                reference: "",

                notes: "",

                showSource: false,

                showDestination: true,

                saving: false

            }), "operation");

            this.loadDashboard();

        },

        loadDashboard: async function () {

            const oDashboard = this.getView().getModel("dashboard");

            const oModel = this.getView().getModel();

            oDashboard.setProperty("/loading", true);

            try {

                const oBinding = oModel.bindList(

                    "/Stock",

                    undefined,

                    undefined,

                    undefined,

                    {

                        $expand: "product,storageLocation"

                    }

                );

                const aStocks = [];

                const iPageSize = 100;

                let iOffset = 0;

                while (true) {

                    const aContexts = await oBinding.requestContexts(

                        iOffset,

                        iPageSize

                    );

                    if (!aContexts.length) {

                        break;

                    }

                    aContexts.forEach(function (oContext) {

                        aStocks.push(oContext.getObject());

                    });

                    iOffset += aContexts.length;

                    if (aContexts.length < iPageSize) {

                        break;

                    }

                }

                const oProducts = new Set();

                const oLocations = new Set();

                let nTotalQuantity = 0;

                aStocks.forEach(function (oStock) {

                    const nQuantity = Number(oStock.quantity) || 0;

                    nTotalQuantity += nQuantity;

                    if (oStock.product) {

                        oProducts.add(

                            oStock.product.ID || oStock.product.code

                        );

                    }

                    if (nQuantity > 0 && oStock.storageLocation) {

                        oLocations.add(

                            oStock.storageLocation.ID ||

                            oStock.storageLocation.code

                        );

                    }

                });

                oDashboard.setProperty(

                    "/totalProducts",

                    oProducts.size

                );

                oDashboard.setProperty(

                    "/totalLocations",

                    oLocations.size

                );

                oDashboard.setProperty(

                    "/totalQuantity",

                    nTotalQuantity

                );

            } catch (oError) {

                console.error("Erro ao carregar dashboard:", oError);

                MessageBox.error(

                    "Não foi possível carregar os indicadores de estoque."

                );

            } finally {

                oDashboard.setProperty("/loading", false);

            }

        },

        openOperation: function (sType) {

            const oOperation = this.getView().getModel("operation");

            const mTitles = {

                ENTRY: "Entrada de estoque",

                EXIT: "Saída de estoque",

                TRANSFER: "Transferência entre depósitos"

            };

            oOperation.setData({

                type: sType,

                title: mTitles[sType],

                product_ID: "",

                sourceLocation_ID: "",

                destinationLocation_ID: "",

                quantity: "",

                reference: "",

                notes: "",

                showSource: sType !== "ENTRY",

                showDestination: sType !== "EXIT",

                saving: false

            });

            this.byId("operationDialog").open();

        },

        onOpenEntry: function () {

            this.openOperation("ENTRY");

        },

        onOpenExit: function () {

            this.openOperation("EXIT");

        },

        onOpenTransfer: function () {

            this.openOperation("TRANSFER");

        },

        onCancelOperation: function () {

            this.byId("operationDialog").close();

        },

        onSaveOperation: async function () {

            const oOperation = this.getView().getModel("operation");

            const oData = oOperation.getData();

            if (oData.saving) {

                return;

            }

            const bNeedsSource = oData.type !== "ENTRY";

            const bNeedsDestination = oData.type !== "EXIT";

            const sQuantity = String(oData.quantity || "")

                .trim()

                .replace(",", ".");

            const nQuantity = Number(sQuantity);

            if (!oData.product_ID) {

                MessageBox.warning("Selecione um produto.");

                return;

            }

            if (bNeedsSource && !oData.sourceLocation_ID) {

                MessageBox.warning("Selecione o depósito de origem.");

                return;

            }

            if (bNeedsDestination && !oData.destinationLocation_ID) {

                MessageBox.warning("Selecione o depósito de destino.");

                return;

            }

            if (

                !/^\d+(\\.\d{1,3})?$/.test(sQuantity) ||

                !Number.isFinite(nQuantity) ||

                nQuantity <= 0

            ) {

                MessageBox.warning(

                    "Informe uma quantidade positiva com até três casas decimais."

                );

                return;

            }

            if (

                oData.type === "TRANSFER" &&

                oData.sourceLocation_ID === oData.destinationLocation_ID

            ) {

                MessageBox.warning(

                    "Os depósitos de origem e destino devem ser diferentes."

                );

                return;

            }

            const mActions = {

                ENTRY: "RegisterStockEntry",

                EXIT: "RegisterStockExit",

                TRANSFER: "RegisterStockTransfer"

            };

            const sAction = mActions[oData.type];

            const oModel = this.getView().getModel();

            const oAction = oModel.bindContext(

                "/" + sAction + "(...)"

            );

            oAction.setParameter("product_ID", oData.product_ID);

            oAction.setParameter("quantity", sQuantity);

            oAction.setParameter(

                "reference",

                oData.reference || ""

            );

            oAction.setParameter(

                "notes",

                oData.notes || ""

            );

            if (bNeedsSource) {

                oAction.setParameter(

                    "sourceLocation_ID",

                    oData.sourceLocation_ID

                );

            }

            if (bNeedsDestination) {

                oAction.setParameter(

                    "destinationLocation_ID",

                    oData.destinationLocation_ID

                );

            }

            oOperation.setProperty("/saving", true);

            try {

                await oAction.execute();

                this.byId("operationDialog").close();

                MessageToast.show(

                    "Movimentação registrada com sucesso."

                );

                const oTableBinding = this.byId("stockTable")

                    .getBinding("items");

                if (oTableBinding) {

                    oTableBinding.refresh();

                }

                await this.loadDashboard();

                const oMovementsBinding = this.byId("movementsTable").getBinding("items");

                if (oMovementsBinding) {

                    oMovementsBinding.refresh();

                }

            } catch (oError) {

                console.error("Erro na movimentação:", oError);

                MessageBox.error(

                    oError.message ||

                    "Não foi possível registrar a movimentação."

                );

            } finally {

                oOperation.setProperty("/saving", false);

            }

        },

        onOpenProducts: function () {
            this.byId("productsDialog").open();
        },

        onCloseProducts: function () {
            this.byId("productsDialog").close();
        },

        onNewProduct: function () {
            this.getView().setModel(new JSONModel({
<<<<<<< HEAD
                ID: "",
                editing: false,
=======
>>>>>>> origin/main
                code: "",
                name: "",
                description: "",
                category: "",
                unit: "UN",
                active: true,
                saving: false
            }), "productForm");
            this.byId("productFormDialog").open();
        },

<<<<<<< HEAD
        onEditProduct: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                MessageBox.error("Produto não encontrado.");
                return;
            }
            const oProduct = oContext.getObject();
            this.getView().setModel(new JSONModel({
                ID: oProduct.ID,
                editing: true,
                code: oProduct.code || "",
                name: oProduct.name || "",
                description: oProduct.description || "",
                category: oProduct.category || "",
                unit: oProduct.unit || "UN",
                active: oProduct.active !== false,
                saving: false
            }), "productForm");
            this.byId("productFormDialog").open();
        },

        onToggleProductActive: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                return;
            }
            const oProduct = oContext.getObject();
            const bActivate = !oProduct.active;
            const sAction = bActivate ? "ativar" : "desativar";
            MessageBox.confirm("Deseja " + sAction + " o produto " + oProduct.code + "?", {
                onClose: async (sChoice) => {
                    if (sChoice !== MessageBox.Action.OK) {
                        return;
                    }
                    try {
                        await oContext.setProperty("active", bActivate);
                        await this.getView().getModel().submitBatch("$auto");
                        this.byId("productsTable").getBinding("items").refresh();
                        const oItems = this.byId("operationProduct").getBinding("items");
                        if (oItems) {
                            oItems.refresh();
                        }
                        MessageToast.show("Produto " + (bActivate ? "ativado" : "desativado") + " com sucesso.");
                    } catch (oError) {
                        MessageBox.error(oError.message || "Não foi possível alterar o status do produto.");
                    }
                }
            });
        },

=======
>>>>>>> origin/main
        onCancelProduct: function () {
            this.byId("productFormDialog").close();
        },

        onSaveProduct: async function () {
            const oForm = this.getView().getModel("productForm");
            const oData = oForm.getData();
<<<<<<< HEAD
            if (oData.saving) {
                return;
            }
            const sCode = String(oData.code || "").trim();
            const sName = String(oData.name || "").trim();
=======
            const sCode = String(oData.code || "").trim();
            const sName = String(oData.name || "").trim();

            if (oData.saving) {
                return;
            }
>>>>>>> origin/main
            if (!sCode || !sName) {
                MessageBox.warning("Informe o código e o nome do produto.");
                return;
            }
<<<<<<< HEAD
=======

>>>>>>> origin/main
            const oList = this.byId("productsTable").getBinding("items");
            if (!oList) {
                MessageBox.error("A lista de produtos não está disponível.");
                return;
            }
<<<<<<< HEAD
            const oPayload = {
                code: sCode,
                name: sName,
                description: String(oData.description || "").trim(),
                category: String(oData.category || "").trim(),
                unit: String(oData.unit || "").trim(),
                active: Boolean(oData.active)
            };
            oForm.setProperty("/saving", true);
            try {
                if (oData.editing) {
                    const aContexts = await oList.requestContexts(0, 1000);
                    const oContext = aContexts.find((oItem) => oItem.getProperty("ID") === oData.ID);
                    if (!oContext) {
                        throw new Error("Produto não encontrado na lista. Atualize e tente novamente.");
                    }
                    await Promise.all(Object.keys(oPayload).map((sKey) =>
                        oContext.setProperty(sKey, oPayload[sKey])
                    ));
                    await this.getView().getModel().submitBatch("$auto");
                } else {
                    const oContext = oList.create(oPayload);
                    await oContext.created();
                }
                this.byId("productFormDialog").close();
                MessageToast.show(oData.editing ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
=======

            oForm.setProperty("/saving", true);
            try {
                const oContext = oList.create({
                    code: sCode,
                    name: sName,
                    description: String(oData.description || "").trim(),
                    category: String(oData.category || "").trim(),
                    unit: String(oData.unit || "").trim(),
                    active: Boolean(oData.active)
                });
                await oContext.created();
                this.byId("productFormDialog").close();
                MessageToast.show("Produto cadastrado com sucesso.");
>>>>>>> origin/main
                oList.refresh();
                const oOperationProducts = this.byId("operationProduct").getBinding("items");
                if (oOperationProducts) {
                    oOperationProducts.refresh();
                }
<<<<<<< HEAD
                const oStock = this.byId("stockTable").getBinding("items");
                if (oStock) {
                    oStock.refresh();
                }
                await this.loadDashboard();
            } catch (oError) {
                console.error("Erro ao salvar produto:", oError);
                MessageBox.error(oError.message || "Não foi possível salvar o produto.");
=======
            } catch (oError) {
                console.error("Erro ao cadastrar produto:", oError);
                MessageBox.error(oError.message || "Não foi possível cadastrar o produto.");
>>>>>>> origin/main
            } finally {
                oForm.setProperty("/saving", false);
            }
        },

        onRefreshHistory: function () {

            const oBinding = this.byId("movementsTable")

                .getBinding("items");

            if (oBinding) {

                oBinding.refresh();

                MessageToast.show("Histórico atualizado.");

            }

        },

        onRefresh: async function () {

            const oTable = this.byId("stockTable");

            if (!oTable) {

                console.error("Tabela stockTable não encontrada na View.");

                MessageBox.error(

                    "A tabela de estoque não foi encontrada. Verifique a Main.view\.xml."

                );

                return;

            }

            const oBinding = oTable.getBinding("items");

            if (oBinding) {

                oBinding.refresh();

            }

            await this.loadDashboard();

            MessageToast.show("Consulta de estoque atualizada.");

        }

    });

});
