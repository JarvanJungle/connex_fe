import { v4 as uuidv4 } from "uuid";
import { formatDisplayDecimal, roundNumberWithUpAndDown } from "helper/utilities";
import i18next from "i18next";
import INVOICE_CONSTANTS from "./constant";

const addItemManualTypeNonPO = (rowDataItems, setRowDataItems, setDirty, defaultTax) => {
    setDirty();
    const newRowDataItems = [...rowDataItems];
    newRowDataItems.push({
        itemName: "",
        itemCode: "",
        itemDescription: "",
        model: "",
        size: "",
        brand: "",
        invoiceQty: 0,
        invoiceUnitPrice: 0,
        invoiceTaxCode: defaultTax?.taxCode,
        invoiceTaxCodeUuid: defaultTax?.uuid,
        invoiceTaxCodeValue: defaultTax?.taxRate,
        uom: "",
        invoiceNetPrice: 0,
        notes: "",
        uuid: uuidv4()
    });
    setRowDataItems(newRowDataItems);
};

const onDeleteItemNonPO = (
    uuid,
    rowData,
    params,
    setRowDataItems,
    setInvoiceAmountNonPO
) => {
    const newRowData = rowData.filter((item) => item.uuid !== uuid);
    const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
        + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
    const diffTax = rowData.some((item) => item.invoiceTaxCodeValue !== rowData[0]?.invoiceTaxCodeValue);
    let tax;
    if (diffTax) {
        tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
            const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.invoiceNetPrice)
                * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)) / 100);
            return sum + result;
        }, 0));
    } else {
        tax = roundNumberWithUpAndDown((subTotal * rowData[0]?.invoiceTaxCodeValue) / 100);
    }

    const total = roundNumberWithUpAndDown(subTotal + tax);
    params.api.setRowData(newRowData);
    setRowDataItems(newRowData);
    setInvoiceAmountNonPO({
        subTotal,
        tax,
        total
    });
};

const onCellValueChangedItemNonPO = (
    rowDataItems,
    setRowDataItems,
    params,
    setInvoiceAmountNonPO,
    setDirty
) => {
    setDirty();
    const { data, colDef } = params;
    const { field } = colDef;
    const newRowData = [...rowDataItems];

    rowDataItems.forEach((rowData, index) => {
        if (rowData.uuid === data.uuid) {
            newRowData[index] = data;
            if (field === "invoiceTaxCode") {
                newRowData[index].invoiceTaxCodeValue = data.invoiceTaxCode?.taxRate;
            }
            if (field === "invoiceQty"
                || field === "invoiceUnitPrice"
            ) {
                newRowData[index].invoiceQty = Number(data.invoiceQty);
                newRowData[index].invoiceUnitPrice = Number(data.invoiceUnitPrice);
                newRowData[index].invoiceNetPrice = roundNumberWithUpAndDown(
                    newRowData[index].invoiceQty * newRowData[index].invoiceUnitPrice
                );
            }
        }
    });

    if (field === "invoiceTaxCode"
        || field === "invoiceQty"
        || field === "invoiceUnitPrice"
    ) {
        const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
            + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
        const diffTax = newRowData.some((item) => item.invoiceTaxCodeValue !== newRowData[0]?.invoiceTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
                const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.invoiceNetPrice)
                    * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)) / 100);
                return sum + result;
            }, 0));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.invoiceTaxCodeValue) / 100);
        }

        const total = roundNumberWithUpAndDown(subTotal + tax);
        setInvoiceAmountNonPO({
            subTotal,
            tax,
            total
        });
    }

    params.api.setRowData(newRowData);
    setRowDataItems(newRowData);
};

