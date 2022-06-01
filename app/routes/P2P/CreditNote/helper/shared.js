import { roundNumberWithUpAndDown } from "helper/utilities";
import { v4 as uuidv4 } from "uuid";

const onDeleteItem = (
    uuid,
    rowDataItems,
    params,
    setFieldValue,
    setCNAmountTotal,
    isBuyer
) => {
    const newRowData = rowDataItems.filter((item) => item.uuid !== uuid);
    const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
    + roundNumberWithUpAndDown(item.netPrice), 0));
    const tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
        const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.netPrice)
        * (item.taxPercent)) / 100);
        return sum + result;
    }, 0));
    const total = roundNumberWithUpAndDown(subTotal + tax);
    params.api.setRowData(newRowData);
    setFieldValue("itemList", newRowData);
    if (newRowData.length === 0) {
        setFieldValue("invoiceUuid", "");
        if (!isBuyer) {
            setFieldValue("referenceToInvoice", false);
        }
    }
    setCNAmountTotal({
        subTotal,
        tax,
        total
    });
};

const onCellValueChanged = (
    params,
    rowDataItems,
    setFieldValue,
    setCNAmountTotal
) => {
    const { data, colDef } = params;
    const { field } = colDef;
    const newRowData = [...rowDataItems];
    rowDataItems.forEach((rowData, index) => {
        if (rowData.uuid === data.uuid) {
            newRowData[index] = data;
            if (field === "taxCode") {
                newRowData[index].taxPercent = data.taxCode?.taxRate;
            }
            if (field === "itemQuantity"
                || field === "unitPrice"
                || field === "exchangeRate"
            ) {
                newRowData[index].itemQuantity = Number(data.itemQuantity);
                newRowData[index].unitPrice = Number(data.unitPrice);
                newRowData[index].exchangeRate = Number(data.exchangeRate);
                newRowData[index].netPrice = roundNumberWithUpAndDown(Number(data.itemQuantity)
                    * Number(data.unitPrice)
                    * Number(data.exchangeRate));
            }
            if (field === "currencyCode") {
                newRowData[index].exchangeRate = Number(data.currencyCode?.exchangeRate);
                newRowData[index].netPrice = roundNumberWithUpAndDown(Number(data.itemQuantity)
                    * Number(data.unitPrice)
                    * Number(data.currencyCode?.exchangeRate));
            }
        }
    });

    if (field === "itemQuantity"
        || field === "unitPrice"
        || field === "taxCode"
        || field === "exchangeRate"
        || field === "currencyCode"
    ) {
        const subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
        + roundNumberWithUpAndDown(item.netPrice), 0));
        const tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
            const result = roundNumberWithUpAndDown((roundNumberWithUpAndDown(item.netPrice)
            * (item.taxPercent)) / 100);
            return sum + result;
        }, 0));
        const total = roundNumberWithUpAndDown(subTotal + tax);
        setCNAmountTotal({
            subTotal,
            tax,
            total
        });
    }

    params.api.setRowData(newRowData);
    setFieldValue("itemList", newRowData);
};

const addItemManual = (
    rowDataItems,
    setFieldValue,
    setDirty
) => {
    setDirty();
    const newRowDataItems = [...rowDataItems];
    let currencyCode = "";
    if (newRowDataItems.length > 0) {
        currencyCode = newRowDataItems[0].currencyCode || "";
    }
    newRowDataItems.push({
        itemDescription: "",
        itemQuantity: 0,
        unitPrice: 0,
        exchangeRate: currencyCode?.exchangeRate || 1,
        netPrice: 0,
        taxCode: "",
        taxPercent: 0,
        notes: "",
        uomCode: "",
        invItemCode: "",
        invItemDescription: "",
        invItemModel: "",
        invItemSize: "",
        invItemBrand: "",
        currencyCode,
        manualItem: true,
        uuid: uuidv4()
    });
    setFieldValue("itemList", newRowDataItems);
};

export {
    addItemManual,
    onDeleteItem,
    onCellValueChanged
};
