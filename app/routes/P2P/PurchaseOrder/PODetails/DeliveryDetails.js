import React, { useMemo } from "react";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { AgGridTable } from "routes/components";
import { defaultColDef, formatDisplayDecimal, minusToPrecise } from "helper/utilities";
import i18next from "i18next";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import _ from "lodash";

const formatNumberForRow = ({ value }) => formatDisplayDecimal(value, 2);
const numberRowStyled = { textAlign: "right" };

const COLUMN_DEFS = [
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
        field: "itemDescription",
        tooltipField: "itemDescription",
        tooltipComponent: "customTooltip",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: true
        }
    },
    {
        headerName: i18next.t("PO Quantity"),
        field: "poQuantity",
        // valueFormatter: formatNumberForRow,
        cellStyle: numberRowStyled
    },
    {
        headerName: i18next.t("Total Qty Received"),
        field: "qtyReceived",
        // valueFormatter: formatNumberForRow,
        cellStyle: numberRowStyled

    },
    {
        headerName: i18next.t("Qty Pending Delivery"),
        field: "qtyPendingDelivery",
        // valueGetter: ({ data }) => data.poQuantity - data.qtyReceived,
        // valueFormatter: formatNumberForRow,
        cellStyle: numberRowStyled

    },
    {
        headerName: i18next.t("Delivery Completed"),
        field: "deliveryCompleted",
        valueGetter: ({ data, context }) => (data.poQuantity === data.qtyReceived || context?.poStatus === "CLOSED" ? "Yes" : "No")
    },
    {
        headerName: i18next.t("InvoicedQty"),
        field: "invoiceQty",
        // valueFormatter: formatNumberForRow,
        cellStyle: numberRowStyled

    },
    {
        headerName: i18next.t("PendingInvoiceQty"),
        field: "pendingInvoiceQty",
        valueGetter: ({ data }) => minusToPrecise(data.poQuantity, data.invoiceQty),
        // valueFormatter: formatNumberForRow,
        cellStyle: numberRowStyled

    },
    {
        headerName: i18next.t("Invoice Completed"),
        field: "invoiceCompleted",
        valueGetter: ({ data }) => (data.poQuantity === data.invoiceQty ? "Yes" : "No")

    }
];

const DeliveryDetails = ({ items, poStatus }) => {
    const deliveryItems = useMemo(() => {
        const groupedByCode = _.groupBy(items, "itemCode");
        return Object.keys(groupedByCode).map((itemCode) => {
            const deliveryOrders = groupedByCode[itemCode];
            return {
                itemCode,
                ...deliveryOrders[0],
                qtyReceived: _.sum(deliveryOrders.map((e) => e.qtyReceived))
            };
        });
    }, [items]);
    return (
        <div className="my-3">
            <HeaderSecondary
                title={i18next.t("Delivery Details")}
                className="mb-2"
            />
            <AgGridTable
                columnDefs={COLUMN_DEFS}
                colDef={defaultColDef}
                rowData={deliveryItems}
                gridHeight={deliveryItems?.length ? 300 : 150}
                pagination={false}
                autoSizeColumn={false}
                frameworkComponents={{
                    customTooltip: CustomTooltip
                }}
                context={{ poStatus }}
            />
        </div>
    );
};

export default DeliveryDetails;
