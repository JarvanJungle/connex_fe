import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const ForecastItemColDefsPR = [
    {
        headerName: i18next.t("ItemCode"),
        field: "catalogueItemCode",
        checkboxSelection: (params) => {
            const { data, context } = params;
            return !(
                data.isSelected
                || context?.selected?.some((e) => e?.itemCode === data.catalogueItemCode)
            );
        },
        minWidth: 200
    },
    {
        headerName: i18next.t("ItemName"),
        field: "catalogueItemName"
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "description",
        tooltipField: "description",
        tooltipComponentParams: {
            fieldTooltip: "description",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Model"),
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
        headerName: i18next.t("UOM"),
        field: "uomCode"
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
        }
    },
    {
        headerName: i18next.t("Forecasted?"),
        field: "forecasted",
        valueGetter: ({ data }) => (data.forecasted || data.forecast ? "Yes" : "No"),
        filter: false
    },
    {
        headerName: i18next.t("ForecastedPrice"),
        field: "forecastedPrice",
        valueGetter: ({ data }) => data?.forecast?.itemUnitPrice ?? data?.forecastedPrice,
        valueFormatter: ({ value }) => formatDisplayDecimal(Number(value), 2),
        cellStyle: { textAlign: "right" },
        filter: false
    },
    {
        headerName: i18next.t("ForecastedQty"),
        field: "forecastedQty",
        valueGetter: ({ data }) => data?.forecast?.itemQuantity ?? data?.forecastedQty,
        valueFormatter: ({ value }) => formatDisplayDecimal(Number(value), 2),
        cellStyle: {
            textAlign: "right"
        },
        filter: false
    },
    {
        headerName: i18next.t("TradeCode"),
        field: "tradeCode",
        valueGetter: ({ data }) => data?.forecast?.tradeCode
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
        width: 150
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
        field: "currencyCode"
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "unitPrice",
        filter: "agNumberColumnFilter",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellRenderer: formatNumber,
        filter: "agNumberColumnFilter",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Category"),
        field: "itemCategory"
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "glAccountNumber"
    }
];

export default ForecastItemColDefsPR;