const onCellValueChangedItemPO = (
    params,
    rowDataItemsTypePO,
    setInvoiceAmountPO,
    setRowDataItemsTypePO
) => {
    const { data, colDef } = params;
    const { field } = colDef;
    const newRowData = [...rowDataItemsTypePO];

    rowDataItemsTypePO.forEach((rowData, index) => {
        if (rowData.uuid === data.uuid) {
            newRowData[index] = data;
            if (field === "invoiceTaxCode") {
                newRowData[index].invoiceTaxCodeValue = data.invoiceTaxCode?.taxRate;
                newRowData[index].invoiceTaxCodeUuid = data.invoiceTaxCode?.uuid;
            }
            if (field === "invoiceQty"
                || field === "invoiceUnitPrice"
            ) {
                newRowData[index].invoiceQty = Number(data.invoiceQty);
                newRowData[index].invoiceUnitPrice = Number(data.invoiceUnitPrice);
                newRowData[index].invoiceNetPrice = roundNumberWithUpAndDown(
                    newRowData[index].invoiceQty * newRowData[index].invoiceUnitPrice
                );
            }

            if (field === "invoiceQty") {
                newRowData[index].isEditInvQty = true;
            }

            if (field === "invoiceUnitPrice") {
                newRowData[index].isEditInvUnitPrice = true;
            }
        }
    });

    if (field === "invoiceTaxCode"
        || field === "invoiceQty"
        || field === "invoiceUnitPrice"
    ) {
        const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
            + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
        const diffTax = newRowData.some((item) => item.invoiceTaxCodeValue !== newRowData[0]?.invoiceTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
                const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.invoiceNetPrice)
                    * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)) / 100);
                return sum + result;
            }, 0));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.invoiceTaxCodeValue) / 100);
        }

        const total = roundNumberWithUpAndDown(subTotal + tax);
        setInvoiceAmountPO({
            subTotal,
            tax,
            total
        });
    }

    params.api.setRowData(newRowData);
    setRowDataItemsTypePO(newRowData);
};

const onCellValueChangedItemDO = (
    params,
    rowDataItemsTypeDO,
    setInvoiceAmountDO,
    setRowDataItemsTypeDO
) => {
    const { data, colDef } = params;
    const { field } = colDef;
    const newRowData = [...rowDataItemsTypeDO];

    rowDataItemsTypeDO.forEach((rowData, index) => {
        if (rowData.uuid === data.uuid) {
            newRowData[index] = data;
            if (field === "invoiceTaxCode") {
                newRowData[index].invoiceTaxCodeValue = data.invoiceTaxCode?.taxRate;
                newRowData[index].invoiceTaxCodeUuid = data.invoiceTaxCode?.uuid;
            }
            if (field === "invoiceQty"
                || field === "invoiceUnitPrice"
            ) {
                newRowData[index].invoiceQty = Number(data.invoiceQty);
                newRowData[index].invoiceUnitPrice = Number(data.invoiceUnitPrice);
                newRowData[index].invoiceNetPrice = roundNumberWithUpAndDown(
                    newRowData[index].invoiceQty * newRowData[index].invoiceUnitPrice
                );
            }

            if (field === "invoiceQty") {
                newRowData[index].isEditInvQty = true;
            }

            if (field === "invoiceUnitPrice") {
                newRowData[index].isEditInvUnitPrice = true;
            }
        }
    });

    if (field === "invoiceTaxCode"
        || field === "invoiceQty"
        || field === "invoiceUnitPrice"
        || field === "invoiceTaxCode"
    ) {
        const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
            + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
        const diffTax = newRowData.some((item) => item.invoiceTaxCodeValue !== newRowData[0]?.invoiceTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
                const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.invoiceNetPrice)
                    * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)) / 100);
                return sum + result;
            }, 0));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.invoiceTaxCodeValue) / 100);
        }

        const total = roundNumberWithUpAndDown(subTotal + tax);
        setInvoiceAmountDO({
            subTotal,
            tax,
            total
        });
    }

    params.api.setRowData(newRowData);
    setRowDataItemsTypeDO(newRowData);
};

