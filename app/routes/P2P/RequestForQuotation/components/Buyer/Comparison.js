/* eslint-disable max-len */
import React, { useMemo, useState, useEffect } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    Card,
    CardBody
} from "components";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { makeStyles } from "@material-ui/core/styles";
import { AgGridTable } from "routes/components";
import { roundNumberWithUpAndDown, formatDisplayDecimal } from "helper/utilities";
import { v4 as uuidv4 } from "uuid";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { getComparisonSupplierAfterQuoteColDefs } from "../../ColumnDefs";
import Negotiation from "./Negotiation";
import CheckboxRenderer from "./CheckboxRenderer";
import HeaderCheckbox from "./HeaderCheckbox";
import TotalRenderer from "./TotalRenderer";
import { RFQ_CONSTANTS } from "../../helper";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true,
    tooltipComponent: "customTooltip"
};

const useStyles = makeStyles({
    "custom-nav": {
        "&.nav-tabs": {
            borderBottom: "2px solid #DEE2E6"
        },
        "&.nav": {
            padding: "0 16px"
        },
        "&.nav-tabs .nav-link": {
            marginBottom: "-2px",
            border: "2px solid transparent"
        },
        "&.nav-tabs .nav-link.active, &.nav-tabs .nav-item.show .nav-link": {
            borderColor: "#DEE2E6 #DEE2E6 #FFF"
        }
    },
    "custom-card": {
        "&.card": {
            border: 0,
            borderRadius: 0
        }
    }
});

