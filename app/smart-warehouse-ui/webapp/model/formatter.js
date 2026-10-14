sap.ui.define([], function () {
    "use strict";

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
        }
    };
});