const addItemManual = (
    rowDataItems,
    setRowDataItems,
    type,
    setAmountToInvoiceDO,
    setAmountToInvoicePO,
    setDirty,
    defaultTax
) => {
    setDirty();
    const newRowDataItems = [...rowDataItems];
    newRowDataItems.push({
        itemName: "",
        itemCode: "",
        itemDescription: "",
        model: "",
        size: "",
        brand: "",
        uom: "",
        notes: "",
        invoiceQty: 0,
        invoiceUnitPrice: 0,
        invoiceTaxCode: defaultTax?.taxCode,
        invoiceTaxCodeUuid: defaultTax?.uuid,
        invoiceTaxCodeValue: defaultTax?.taxRate,
        isManualItem: true,
        invoiceNetPrice: 0,
        poQty: 0,
        poUnitPrice: 0,
        poNetPrice: 0,
        poTaxCodeValue: 0,
        pendingInvoiceNetPrice: 0,
        pendingInvoiceQty: 0,
        pendingInvoiceUnitPrice: 0,
        uuid: uuidv4()
    });
    setRowDataItems(newRowDataItems);
    if (type === INVOICE_CONSTANTS.DO) {
        const subTotal = roundNumberWithUpAndDown(newRowDataItems.reduce(
            (sum, item) => sum + roundNumberWithUpAndDown(item.poNetPrice),
            0
        ));
        const diffTax = newRowDataItems.some((item) => item.poTaxCodeValue !== newRowDataItems[0]?.poTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(newRowDataItems.reduce(
                (sum, item) => {
                    const result = roundNumberWithUpAndDown((
                        roundNumberWithUpAndDown(item.poNetPrice)
                        * roundNumberWithUpAndDown(item.poTaxCodeValue)
                    ) / 100);
                    return sum + result;
                },
                0
            ));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * newRowDataItems[0]?.poTaxCodeValue) / 100);
        }

        const total = roundNumberWithUpAndDown(subTotal + tax);
        setAmountToInvoiceDO({
            subTotal,
            tax,
            total
        });
    }
    if (type === INVOICE_CONSTANTS.PO) {
        const subTotal = roundNumberWithUpAndDown(newRowDataItems.reduce(
            (sum, item) => sum + roundNumberWithUpAndDown(item.pendingInvoiceNetPrice),
            0
        ));
        const diffTax = newRowDataItems.some((item) => item.poTaxCodeValue !== newRowDataItems[0]?.poTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(newRowDataItems.reduce(
                (sum, item) => {
                    const result = roundNumberWithUpAndDown(
                        (roundNumberWithUpAndDown(item.pendingInvoiceNetPrice)
                            * roundNumberWithUpAndDown(item.poTaxCodeValue)) / 100
                    );
                    return sum + result;
                },
                0
            ));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * newRowDataItems[0]?.poTaxCodeValue) / 100);
        }

        const total = roundNumberWithUpAndDown(subTotal + tax);
        setAmountToInvoicePO({
            subTotal,
            tax,
            total
        });
    }
};

const getTotalInvoiceAmount = (
    values,
    invoiceAmountDO,
    invoiceAmountPO,
    invoiceAmountNonPO
) => {
    switch (values.invoiceType) {
    case INVOICE_CONSTANTS.DO:
        return {
            text: `${i18next.t("TotalInvoiceAmount")}:`,
            formatNumber: `${formatDisplayDecimal(invoiceAmountDO?.total, 2, "SGD") || "SGD 0.00"}`,
            value: Number(invoiceAmountDO?.total)
        };
    case INVOICE_CONSTANTS.PO:
        return {
            text: `${i18next.t("TotalInvoiceAmount")}:`,
            formatNumber: `${formatDisplayDecimal(invoiceAmountPO?.total, 2, "SGD") || "SGD 0.00"}`,
            value: Number(invoiceAmountPO?.total)
        };
    case INVOICE_CONSTANTS.NON_PO:
        return {
            text: `${i18next.t("TotalInvoiceAmount")}`,
            formatNumber: `${formatDisplayDecimal(invoiceAmountNonPO?.total, 2, "SGD") || "SGD 0.00"}`,
            value: Number(invoiceAmountNonPO?.total)
        };
    default:
        return {
            text: `${i18next.t("TotalInvoiceAmount")}`,
            formatNumber: "SGD 0.00",
            value: 0
        };
    }
};

