/* eslint-disable camelcase */
import React, { useMemo, useEffect, useState } from "react";
import {
    Row, Col, ButtonToolbar, Button
} from "components";
import { HeaderSecondary, AddItemDialog } from "routes/components";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import AgDropdownInput from "components/AgDropdownInput";
import { AgGridTable } from "routes/components/AgGridTable";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { v4 as uuidv4 } from "uuid";
import {
    formatDateTime, roundNumberWithUpAndDown,
    formatDisplayDecimal, convertDate2String
} from "helper/utilities";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import CatalogueService from "services/CatalogueService";
import UserService from "services/UserService";
import classNames from "classnames";
import { getPOItemsColDefs, getCatalogueItemColDefs, getForecastItemColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const PRICE_TYPE_DEFAULT = [
    { priceType: "FOC" },
    { priceType: "INCLUDED" },
    { priceType: "TO ADVISE" },
    { priceType: "AS PER CONTRACT" }
];

const getDatePicker = () => {
    function Datepicker() { }
    Datepicker.prototype.init = function (params) {
        this.eInput = document.createElement("input");
        this.eInput.setAttribute("type", "date");
        this.eInput.classList.add("form-control");
        this.eInput.style.cssText = "height: 42px";
        this.cell = params.eGridCell;
        this.oldWidth = this.cell.style.width;
        this.cell.style.width = "200px";
        this.cell.style.height = "42px";
        this.eInput.value = params.value;
    };
    Datepicker.prototype.getGui = function () {
        return this.eInput;
    };
    Datepicker.prototype.afterGuiAttached = function () {
        this.eInput.focus();
        this.eInput.select();
    };
    Datepicker.prototype.getValue = function () {
        this.cell.style.width = this.oldWidth;
        return this.eInput.value;
    };
    Datepicker.prototype.destroy = function () { };
    Datepicker.prototype.isPopup = function () {
        return false;
    };

    return Datepicker;
};

const PurchaseOrderItems = React.memo(({
    gridHeight,
    uoms,
    currencies,
    addresses,
    glAccounts,
    taxRecords,
    disabled,
    isProject,
    isSupplier,
    categories,
    gridApi,
    setGridApi,
    poItemDtoList,
    values,
    setDirty,
    inSourceCurrencyTotal,
    setInSourceCurrencyTotal,
    inDocumentCurrencyTotal,
    setInDocumentCurrencyTotal,
    setFieldValue,
    prCreator,
    showToast,
    poStatus,
    convertFrom,
    contracted,
    setContracted,
    approvalRef
}) => {
    const { t } = useTranslation();
    const [rowDeleted, setRowDeleted] = useState(null);
    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [showAddForecast, setShowAddForecast] = useState(false);
    const [selectedCatalogueItems, setSelectedCatalogueItems] = useState([]);
    const [selectedForecastItems, setSelectedForecastItems] = useState([]);

    const [columnDefs, setColumnDefs] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setColumnDefs(getPOItemsColDefs(
                uoms, currencies, addresses,
                glAccounts, taxRecords, disabled,
                isProject, isSupplier, categories,
                PRICE_TYPE_DEFAULT, convertFrom
            ));
        });
    }, [uoms, currencies, addresses,
        glAccounts, taxRecords,
        isProject, isSupplier, categories,
        convertFrom]);
    useEffect(() => {
        setColumnDefs(null);
        setTimeout(() => {
            setColumnDefs(getPOItemsColDefs(
                uoms, currencies, addresses,
                glAccounts, taxRecords, disabled,
                isProject, isSupplier, categories,
                PRICE_TYPE_DEFAULT, convertFrom
            ));
        });
    }, [disabled]);

    const CatalogueItemColDefs = useMemo(
        () => getCatalogueItemColDefs(convertFrom === FEATURE.PR),
        [convertFrom]
    );

    const ForecastItemColDefs = useMemo(
        () => getForecastItemColDefs(convertFrom === FEATURE.PR),
        [convertFrom]
    );

    const getRowData = () => {
        if (!gridApi) return [];

        const rowData = [];
        gridApi.forEachNode((node) => {
            if (node) rowData.push(node?.data);
        });

        return rowData;
    };

    const calculateTotal = () => {
        const rowDataItemReq = getRowData();
        // In Source Currency
        const subTotalInSourceCurrency = roundNumberWithUpAndDown(rowDataItemReq.reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.inSourceCurrencyBeforeTax),
            0
        ));
        const diffTax = rowDataItemReq.some((item) => item.taxRate !== rowDataItemReq[0]?.taxRate);
        let taxInSourceCurrency;
        if (diffTax) {
            taxInSourceCurrency = roundNumberWithUpAndDown(rowDataItemReq.reduce(
                (a, b) => a + roundNumberWithUpAndDown(
                    (b.taxRate) * roundNumberWithUpAndDown(b.inSourceCurrencyBeforeTax) * 0.01
                ),
                0
            ));
        } else {
            taxInSourceCurrency = roundNumberWithUpAndDown((subTotalInSourceCurrency * rowDataItemReq[0]?.taxRate) / 100);
        }
        // const taxInSourceCurrency = roundNumberWithUpAndDown(rowDataItemReq.reduce(
        //     (a, b) => a + roundNumberWithUpAndDown(
        //         (b.taxRate) * roundNumberWithUpAndDown(b.inSourceCurrencyBeforeTax) * 0.01
        //     ),
        //     0
        // ));
        const totalInSourceCurrency = roundNumberWithUpAndDown(
            subTotalInSourceCurrency + taxInSourceCurrency
        );
        // In Document Currency
        const subTotalInDocumentCurrency = roundNumberWithUpAndDown(rowDataItemReq.reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.inDocumentCurrencyBeforeTax),
            0
        ));
        let taxInDocumentCurrency;
        if (diffTax) {
            taxInDocumentCurrency = roundNumberWithUpAndDown(rowDataItemReq.reduce(
                (a, b) => a + roundNumberWithUpAndDown(b.taxAmountInDocumentCurrency),
                0
            ));
        } else {
            taxInDocumentCurrency = roundNumberWithUpAndDown((subTotalInDocumentCurrency * rowDataItemReq[0]?.taxRate) / 100);
        }
        // const taxInDocumentCurrency = roundNumberWithUpAndDown(rowDataItemReq.reduce(
        //     (a, b) => a + roundNumberWithUpAndDown(b.taxAmountInDocumentCurrency),
        //     0
        // ));
        const totalInDocumentCurrency = roundNumberWithUpAndDown(
            subTotalInDocumentCurrency + taxInDocumentCurrency
        );

        // set state
        setInSourceCurrencyTotal({
            subTotal: subTotalInSourceCurrency,
            tax: taxInSourceCurrency,
            total: totalInSourceCurrency
        });
        setInDocumentCurrencyTotal({
            subTotal: subTotalInDocumentCurrency,
            tax: taxInDocumentCurrency,
            total: totalInDocumentCurrency
        });
        setContracted(rowDataItemReq.length > 0 ? rowDataItemReq[0]?.contracted : false);
    };

    const setDataAgGrid = () => {
        const rowDataItemReq = poItemDtoList.map(
            ({
                deliveryAddress,
                gl_account,
                currency,
                supplierUuid,
                uomCode,
                requestDeliveryDate,
                manualEntry,
                quantity,
                ...res
            }) => {
                const requestedDeliveryDate = formatDateTime(
                    requestDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD
                );

                const itemReq = {
                    ...res,
                    sourceCurrency: currency,
                    address: deliveryAddress,
                    accountNumber: gl_account,
                    uom: uomCode,
                    requestedDeliveryDate,
                    uuid: uuidv4(),
                    manualItem: manualEntry,
                    itemQuantity: quantity,
                    existingItem: true
                };

                itemReq.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(
                    (itemReq.itemQuantity || 0) * (itemReq.itemUnitPrice || 0)
                );
                itemReq.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(
                    itemReq.inSourceCurrencyBeforeTax * (itemReq.exchangeRate || 0)
                );
                itemReq.taxAmountInDocumentCurrency = roundNumberWithUpAndDown(
                    ((itemReq.taxRate || 0) * itemReq.inDocumentCurrencyBeforeTax) / 100
                );
                itemReq.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(
                    itemReq.inDocumentCurrencyBeforeTax + itemReq.taxAmountInDocumentCurrency
                );

                return itemReq;
            }
        );

        gridApi?.setRowData(rowDataItemReq);
        calculateTotal();
    };

    const addItemReqManual = () => {
        setFieldValue("isInsensitive", true);
        setDirty();
        const requestedDeliveryDate = values.deliveryDate
            ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
            : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD);
        const sourceCurrency = currencies.find(
            (item) => item.currencyCode.toLowerCase() === values.sourceCurrencyCode.toLowerCase()
        );
        const newRowData = {
            uuid: uuidv4(),
            itemCode: "",
            itemName: "",
            itemDescription: "",
            itemModel: "",
            itemSize: "",
            itemBrand: "",
            supplierName: "",
            supplierUuid: "",
            sourceCurrency,
            uom: "",
            itemUnitPrice: 0,
            itemQuantity: 0,
            taxCode: "",
            taxRate: 0,
            exchangeRate: 1,
            address: addresses[0] ?? "",
            requestedDeliveryDate,
            accountNumber: "",
            note: "",
            projectForecastTradeCode: "",
            manualItem: true,
            itemCategory: categories[0] ?? "",
            firstTime: true,
            priceType: null
        };

        gridApi?.applyTransaction({
            add: [newRowData]
        });
    };

    const onCellValueChanged = (params) => {
        const {
            colDef, newValue, node, data
        } = params;
        const { field } = colDef;
        if (field === "sourceCurrency") {
            const exchangeRate = data?.sourceCurrency?.exchangeRate ?? 1;
            node.setDataValue("exchangeRate", exchangeRate);
        }
        if (field === "itemUnitPrice") {
            node.setDataValue("firstTime", false);
            if (Number(newValue) > 0) node.setDataValue("priceType", null);
            gridApi.redrawRows({ rowNodes: [node] });
        }
        if (field === "priceType") {
            if (newValue) node.setDataValue("itemUnitPrice", 0);
            gridApi.redrawRows({ rowNodes: [node] });
        }
        if (field === "taxCode") {
            const taxRate = data?.taxCode?.taxRate ?? 0;
            if (newValue) node.setDataValue("taxRate", taxRate);
        }
        if (field === "itemQuantity") {
            setFieldValue("isInsensitive", true);
        }

        if (
            field === "sourceCurrency"
            || field === "itemUnitPrice"
            || field === "priceType"
            || field === "taxCode"
            || field === "itemQuantity"
            || field === "exchangeRate"
        ) {
            const itemQuantity = Number(data.itemQuantity ?? 0);
            const itemUnitPrice = Number(data.itemUnitPrice ?? 0);
            const exchangeRate = Number(data.exchangeRate ?? 1);
            const taxRate = Number(data.taxRate ?? 0);
            const inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(
                itemQuantity * itemUnitPrice
            );
            const inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(
                Number(inSourceCurrencyBeforeTax) * exchangeRate
            );
            const taxAmountInDocumentCurrency = roundNumberWithUpAndDown(
                (taxRate * Number(inDocumentCurrencyBeforeTax)) / 100
            );
            const inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(
                Number(inDocumentCurrencyBeforeTax) + Number(taxAmountInDocumentCurrency)
            );
            node.setDataValue("inSourceCurrencyBeforeTax", inSourceCurrencyBeforeTax);
            node.setDataValue("inDocumentCurrencyBeforeTax", inDocumentCurrencyBeforeTax);
            node.setDataValue("taxAmountInDocumentCurrency", taxAmountInDocumentCurrency);
            node.setDataValue("inDocumentCurrencyAfterTax", inDocumentCurrencyAfterTax);
            calculateTotal();
        }
    };

    const getDataFunc = async (query) => {
        try {
            const response = await CatalogueService.getCataloguesV2(
                UserService.getCurrentCompanyUuid(), query
            );
            return response?.data?.data;
        } catch (error) {
            showToast(
                "error",
                error.response
                    ? `getDataFunc: ${error.response.data.message}`
                    : `getDataFunc: ${error.message}`
            );
        }
        return [];
    };

    const backendServerConfigForecast = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc({ ...query, project: values.projectCode })
    }), [values.projectCode]);

    const backendServerConfigCatalogue = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc(query)
    }), []);

    const onAddNewItemCatalogue = () => {
        setFieldValue("isInsensitive", true);
        setDirty();
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [];
        setShowAddCatalogue(false);
        selectedCatalogueItems.forEach((node) => {
            const { data } = node;
            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === values.sourceCurrencyCode.toLowerCase()
            );

            let exchangeRate = 0;
            if (sourceCurrency) {
                exchangeRate = sourceCurrency.exchangeRate;
            }

            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: true,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: values?.supplier?.companyName,
                supplierUuid: values?.supplier?.uuid,
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: glAccounts.find(
                    (item) => item.accountNumber === data.glAccountNumber
                ),
                itemCategory: { categoryName: data.itemCategory },
                manualItem: false,
                firstTime: false,
                priceType: null
            };

            itemRequest.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(
                data.itemQuantity * data.itemUnitPrice
            );
            itemRequest.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(
                itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate
            );
            itemRequest.taxAmountInDocumentCurrency = roundNumberWithUpAndDown(
                (itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100
            );
            itemRequest.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(
                itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency
            );
            newRowData.push(itemRequest);
        });
        gridApi?.applyTransaction({
            add: newRowData
        });
        setSelectedCatalogueItems([]);
        calculateTotal();
    };

    const onAddNewItemForecast = () => {
        setFieldValue("isInsensitive", true);
        setDirty();
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [];
        setShowAddForecast(false);
        selectedForecastItems.forEach((node) => {
            const { data } = node;
            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === values?.sourceCurrencyCode.toLowerCase()
            );
            const uom = uoms.find(
                (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
            );
            const taxCode = taxRecords.find(
                (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
            );
            const accountNumber = glAccounts.find(
                (item) => item.accountNumber === data.glAccountNumber
            );
            const requestedDeliveryDate = values.deliveryDate
                ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD);
            const exchangeRate = sourceCurrency?.exchangeRate ?? 0;
            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom,
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: true,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode,
                taxRate: data.taxRate,
                supplierName: values?.supplier?.companyName,
                supplierUuid: values?.supplier?.uuid,
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate,
                accountNumber,
                itemCategory: { categoryName: data.itemCategory },
                projectForecastTradeCode: data.projectForecastTradeCode,
                manualItem: false,
                firstTime: false,
                priceType: null
            };

            itemRequest.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(
                data.itemQuantity * data.itemUnitPrice
            );
            itemRequest.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(
                itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate
            );
            itemRequest.taxAmountInDocumentCurrency = roundNumberWithUpAndDown(
                (itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100
            );
            itemRequest.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(
                itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency
            );
            newRowData.push(itemRequest);
        });
        gridApi?.applyTransaction({
            add: newRowData
        });
        setSelectedForecastItems([]);
        calculateTotal();
    };

    useEffect(() => {
        if (gridApi && poItemDtoList.length) {
            setDataAgGrid();
        }
    }, [gridApi, poItemDtoList]);

    useEffect(() => {
        if (rowDeleted) {
            calculateTotal();
        }
    }, [rowDeleted]);
    // useEffect(() => {
    //     if (values.changeNatureApproval) {
    //         setDataAgGrid();
    //         setFieldValue("changeNatureApproval", true);
    //     }
    //     gridApi?.redrawRows();
    // }, [values.approvalRouteUuid, values.changeNatureApproval]);

    const ActionDelete = (params) => {
        const { data } = params;
        return (
            <>
                <IconButton
                    size="small"
                    onClick={() => {
                        setFieldValue("isInsensitive", true);
                        params.api.applyTransaction({
                            remove: [data]
                        });
                        setRowDeleted(data);
                    }}
                    style={{ color: "red" }}
                >
                    <i className="fa fa-trash" />
                </IconButton>
            </>
        );
    };

    return (
        <>
            <Row className="mx-0 justify-content-between">
                <HeaderSecondary
                    title={t("PurchaseOrderItems")}
                    className="mb-2"
                />
                {["PENDING_REVIEW", "SENT_BACK", "RECALLED"].includes(poStatus) && prCreator && (
                    <ButtonToolbar className="justify-content-end mb-2">
                        <Button
                            color="primary"
                            onClick={() => {
                                if (!values.project) setShowAddCatalogue(true);
                                else setShowAddForecast(true);
                            }}
                            className="mr-1"
                        >
                            <span className="mr-1">+</span>
                            <span>{t("AddCatalogue")}</span>
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                addItemReqManual();
                            }}
                            className="mr-1"
                            disabled={contracted}
                        >
                            <span className="mr-1">+</span>
                            <span>{t("AddManual")}</span>
                        </Button>
                    </ButtonToolbar>
                )}
            </Row>
            <Row className={classNames(
                { "mb-2": convertFrom === FEATURE.PR },
                { "mb-4": convertFrom === FEATURE.PPR }
            )}
            >
                <Col xs={12} md={12} lg={12}>
                    <AgGridTable
                        columnDefs={columnDefs}
                        colDef={defaultColDef}
                        rowData={[]}
                        gridHeight={gridHeight}
                        pagination={false}
                        onCellValueChanged={onCellValueChanged}
                        singleClickEdit
                        stopEditingWhenCellsLoseFocus
                        autoSizeColumn={false}
                        components={{ datePicker: getDatePicker() }}
                        gridOptions={{ getRowNodeId: (data) => data.uuid }}
                        context={{ approvalRoute: !!values.approvalRouteUuid }}
                        onGridReady={(params) => { if (!gridApi) setGridApi(params?.api); }}
                        frameworkComponents={{
                            actionDelete: ActionDelete,
                            customTooltip: CustomTooltip,
                            agDropdownInput: AgDropdownInput
                        }}
                    />
                </Col>
            </Row>

            {isSupplier && (convertFrom === FEATURE.PR) && (
                <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                    <div style={{ textDecoration: "underline" }}>
                        {t("InSourceCurrency")}
                    </div>
                    <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                        <div style={{ width: "200px" }}>
                            <div>{`${t("SubTotal")}:`}</div>
                            <div>{`${t("Tax")}:`}</div>
                            <div>{`${t("Total(include GST)")}:`}</div>
                        </div>
                        <div style={{ width: "100px" }}>
                            <div>{values.sourceCurrencyCode}</div>
                            <div>{values.sourceCurrencyCode}</div>
                            <div>{values.sourceCurrencyCode}</div>
                        </div>
                        <div style={{ marginLeft: "40px" }}>
                            <div>{formatDisplayDecimal(inSourceCurrencyTotal?.subTotal, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(inSourceCurrencyTotal?.tax, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(inSourceCurrencyTotal?.total, 2) || "0.00"}</div>
                        </div>
                    </Row>
                </Row>
            )}
            {!isSupplier && (convertFrom === FEATURE.PR) && (
                <Row className="mx-0 justify-content-end mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                    <Col lg={4} md={4}>
                        <div style={{ textDecoration: "underline", textAlign: "right" }}>
                            {t("InSourceCurrency")}
                        </div>
                        <Row className="justify-content-end" style={{ textAlign: "right" }}>
                            <Col xs={6}>
                                <div>{`${t("SubTotal")}:`}</div>
                                <div>{`${t("Tax")}:`}</div>
                                <div>{`${t("Total(include GST)")}:`}</div>
                            </Col>
                            <Col xs={3}>
                                <div>{values.sourceCurrencyCode}</div>
                                <div>{values.sourceCurrencyCode}</div>
                                <div>{values.sourceCurrencyCode}</div>
                            </Col>
                            <Col xs={3}>
                                <div>{formatDisplayDecimal(inSourceCurrencyTotal?.subTotal, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(inSourceCurrencyTotal?.tax, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(inSourceCurrencyTotal?.total, 2) || "0.00"}</div>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={2} md={2}>
                        <div style={{ textDecoration: "underline", textAlign: "right", marginRight: -15 }}>
                            {t("InDocumentCurrency")}
                        </div>
                        <Row className="justify-content-end" style={{ textAlign: "right" }}>
                            <Col xs={6}>
                                <div>{values.currencyCode}</div>
                                <div>{values.currencyCode}</div>
                                <div>{values.currencyCode}</div>
                            </Col>
                            <Col xs={6} style={{ textAlign: "right", paddingRight: 0 }}>
                                <div>{formatDisplayDecimal(inDocumentCurrencyTotal?.subTotal, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(inDocumentCurrencyTotal?.tax, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(inDocumentCurrencyTotal?.total, 2) || "0.00"}</div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )}

            {/* Add Catalogue Dialog */}
            <AddItemDialog
                isShow={showAddCatalogue}
                onHide={() => {
                    setShowAddCatalogue(false);
                    setSelectedCatalogueItems([]);
                }}
                title={t("AddCatalogue")}
                onPositiveAction={() => onAddNewItemCatalogue()}
                onNegativeAction={() => {
                    setShowAddCatalogue(false);
                    setSelectedCatalogueItems([]);
                }}
                columnDefs={CatalogueItemColDefs}
                rowDataItem={[]}
                onSelectionChanged={(params) => {
                    setSelectedCatalogueItems(params.api.getSelectedNodes());
                }}
                pageSize={10}
                selected={getRowData()}
                backendPagination
                backendServerConfig={backendServerConfigCatalogue}
            />
            {/* Add Forecast And Catalogue Dialog */}
            <AddItemDialog
                isShow={showAddForecast}
                onHide={() => {
                    setShowAddForecast(false);
                    setSelectedForecastItems([]);
                }}
                title={t("AddCatalogue")}
                onPositiveAction={() => onAddNewItemForecast()}
                onNegativeAction={() => {
                    setShowAddForecast(false);
                    setSelectedForecastItems([]);
                }}
                columnDefs={ForecastItemColDefs}
                rowDataItem={[]}
                onSelectionChanged={(params) => {
                    setSelectedForecastItems(params.api.getSelectedNodes());
                }}
                pageSize={10}
                selected={getRowData()}
                backendPagination
                backendServerConfig={backendServerConfigForecast}
            />
        </>
    );
});

export default PurchaseOrderItems;
