import i18next from "i18next";

const AddItemReqColDefs = [
    {
        header: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete"
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode"
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName"
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription"
    },
    {
        headerName: i18next.t("Mode"),
        field: "itemModel"
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize"
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand"
    },
    {
        headerName: i18next.t("Supplier"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom"
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity"
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency"
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice"
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode"
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate"
    },
    {
        headerName: i18next.t("InSourceCurrencyBeforeTax"),
        field: "inSourceCurrencyBeforeTax"
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate"
    },
    {
        headerName: i18next.t("InDocumentCurrencyBeforeTax"),
        field: "inDocumentCurrencyBeforeTax"
    },
    {
        headerName: i18next.t("TaxAmountInDocumentCurrency"),
        field: "taxAmountInDocumentCurrency"
    },
    {
        headerName: i18next.t("InDocumentCurrencyAfterTax"),
        field: "inDocumentCurrencyAfterTax"
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address"
    },
    {
        headerName: i18next.t("RequestedDeliveryDate"),
        field: "requestedDeliveryDate"
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "accountNumber"
    },
    {
        headerName: i18next.t("Note"),
        field: "note"
    }
];

export default AddItemReqColDefs;