const getBalanceWithExceptedValue = (
    values,
    invoiceAmountDO,
    invoiceAmountPO,
    invoiceAmountNonPO
) => {
    if (values.expectedAmountGiven && values.expectedAmount > 0) {
        switch (values.invoiceType) {
        case INVOICE_CONSTANTS.DO: {
            const value = Number((invoiceAmountDO?.total - values.expectedAmount).toFixed(2));
            return {
                text: `${i18next.t("BalanceWithExpectedValue")}:`,
                formatNumber: `${formatDisplayDecimal(value, 2, "SGD") || "SGD 0.00"}`,
                value: Number(invoiceAmountDO?.total) - values.expectedAmount
            };
        }
        case INVOICE_CONSTANTS.PO: {
            const value = Number((invoiceAmountPO?.total - values.expectedAmount).toFixed(2));
            return {
                text: `${i18next.t("BalanceWithExpectedValue")}:`,
                formatNumber: `${formatDisplayDecimal(value, 2, "SGD") || "SGD 0.00"}`,
                value: Number(invoiceAmountPO?.total) - values.expectedAmount
            };
        }
        case INVOICE_CONSTANTS.NON_PO: {
            const value = Number((invoiceAmountNonPO?.total - values.expectedAmount).toFixed(2));
            return {
                text: `${i18next.t("BalanceWithExpectedValue")}:`,
                formatNumber: `${formatDisplayDecimal(value, 2, "SGD") || "SGD 0.00"}`,
                value: Number(invoiceAmountNonPO?.total) - values.expectedAmount
            };
        }
        default:
            return {
                text: `${i18next.t("BalanceWithExpectedValue")}:`,
                formatNumber: "SGD 0.00",
                value: 0
            };
        }
    }
    return {
        text: `${i18next.t("BalanceWithExpectedValue")}:`,
        formatNumber: "SGD 0.00",
        value: 0
    };
};

const getBalance = (
    values,
    amountToInvoiceDO,
    invoiceAmountDO,
    amountToInvoicePO,
    invoiceAmountPO
) => {
    if (values.invoiceType === INVOICE_CONSTANTS.NON_PO) {
        const balance = Number(
            values.expectedAmount
        );
        return {
            text: `${i18next.t("Balance")}:`,
            formatNumber: `${formatDisplayDecimal(balance, 2, "SGD") || "SGD 0.00"}`,
            value: balance
        };
    }
    let value = 0;
    if (values.invoiceType === INVOICE_CONSTANTS.DO) {
        value = Number((amountToInvoiceDO?.total - invoiceAmountDO?.total).toFixed(2));
    } else if (values.invoiceType === INVOICE_CONSTANTS.PO) {
        value = Number((amountToInvoicePO?.total - invoiceAmountPO?.total).toFixed(2));
    }
    return {
        text: `${i18next.t("Balance")}:`,
        formatNumber: `${formatDisplayDecimal(value, 2, "SGD") || "SGD 0.00"}`,
        value
    };
};

const onDeleteItem = (
    uuid, rowData,
    params, values,
    setRowDataItemsTypePO,
    setRowDataItemsTypeDO,
    setInvoiceAmountPO,
    setInvoiceAmountDO
) => {
    const newRowData = rowData.filter((item) => item.uuid !== uuid);
    const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
        + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
    const diffTax = rowData.some((item) => item.invoiceTaxCodeValue !== rowData[0]?.invoiceTaxCodeValue);
    let tax;
    if (diffTax) {
        tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
            const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.invoiceNetPrice)
                * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)) / 100);
            return sum + result;
        }, 0));
    } else {
        tax = roundNumberWithUpAndDown((subTotal * rowData[0]?.invoiceTaxCodeValue) / 100);
    }

    const total = roundNumberWithUpAndDown(subTotal + tax);
    params.api.setRowData(newRowData);
    if (values.invoiceType === INVOICE_CONSTANTS.PO) {
        setRowDataItemsTypePO(newRowData);
        setInvoiceAmountPO({
            subTotal,
            tax,
            total
        });
    }
    if (values.invoiceType === INVOICE_CONSTANTS.DO) {
        setRowDataItemsTypeDO(newRowData);
        setInvoiceAmountDO({
            subTotal,
            tax,
            total
        });
    }
};

const checkObjectExistInArrayDO = (object, array) => {
    const { doUuid, poUuid, itemName } = object;
    if (poUuid && itemName && doUuid) {
        return array.some((item) => item.doUuid === object.doUuid
            && item.poUuid === object.poUuid
            && item.itemName && object.itemName);
    }
    return false;
};

const checkObjectExistInArrayPO = (object, array) => {
    const { poUuid, itemName } = object;
    if (poUuid && itemName) {
        return array.some((item) => item.poUuid === object.poUuid
            && item.itemName && object.itemName);
    }
    return false;
};

export {
    addItemManualTypeNonPO,
    onDeleteItemNonPO,
    onCellValueChangedItemNonPO,
    onCellValueChangedItemPO,
    onCellValueChangedItemDO,
    addItemManual,
    getTotalInvoiceAmount,
    getBalanceWithExceptedValue,
    getBalance,
    onDeleteItem,
    checkObjectExistInArrayPO,
    checkObjectExistInArrayDO
};
