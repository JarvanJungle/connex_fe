import React from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AgGridTable } from "routes/components";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { Button, Row, Col } from "components";
import { formatDisplayDecimal } from "helper/utilities";
import IconButton from "@material-ui/core/IconButton";
import { getAddedItemCNColDefs } from "../ColumnDefs";

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
        onDeleteItem,
        borderTopColor,
        defaultExpanded,
        gridHeight,
        rowDataItem,
        addItemManual,
        disabled,
        uoms,
        taxRecords,
        glAccounts,
        currencies,
        cnAmountTotal,
        status,
        isBuyer,
        values
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
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("AddItems")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Typography component="span" style={{ width: "100%" }}>
                    {
                        !disabled
                        && (
                            <Row className="justify-content-end mx-0 form-group">
                                <Button
                                    color="primary"
                                    onClick={() => addItemManual()}
                                >
                                    <span className="mr-1">+</span>
                                    <span>{t("AddManual")}</span>
                                </Button>
                            </Row>
                        )
                    }
                    <AgGridTable
                        className="ag-theme-custom-react"
                        columnDefs={
                            getAddedItemCNColDefs(
                                uoms,
                                taxRecords,
                                glAccounts,
                                currencies,
                                disabled,
                                status,
                                isBuyer
                            )
                        }
                        colDef={defaultColDef}
                        rowData={rowDataItem}
                        gridHeight={rowDataItem.length === 0 ? 145 : gridHeight}
                        stopEditingWhenCellsLoseFocus
                        singleClickEdit
                        onCellValueChanged={onCellValueChanged}
                        tooltipShowDelay={0}
                        pagination={false}
                        frameworkComponents={{
                            customTooltip: CustomTooltip,
                            actionDelete: ActionDelete
                        }}
                        autoSizeColumn={false}
                    />
                    <Row className="mx-0 align-items-end flex-column mt-2 text-secondary" style={{ fontSize: "1rem" }}>
                        <Row className="justify-content-end" style={{ width: "380px", textAlign: "right" }}>
                            <Col xs={6}>
                                <div>{`${t("SubTotal")}:`}</div>
                                <div>{`${t("Tax")}:`}</div>
                                <div>{`${t("Total")}:`}</div>
                            </Col>
                            <Col xs={3}>
                                <div>{values?.currencyCode}</div>
                                <div>{values?.currencyCode}</div>
                                <div>{values?.currencyCode}</div>
                            </Col>
                            <Col xs={3}>
                                <div>{formatDisplayDecimal(cnAmountTotal.subTotal, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(cnAmountTotal.tax, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(cnAmountTotal.total, 2) || "0.00"}</div>
                            </Col>
                        </Row>
                    </Row>
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default AddedItem;
