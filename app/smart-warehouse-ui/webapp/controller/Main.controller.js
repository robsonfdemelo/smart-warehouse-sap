sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "smartwarehouse/ui/model/formatter"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox,
    formatter
) {
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

            this.getView().setModel(new JSONModel({
                stock_ID: "",
                productCode: "",
                locationCode: "",
                quantity: 0,
                minimumQuantity: "",
                saving: false
            }), "minimumStock");

            this.loadStockLocations();
            this.loadDashboard();

        },


        loadStockLocations: async function () {
            const oModel = this.getView().getModel();
            const oSelect = this.byId("stockLocationFilter");

            try {
                const oBinding = oModel.bindList(
                    "/StorageLocations"
                );

                const aLocations = [];
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
                        const oLocation = oContext.getObject();

                        aLocations.push({
                            key: oLocation.ID,
                            text: oLocation.code + " - " + oLocation.name
                        });
                    });

                    iOffset += aContexts.length;

                    if (aContexts.length < iPageSize) {
                        break;
                    }
                }

                aLocations.sort(function (a, b) {
                    return a.text.localeCompare(b.text);
                });

                aLocations.unshift({
                    key: "",
                    text: "Todos os depósitos"
                });

                this.getView().setModel(
                    new JSONModel({
                        locations: aLocations
                    }),
                    "stockFilters"
                );

                oSelect.setSelectedKey("");

            } catch (oError) {
                console.error("Erro ao carregar depósitos:", oError);
                MessageBox.error(
                    "Não foi possível carregar os filtros de depósito."
                );
            }
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
            const sQuantity = String(oData.quantity || "").trim().replace(",", ".");
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

            if (!/^\d+(\\.\d{1,3})?$/.test(sQuantity) || !Number.isFinite(nQuantity) || nQuantity <= 0) {
                MessageBox.warning("Informe uma quantidade positiva com até três casas decimais.");
                return;
            }

            if (oData.type === "TRANSFER" && oData.sourceLocation_ID === oData.destinationLocation_ID) {
                MessageBox.warning("Os depósitos de origem e destino devem ser diferentes.");
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
                ID: "",
                editing: false,
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

        onCancelProduct: function () {
            this.byId("productFormDialog").close();
        },

        onSaveProduct: async function () {
            const oForm = this.getView().getModel("productForm");
            const oData = oForm.getData();
            if (oData.saving) {
                return;
            }
            const sCode = String(oData.code || "").trim();
            const sName = String(oData.name || "").trim();
            if (!sCode || !sName) {
                MessageBox.warning("Informe o código e o nome do produto.");
                return;
            }
            const oList = this.byId("productsTable").getBinding("items");
            if (!oList) {
                MessageBox.error("A lista de produtos não está disponível.");
                return;
            }
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
                oList.refresh();
                const oOperationProducts = this.byId("operationProduct").getBinding("items");
                if (oOperationProducts) {
                    oOperationProducts.refresh();
                }
                const oStock = this.byId("stockTable").getBinding("items");
                if (oStock) {
                    oStock.refresh();
                }
                await this.loadDashboard();
            } catch (oError) {
                console.error("Erro ao salvar produto:", oError);
                MessageBox.error(oError.message || "Não foi possível salvar o produto.");
            } finally {
                oForm.setProperty("/saving", false);
            }
        },


        onOpenMinimumStock: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                MessageBox.error("Registro de estoque não encontrado.");
                return;
            }

            const oStock = oContext.getObject();
            const oMinimumStock = this.getView().getModel("minimumStock");

            oMinimumStock.setData({
                stock_ID: oStock.ID,
                productCode: oStock.product?.code || "",
                locationCode: oStock.storageLocation?.code || "",
                quantity: oStock.quantity,
                minimumQuantity: oStock.minimumQuantity,
                saving: false
            });

            this.byId("minimumStockDialog").open();
        },

        onCancelMinimumStock: function () {
            this.byId("minimumStockDialog").close();
        },

        onSaveMinimumStock: async function () {
            const oMinimumStock = this.getView().getModel("minimumStock");
            const oData = oMinimumStock.getData();

            if (oData.saving) {
                return;
            }

            const sMinimum = String(oData.minimumQuantity ?? "")
                .trim()
                .replace(",", ".");

            const nMinimum = Number(sMinimum);

            if (
                !/^\d+(\.\d{1,3})?$/.test(sMinimum) ||
                !Number.isFinite(nMinimum) ||
                nMinimum < 0
            ) {
                MessageBox.warning(
                    "Informe um estoque mínimo válido, com até três casas decimais."
                );
                return;
            }

            if (!oData.stock_ID) {
                MessageBox.error("Registro de estoque não identificado.");
                return;
            }

            const oModel = this.getView().getModel();
            const oAction = oModel.bindContext("/UpdateMinimumStock(...)");

            oAction.setParameter("stock_ID", oData.stock_ID);
            oAction.setParameter("minimumQuantity", sMinimum);

            oMinimumStock.setProperty("/saving", true);

            try {
                await oAction.execute();

                this.byId("minimumStockDialog").close();

                const oStockBinding = this.byId("stockTable")
                    .getBinding("items");

                if (oStockBinding) {
                    oStockBinding.refresh();
                }

                MessageToast.show("Estoque mínimo atualizado com sucesso.");
            } catch (oError) {
                console.error("Erro ao atualizar estoque mínimo:", oError);

                MessageBox.error(
                    oError.message ||
                    "Não foi possível atualizar o estoque mínimo."
                );
            } finally {
                oMinimumStock.setProperty("/saving", false);
            }
        },

        onFilterStock: function () {
            const sSearch = this.byId("stockSearch")
                .getValue().trim();

            const sLocation = this.byId("stockLocationFilter")
                .getSelectedKey();

            const aFilters = [];

            if (sSearch) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter(
                            "product/code",
                            FilterOperator.Contains,
                            sSearch
                        ),
                        new Filter(
                            "product/name",
                            FilterOperator.Contains,
                            sSearch
                        )
                    ],
                    and: false
                }));
            }

            if (sLocation) {
                aFilters.push(new Filter(
                    "storageLocation_ID",
                    FilterOperator.EQ,
                    sLocation
                ));
            }

            const oBinding = this.byId("stockTable")
                .getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onClearStockFilters: function () {
            this.byId("stockSearch").setValue("");

            this.byId("stockLocationFilter")
                .setSelectedKey("");

            this.onFilterStock();
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
