import React, {
    useCallback, useEffect, useRef, useState
} from "react";
import { Input, UncontrolledTooltip } from "reactstrap";
import { Col, Row } from "components";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { AgGridTable } from "routes/components";
import { CustomHeader } from "routes/components/AgGridTable";
import {
    agGridLinkRenderer, formatDisplayDecimal, roundNumberWithUpAndDown, sumArray
} from "helper/utilities";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import getColumnDefs from "./ColumnDefs";
import DecimalPlacesEditModal from "./DecimalPlacesEditModal";
import HeaderCheckbox from "./CustomerHeader/HeaderCheckBox";

const InvoiceAndPO = (props) => {
    const {
        t,
        invoiceList,
        rounded,
        summary,
        currencyCode,
        isThreeWay,
        exchangeRate,
        setExchangeRate,
        editable,
        isEditGL,
        glAccounts,
        onCellValueChanged,
        setFieldValue,
        invoiceStatus,
        apSpecialist
    } = props;
    const decimalPlacesEditModal = useRef(null);
    const [state, setState] = useState({
        loading: false,
        colDefs: [],
        gridApi: null,
        roundedNetPriceConfig: {
            decimalPlaces: rounded.decimalPlaces,
            type: rounded.type
        }
    });
    const [isOpen, setIsOpen] = useState(false);
    const [roundedSummary, setRoundedSummary] = useState(null);
    const differentSummaryStyle = () => ({
        color: summary?.invoice?.subTotal !== summary?.amountToInvoice?.subTotal && "red"
    });

    const calculateRoundedSummary = () => {
        const subTotal = roundNumberWithUpAndDown(sumArray(invoiceList?.map(
            (i) => roundNumberWithUpAndDown(
                i.invoiceQty * i.invoiceUnitPrice,
                state.roundedNetPriceConfig.decimalPlaces,
                state.roundedNetPriceConfig.type
            )
        )));
        const diffTax = invoiceList?.some((item) => item.invoiceTaxCodeValue !== invoiceList[0]?.invoiceTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(sumArray(
                invoiceList?.map(
                    (item) => roundNumberWithUpAndDown(((item?.invoiceQty)
                        * (item?.invoiceUnitPrice)
                        * item?.invoiceTaxCodeValue) / 100)
                )
            ));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * invoiceList[0]?.invoiceTaxCodeValue) / 100);
        }
        setRoundedSummary({
            subTotal,
            tax
        });
    };

    const openEditDecimalModal = useCallback(() => {
        decimalPlacesEditModal?.current?.toggle();
        setIsOpen(true);
    }, [decimalPlacesEditModal]);

    useEffect(() => {
        calculateRoundedSummary();
        state?.gridApi?.setColumnDefs(
            getColumnDefs(state, openEditDecimalModal, isThreeWay)
        );
        if (isOpen) {
            invoiceList.forEach((item, index) => {
                const value = Number(item.invoiceNetPrice)
                    * (1 + Number(item.invoiceTaxCodeValue) / 100);
                invoiceList[index].invoiceNetPriceRounded = formatDisplayDecimal(
                    roundNumberWithUpAndDown(value, state.roundedNetPriceConfig.decimalPlaces,
                        state.roundedNetPriceConfig.type), state.roundedNetPriceConfig.decimalPlaces
                );
                invoiceList[index].invoiceNetPriceRoundedDecimalPlace = state
                    .roundedNetPriceConfig.decimalPlaces;
                invoiceList[index].invoiceNetPriceRoundedType = state.roundedNetPriceConfig.type;
            });
            setFieldValue("invoiceList", invoiceList);
            setFieldValue("state", state);
        }
        state?.gridApi?.setRowData(invoiceList);
    }, [state.roundedNetPriceConfig, isThreeWay]);

    useEffect(() => {
        calculateRoundedSummary();
    }, [invoiceList, state]);

    const onGridReady = (params) => {
        setState((prevState) => ({
            ...prevState,
            data: [],
            gridApi: params.api
        }));
    };

    return (
        <>
            <Row>
                <Col xs={12} className="mb-1">
                    <HeaderSecondary
                        title={t("InvoicePO")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
                <Col xs={12} className="mb-3">
                    {rounded && (
                        <AgGridTable
                            stopEditingWhenCellsLoseFocus
                            singleClickEdit
                            frameworkComponents={{
                                customHeader: CustomHeader,
                                linkRenderer: agGridLinkRenderer,
                                customTooltip: CustomTooltip,
                                taxClaimable: HeaderCheckbox

                            }}
                            colDef={{
                                tooltipComponent: "customTooltip",
                                resizable: true
                            }}
                            columnDefs={
                                getColumnDefs(
                                    state.roundedNetPriceConfig,
                                    openEditDecimalModal,
                                    isThreeWay,
                                    editable,
                                    isEditGL,
                                    glAccounts,
                                    invoiceStatus,
                                    apSpecialist
                                )
                            }
                            gridHeight={350}
                            onGridReady={onGridReady}
                            rowData={invoiceList || []}
                            autoSizeColumn={false}
                            sizeColumnsToFit={false}
                            onCellValueChanged={onCellValueChanged}
                            context={
                                {
                                    invoiceStatus: invoiceStatus,
                                    apSpecialist: apSpecialist
                                }
                            }
                        />
                    )}
                </Col>
                <Col xs={8} className="offset-4 mb-3">
                    <table className="table-borderless summary-section">
                        <tbody
                            className="text-right text-dark"
                            style={{
                                fontSize: 16
                            }}
                        >
                            <tr>
                                <td colSpan={3}><u>{t("Invoice")}</u></td>
                                <td><u>{t("InvoiceRounded")}</u></td>
                                <td><u>{t("AmountToInvoice")}</u></td>
                            </tr>
                            <tr>
                                <td className="text-left">{t("SubTotal")}</td>
                                <td>{currencyCode}</td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(summary?.invoice?.subTotal, 2)}
                                </td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(
                                        roundedSummary?.subTotal,
                                        state.roundedNetPriceConfig.decimalPlaces
                                    )}
                                </td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(summary?.amountToInvoice?.subTotal, 2)}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-left">{t("Tax")}</td>
                                <td>{currencyCode}</td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(summary?.invoice?.tax, 2)}
                                </td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(
                                        roundedSummary?.tax,
                                        state.roundedNetPriceConfig.decimalPlaces
                                    )}
                                </td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(summary?.amountToInvoice?.tax, 2)}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-left">{t("Total")}</td>
                                <td>{currencyCode}</td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(
                                        roundNumberWithUpAndDown(
                                            summary?.invoice?.subTotal + summary?.invoice?.tax
                                        ), 2
                                    )}
                                </td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(
                                        roundNumberWithUpAndDown(summary?.invoice?.subTotal,
                                            state.roundedNetPriceConfig.decimalPlaces,
                                            state.roundedNetPriceConfig.type)
                                        + roundNumberWithUpAndDown(summary?.invoice?.tax,
                                            state.roundedNetPriceConfig.decimalPlaces,
                                            state.roundedNetPriceConfig.type),
                                        state.roundedNetPriceConfig.decimalPlaces
                                    )}
                                </td>
                                <td style={differentSummaryStyle()}>
                                    {formatDisplayDecimal(roundNumberWithUpAndDown(
                                        summary?.amountToInvoice?.subTotal
                                        + summary?.amountToInvoice?.tax
                                    ),
                                        2)}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-left">
                                    {t("ExchangeRateAgainstBaseCurrency")}
                                    <i className="fa fa-info-circle ml-1" id="ExchangeRateInfo" />
                                    <UncontrolledTooltip placement="top" target="ExchangeRateInfo">
                                        {t("ThisRepresentsTheInvoiceRateOrTheAgreedRateWithTheSupplierIfAnyForTaxReportingPurposes")}
                                    </UncontrolledTooltip>
                                </td>
                                <td>
                                    <Input
                                        className={`text-right ${!(Number(exchangeRate) > 0) ? "is-invalid" : ""}`}
                                        type="number"
                                        value={exchangeRate}
                                        onChange={
                                            (e) => {
                                                const MAX_DECIMAL = 14;
                                                if (!(e?.target?.value?.toString()?.split?.(".")[1]?.length > MAX_DECIMAL)) {
                                                    setExchangeRate(e?.target?.value);
                                                }
                                            }
                                        }
                                        step="0.01"
                                        required
                                    />
                                    {!(Number(exchangeRate) > 0) ? (
                                        <div className="invalid-feedback">{t("PleaseEnterValidExchangeRate")}</div>
                                    ) : <br />}
                                </td>
                            </tr>
                            <tr>
                                <td />
                                <td />
                                <td>
                                    <u>{t("InvoiceBaseCurrency")}</u>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-left">{t("SubTotal")}</td>
                                <td>{currencyCode}</td>
                                <td>
                                    {formatDisplayDecimal(
                                        roundedSummary?.subTotal * exchangeRate,
                                        state.roundedNetPriceConfig.decimalPlaces
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-left">{t("Tax")}</td>
                                <td>{currencyCode}</td>
                                <td>
                                    {formatDisplayDecimal(
                                        roundedSummary?.tax * exchangeRate,
                                        state.roundedNetPriceConfig.decimalPlaces
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="text-left">{t("Total")}</td>
                                <td>{currencyCode}</td>
                                <td>
                                    {formatDisplayDecimal(roundNumberWithUpAndDown(
                                        (roundedSummary?.subTotal + roundedSummary?.tax)
                                        * exchangeRate
                                    ),
                                        state.roundedNetPriceConfig.decimalPlaces)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
            </Row>
            <DecimalPlacesEditModal
                ref={decimalPlacesEditModal}
                action={(decimalPlaces, type) => {
                    setState((prevState) => ({
                        ...prevState,
                        roundedNetPriceConfig: {
                            decimalPlaces,
                            type
                        }
                    }));
                }}
                decimalPlaces={state.roundedNetPriceConfig.decimalPlaces}
                roundType={state.roundedNetPriceConfig.type}
            />
        </>
    );
};

export default InvoiceAndPO;
