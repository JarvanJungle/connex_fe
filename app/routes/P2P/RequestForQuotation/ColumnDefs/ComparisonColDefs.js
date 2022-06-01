import i18next from "i18next";
import { roundNumberWithUpAndDown } from "helper/utilities";
import { formatNumber, formatStyleNumber } from "../helper";

const ComparisonColDefs = [
    {
        headerName: i18next.t("RequestDetails"),
        children: [
            {
                headerName: i18next.t("ItemCode"),
                field: "itemCode",
                colSpan: (params) => {
                    if (params?.node?.rowPinned === "bottom") {
                        return 11;
                    }
                    return 1;
                },
                width: 180
            },
            {
                headerName: i18next.t("ItemName"),
                field: "itemName",
                width: 220
            },
            {
                headerName: i18next.t("ItemDescription"),
                field: "itemDescription",
                tooltipField: "itemDescription",
                tooltipComponentParams: {
                    fieldTooltip: "itemDescription",
                    isShow: true
                },
                width: 220
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
                field: "uom",
                width: 140
            },
            {
                headerName: i18next.t("RequestedQuantity"),
                field: "itemQuantity",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 140
            },
            {
                headerName: i18next.t("Currency"),
                field: "sourceCurrency",
                width: 140
            },
            {
                headerName: i18next.t("Price"),
                field: "itemUnitPrice",
                cellStyle: formatStyleNumber,
                width: 140
            },
            {
                headerName: i18next.t("NetPrice"),
                field: "netPrice",
                cellRenderer: ({ value }) => roundNumberWithUpAndDown(value),
                cellStyle: formatStyleNumber,
                width: 140
            }
        ]
    }
];

export default ComparisonColDefs;
