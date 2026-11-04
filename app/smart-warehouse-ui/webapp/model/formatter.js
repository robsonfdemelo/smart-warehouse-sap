
sap.ui.define([], function () {
    "use strict";

    function parseDecimal(value) {
        if (value === null || value === undefined || value === "") {
            return NaN;
        }

        if (typeof value === "number") {
            return value;
        }

        const text = String(value).trim();

        if (text.includes(",")) {
            return Number(text.replace(/\./g, "").replace(",", "."));
        }

        return Number(text);
    }

    function getStockState(quantity, minimumQuantity) {
        const available = parseDecimal(quantity);
        const minimum = parseDecimal(minimumQuantity);

        if (!Number.isFinite(available) || !Number.isFinite(minimum)) {
            return "None";
        }

        if (available < minimum) {
            return "Error";
        }

        if (available === minimum) {
            return "Warning";
        }

        return "Success";
    }

    return {
        movementType: function (value) {
            const types = {
                IN: "Entrada",
                OUT: "Saída",
                TRANSFER: "Transferência"
            };

            return types[value] || value || "";
        },

        movementState: function (value) {
            const states = {
                IN: "Success",
                OUT: "Error",
                TRANSFER: "Information"
            };

            return states[value] || "None";
        },

        stockStatus: function (quantity, minimumQuantity) {
            const state = getStockState(quantity, minimumQuantity);

            const statuses = {
                Success: "Normal",
                Warning: "Atenção",
                Error: "Crítico",
                None: "Indefinido"
            };

            return statuses[state];
        },

        stockStatusState: function (quantity, minimumQuantity) {
            return getStockState(quantity, minimumQuantity);
        }
    };
});
