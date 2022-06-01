import React from "react";
import { useTranslation } from "react-i18next";
import { AgGridTable } from "routes/components";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { Button, Row, Col } from "components";
import { formatDisplayDecimal } from "helper/utilities";
import IconButton from "@material-ui/core/IconButton";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { getAddedItemNonPOColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const AddedItem = (props) => {
    const {
        onCellValueChanged,
        gridHeight,
        rowDataItem,
        addItemManual,
        taxRecords,
        uoms,
        disabled,
        onDeleteItem,
        invoiceAmountNonPO
    } = props;
    const { t } = useTranslation();

    const ActionDelete = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid, rowData, params)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    return (
        <>
            {disabled && (
                <HeaderSecondary
                    title={t("AddItem")}
                    className="mb-2"
                />
            )}
            {!disabled && (
                <Row className="justify-content-between mx-0 mt-3 mb-1">
                    <HeaderSecondary
                        title={t("AddItem")}
                        className="my-2"
                    />
                    <Button
                        color="primary"
                        onClick={() => addItemManual()}
                        style={{ height: 34 }}
                    >
                        <span className="mr-1">+</span>
                        <span>{t("AddManual")}</span>
                    </Button>
                </Row>
            )}
            <AgGridTable
                className="ag-theme-custom-react"
                columnDefs={getAddedItemNonPOColDefs(uoms, taxRecords, disabled)}
                colDef={defaultColDef}
                rowData={rowDataItem}
                gridHeight={rowDataItem.length === 0 ? 145 : gridHeight}
                stopEditingWhenCellsLoseFocus
                singleClickEdit
                onCellValueChanged={onCellValueChanged}
                tooltipShowDelay={0}
                pagination={false}
                frameworkComponents={{
                    actionDelete: ActionDelete,
                    customTooltip: CustomTooltip
                }}
                autoSizeColumn={false}
            />
            <Row className="mx-0 align-items-end flex-column mt-2 text-secondary" style={{ fontSize: "1rem" }}>
                <div style={{ textDecoration: "underline" }}>
                    {t("Invoice")}
                </div>
                <Row className="justify-content-end" style={{ width: "380px", textAlign: "right" }}>
                    <Col xs={6}>
                        <div>{`${t("SubTotal")}:`}</div>
                        <div>{`${t("Tax")}:`}</div>
                        <div>{`${t("Total")}:`}</div>
                    </Col>
                    <Col xs={3}>
                        <div>{t("SGD")}</div>
                        <div>{t("SGD")}</div>
                        <div>{t("SGD")}</div>
                    </Col>
                    <Col xs={3}>
                        <div>{formatDisplayDecimal(invoiceAmountNonPO?.subTotal, 2) || "0.00"}</div>
                        <div>{formatDisplayDecimal(invoiceAmountNonPO?.tax, 2) || "0.00"}</div>
                        <div>{formatDisplayDecimal(invoiceAmountNonPO?.total, 2) || "0.00"}</div>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default AddedItem;
