import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const ContractItemColDefs = [
    {
        headerName: i18next.t("ItemCode"),
        field: "catalogueItemCode",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 200
    },
    {
        headerName: i18next.t("ItemName"),
        field: "catalogueItemName"
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
        headerName: i18next.t("UOMForecast"),
        field: "uomCode"
    },
    {
        headerName: i18next.t("Supplier"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "unitPrice",
        // cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ContractNumber"),
        field: "contactNumber"
    },
    {
        headerName: i18next.t("Category"),
        field: "categoryDto",
        cellRenderer: (params) => {
            const { data } = params;
            if (data) {
                if (data.categoryDto) {
                    const { categoryDto } = data;
                    const { categoryName } = categoryDto;
                    return categoryName;
                }
            }
            return "";
        }
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "glAccountNumber"
    },
    {
        headerName: i18next.t("TradeCode"),
        field: "tradeCode"
    }
];

export default ContractItemColDefs;
