import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const getCatalogueItemColDefs = (isPR) => [
    {
        headerName: i18next.t("ItemCode"),
        field: "catalogueItemCode",
        checkboxSelection: (params) => {
            const { data, context } = params;
            const { selected } = context;
            if (!selected.length) return true;

            const condition1 = data.isSelected;
            const condition2 = selected?.some((e) => e?.itemCode === data.catalogueItemCode);
            const condition3 = selected?.some((e) => {
                const elementContracted = e?.contracted || false;
                const dataContracted = data?.contracted || false;
                return elementContracted !== dataContracted;
            });
            // const suppliers = selected.map((item) => item.supplierName);
            // const contractReferenceNumbers = selected.map((item) => item.contractReferenceNumber);
            // const indexSupplier = suppliers.indexOf(data?.supplierName);
            // const condition4 = indexSupplier > -1
            //     ? contractReferenceNumbers[indexSupplier] === data?.contractReferenceNumber
            //     : false;
            // return !(condition1 || condition2 || condition3 || condition4);
            return !(condition1 || condition2 || condition3);
        },
        width: 180
    },
    {
        headerName: i18next.t("ItemName"),
        field: "catalogueItemName"
    },
    {
        headerName: i18next.t("Category"),
        field: "itemCategory"
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "description"
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        width: 140
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        width: 140
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        width: 140
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        width: 140
    },
    {
        headerName: i18next.t("CatalogueType"),
        field: "itemType",
        cellRenderer: (params) => {
            const { data } = params;
            if (data) {
                if (data.supplierCode) return "Supplier catalogue";
                return "Generic";
            }
            return "";
        },
        valueGetter: (params) => {
            const { data } = params;
            if (data) {
                if (data.supplierCode) return "Supplier catalogue";
                return "Generic";
            }
            return "";
        },
        filter: "agSetColumnFilter",
        filterParams: { values: ["Supplier catalogue", "Generic"] },
        hide: !isPR
    },
    {
        headerName: i18next.t("Contracted?"),
        field: "contracted",
        valueGetter: ({ data }) => (data.contracted ? "Yes" : "No"),
        width: 120
    },
    {
        headerName: i18next.t("ContractReferenceNo"),
        field: "contractedRefNo",
        width: 180
    },
    {
        headerName: i18next.t("ContractedPrice"),
        field: "contractedPrice",
        cellStyle: { textAlign: "right" },
        valueGetter: ({ data }) => (data.contractedPrice || ""),
        width: 150,
        hide: !isPR
    },
    {
        headerName: i18next.t("CompanyWide?"),
        field: "companyWide",
        valueGetter: ({ data }) => (!data.contracted ? "Yes" : "No"),
        width: 150
    },
    {
        headerName: i18next.t("RemainingDrawdownQuantity"),
        field: "remainDrawDownQty",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ValidTo"),
        field: "validTo",
        width: 160
    },
    {
        headerName: i18next.t("Supplier"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        hide: !isPR
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "unitPrice",
        filter: "agNumberColumnFilter",
        cellStyle: { textAlign: "right" },
        hide: !isPR
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        filter: "agNumberColumnFilter",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" },
        hide: !isPR
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "glAccountNumber",
        hide: !isPR
    }
];

export default getCatalogueItemColDefs;