const Comparison = (props) => {
    const {
        t,
        borderTopColor = "#AEC57D",
        defaultExpanded = true,
        rowData = [],
        gridHeight = 300,
        navItemSuppliers,
        activeTabComparisons,
        onChangeTab,
        onGridComparisonReady,
        onCellValueChanged,
        rfqDetails,
        comparisonColDefs,
        suppliersData,
        negotiations,
        negotiationActions,
        pinnedBottomRowData,
        currentSupplier,
        isBuyer,
        disabled,
        setGridApis,
        gridApis,
        viewQuotationsActions,
        values
    } = useMemo(() => props, [props]);

    const classes = useStyles();
    const [supplierIndex, setSupplierIndex] = useState(0);

    useEffect(() => {
        if (activeTabComparisons > 1) {
            setSupplierIndex(activeTabComparisons - 2);
        }
    }, [activeTabComparisons]);

    return (
        <Row className="mb-4">
            <Col xs={12}>
                <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    />
                    <AccordionDetails style={{ display: "block", padding: 0 }}>
                        <Typography component="span" style={{ width: "100%" }}>
                            <Nav tabs className={`mx-0 w-100 ${classes["custom-nav"]}`}>
                                {[t("Comparison")].concat(navItemSuppliers).map((navItem, index) => (
                                    <NavItem key={uuidv4()}>
                                        <NavLink href="#" className={activeTabComparisons === (index + 1) ? "active" : ""} onClick={() => onChangeTab(index + 1)}>
                                            <span className="mx-0">
                                                {navItem}
                                            </span>
                                        </NavLink>
                                    </NavItem>
                                ))}
                            </Nav>
                            {activeTabComparisons === 1 && (
                                <Card className={`${classes["custom-card"]} w-100`}>
                                    <CardBody>
                                        <Row>
                                            <Col xs={12}>
                                                <AgGridTable
                                                    className="ag-theme-custom-react custom-no-rows-to-show"
                                                    columnDefs={comparisonColDefs}
                                                    rowData={[]}
                                                    colDef={defaultColDef}
                                                    pagination={rowData.length > 0}
                                                    paginationPageSize={10}
                                                    gridHeight={pinnedBottomRowData.length ? 450 : 350}
                                                    onGridReady={onGridComparisonReady}
                                                    frameworkComponents={{
                                                        headerCheckbox: HeaderCheckbox,
                                                        checkboxRenderer: CheckboxRenderer,
                                                        customTooltip: CustomTooltip,
                                                        totalRenderer: TotalRenderer
                                                    }}
                                                    onCellValueChanged={onCellValueChanged}
                                                    singleClickEdit
                                                    stopEditingWhenCellsLoseFocus
                                                    pinnedBottomRowData={pinnedBottomRowData}
                                                    getRowHeight={(params) => {
                                                        if (params.node.rowPinned === "bottom") {
                                                            return 110;
                                                        }
                                                        return 41;
                                                    }}
                                                    suppressRowHoverHighlight
                                                    sizeColumnsToFit
                                                />
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            )}

                            {activeTabComparisons > 1 && (
                                <Card className={`${classes["custom-card"]} w-100`}>
                                    <CardBody>
                                        <Row>
                                            <Col xs={12}>
                                                <AgGridTable
                                                    columnDefs={
                                                        getComparisonSupplierAfterQuoteColDefs(disabled)
                                                    }
                                                    rowData={suppliersData[supplierIndex] ? suppliersData[supplierIndex]?.rowData : []}
                                                    colDef={defaultColDef}
                                                    pagination={false}
                                                    paginationPageSize={10}
                                                    treeData
                                                    gridHeight={gridHeight}
                                                    autoGroupColumnDef={{
                                                        headerName: t("ItemCode"),
                                                        cellRendererParams: {
                                                            suppressCount: true
                                                        },
                                                        width: 200,
                                                        valueFormatter: (params) => {
                                                            const { data } = params;
                                                            if (data?.itemCode
                                                                .length === 1
                                                            ) {
                                                                return data?.itemCode[0];
                                                            }
                                                            return "";
                                                        }
                                                    }}
                                                    animateRows
                                                    groupDefaultExpanded={-1}
                                                    getDataPath={(data) => data.itemCode}
                                                    gridOptions={{
                                                        getRowStyle: (params) => {
                                                            const { data } = params;
                                                            const { itemCode } = data;
                                                            if (itemCode?.length === 1) {
                                                                return { background: "#D2D8DE" };
                                                            }
                                                            return { background: "#fff" };
                                                        }
                                                    }}
                                                    frameworkComponents={{
                                                        customTooltip: CustomTooltip
                                                    }}
                                                    singleClickEdit
                                                    stopEditingWhenCellsLoseFocus
                                                    suppressColumnVirtualisation
                                                    onGridReady={(params) => {
                                                        if (!gridApis[supplierIndex]) {
                                                            const newGridApis = [...gridApis];
                                                            newGridApis[supplierIndex] = params.api;
                                                            setGridApis(newGridApis);
                                                        }
                                                    }}
                                                    onCellValueChanged={(params) => {
                                                        const {
                                                            data, colDef, newValue, node
                                                        } = params;
                                                        const { field } = colDef;
                                                        const { itemUnitPrice, itemQuantity } = data;
                                                        if (field === "exchangeRate") {
                                                            node.setDataValue("quotedUnitPriceInDocCurrency", Number(newValue) * itemUnitPrice);
                                                            node.setDataValue("netPrice", Number(newValue) * itemUnitPrice * itemQuantity);
                                                            const newSuppliersData = [...suppliersData];
                                                            newSuppliersData[supplierIndex].rowData?.forEach((item, idx) => {
                                                                if (item.itemCode.length === 1 && item.uuid === data.uuid) {
                                                                    newSuppliersData[supplierIndex].rowData[idx].exchangeRate = Number(newValue);
                                                                    newSuppliersData[supplierIndex].rowData[idx].quotedUnitPriceInDocCurrency = Number(newValue) * itemUnitPrice;
                                                                    newSuppliersData[supplierIndex].rowData[idx].netPrice = Number(newValue) * itemUnitPrice * itemQuantity;
                                                                }
                                                            });
                                                            const newSubTotal = newSuppliersData[supplierIndex].rowData.reduce(
                                                                (sum, item) => {
                                                                    if (item?.itemCode?.length === 1) {
                                                                        return sum + Number(item.quotedUnitPriceInDocCurrency || 0)
                                                                            * Number(item.itemQuantity || 0);
                                                                    }
                                                                    return sum;
                                                                },
                                                                0
                                                            );
                                                            const newTax = newSuppliersData[supplierIndex].rowData.reduce(
                                                                (sum, item) => {
                                                                    if (item?.itemCode?.length === 1) {
                                                                        return sum + (Number(item.quotedUnitPriceInDocCurrency || 0)
                                                                            * Number(item.itemQuantity || 0)
                                                                            * Number(item.taxPercentage || 0))
                                                                            / 100;
                                                                    }
                                                                    return sum;
                                                                },
                                                                0
                                                            );
                                                            const newTotal = newSubTotal + newTax;
                                                            newSuppliersData[supplierIndex].total = {
                                                                subTotal: newSubTotal,
                                                                tax: newTax,
                                                                total: newTotal
                                                            };
                                                            viewQuotationsActions.setSuppliersData(newSuppliersData);
                                                        }
                                                    }}
                                                    // sizeColumnsToFit
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mx-0 mb-4 align-items-end flex-column mt-2 text-secondary" style={{ fontSize: "1rem" }}>
                                            <div style={{ textDecoration: "underline" }}>
                                                {t("InDocumentCurrency")}
                                            </div>
                                            <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                                                <div style={{ width: "200px" }}>
                                                    <div>{`${t("SubTotal")}:`}</div>
                                                    <div>{`${t("Tax")}:`}</div>
                                                    <div>{`${t("Total(include GST)")}:`}</div>
                                                </div>
                                                <div style={{ width: "100px" }}>
                                                    <div>{values.currencyCode}</div>
                                                    <div>{values.currencyCode}</div>
                                                    <div>{values.currencyCode}</div>
                                                </div>
                                                <div style={{ marginLeft: "40px" }}>
                                                    <div>
                                                        {formatDisplayDecimal(
                                                            roundNumberWithUpAndDown(suppliersData[supplierIndex] ? suppliersData[supplierIndex]?.total?.subTotal : 0), 2
                                                        ) || "0.00"}
                                                    </div>
                                                    <div>
                                                        {formatDisplayDecimal(
                                                            roundNumberWithUpAndDown(suppliersData[supplierIndex] ? suppliersData[supplierIndex]?.total?.tax : 0), 2
                                                        ) || "0.00"}
                                                    </div>
                                                    <div>
                                                        {formatDisplayDecimal(
                                                            roundNumberWithUpAndDown(suppliersData[supplierIndex] ? suppliersData[supplierIndex]?.total?.total : 0), 2
                                                        ) || "0.00"}
                                                    </div>
                                                </div>
                                            </Row>
                                        </Row>

                                        <HeaderSecondary
                                            title={t("Negotiation")}
                                            className="mb-2"
                                        />
                                        <Row>
                                            <Col xs={12} md={12} lg={12}>
                                                <Negotiation
                                                    t={t}
                                                    disabled={
                                                        !(rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS)
                                                    }
                                                    negotiationActions={negotiationActions}
                                                    negotiations={negotiations.filter(
                                                        (item) => item.supplierUuid === currentSupplier
                                                    )}
                                                    isBuyer={isBuyer}
                                                />
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            )}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Col>
        </Row>
    );
};

export default Comparison;
