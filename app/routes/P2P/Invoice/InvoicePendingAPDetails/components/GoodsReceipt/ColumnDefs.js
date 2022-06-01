import i18next from "i18next";
import { formatNumberForRow } from "helper/utilities";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { GOODS_RECEIPT_ROUTES } from "routes/P2P/GoodReceipts";
import { formatStyleNumber } from "helper/utilities";

export default [
    {
        headerName: i18next.t("PONumber"),
        field: "purchaseOrderNumber",
        sort: "desc",
        cellRenderer: "linkRenderer",
        cellRendererParams: (params) => ({
            ...params,
            endPoint: PURCHASE_ORDER_ROUTES.PO_DETAILS,
            uuidField: "purchaseOrderUuid",
            state: { data: params?.data }
        }),
        width: 180
    },
    {
        headerName: i18next.t("GRNumber"),
        field: "grNumber",
        cellRenderer: "linkRenderer",
        cellRendererParams: {
            endPoint: GOODS_RECEIPT_ROUTES.GR_LIST_GR_DETAILS,
            uuidField: "grUuid"
        },
        width: 180
    },
    {
        headerName: i18next.t("DO Number"),
        field: "deliveryOrderNumber",
        suppressSizeToFit: true,
        cellRenderer: "linkCellRendererDO"
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        width: 180
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        width: 180
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        width: 160
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
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        // valueFormatter: formatNumberForRow,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("Quantity"),
        field: "qtyReceived",
        // valueFormatter: formatNumberForRow,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("NetPrice"),
        field: "itemNetPrice",
        valueFormatter: formatNumberForRow,
        cellStyle: formatStyleNumber,
        width: 140
    }
];
