import React from "react";
import PropTypes from "prop-types";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { AgGridReact } from "ag-grid-react/lib/agGridReact";
import getDatePicker from "components/DatePickerVanilla/DatePickerVanilla";
import CustomTooltip from "./CustomTooltip";
import getContractItemColDefs from "./ConlumnDefs/ContractItemColDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ItemContractList = (props) => {
    const {
        disabled,
        rowDataItem,
        gridHeight,
        onCellValueChanged,
        borderTopColor,
        defaultExpanded,
        onDeleteItem,
        addresses,
        uoms,
        currencies,
        taxRecords,
        glAccounts,
        note
    } = props;

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

    const AddressCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {value ? value.addressLabel : ""}
            </span>
        );
    };

    const UOMCodeCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {typeof value === "object" ? value.uomCode : (value || "")}
            </span>
        );
    };

    const CurrencyCellRenderer = (params) => {
        const { value, data } = params;
        return (
            <>
                {
                    value && value.currencyName && value.currencyCode && !data?.isView
                        ? (
                            <span>
                                {`${value.currencyName} (+${value.currencyCode})`}
                            </span>
                        ) : (
                            <span>
                                {(typeof value === "object") ? `${value.currencyName} (+${value.currencyCode})` : value}
                            </span>
                        )
                }
            </>
        );
    };

    const currencyCellTableRenderer = (params) => {
        const { value, data } = params;
        return (
            <>
                {
                    value && value.currencyName && value.currencyCode && !data?.isView
                        ? (
                            <span>
                                {value.currencyCode}
                            </span>
                        ) : (
                            <span>
                                {(typeof value === "object") ? `${value.currencyCode}` : value}
                            </span>
                        )
                }
            </>
        );
    };

    const TaxRecordCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {typeof value === "object" ? value.taxCode : value}
            </span>
        );
    };

    const AccountCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {value ? value.accountNumber : ""}
            </span>
        );
    };

    const NoteCellRenderer = (params) => {
        const { value } = params;
        return (
            <span>
                {value ? value.note : ""}
            </span>
        );
    };
    return (
        <>
            <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>
                        <AgGridReact
                            className="ag-theme-custom-react"
                            columnDefs={getContractItemColDefs(addresses,
                                uoms,
                                currencies,
                                taxRecords,
                                glAccounts,
                                note,
                                disabled)}
                            rowData={rowDataItem}
                            defaultColDef={defaultColDef}
                            containerStyle={{ height: gridHeight }}
                            stopEditingWhenCellsLoseFocus
                            frameworkComponents={{
                                actionDelete: ActionDelete,
                                addressCellRenderer: AddressCellRenderer,
                                uomCodeCellRenderer: UOMCodeCellRenderer,
                                currencyCellRenderer: CurrencyCellRenderer,
                                currencyCellTableRenderer: currencyCellTableRenderer,
                                taxRecordCellRenderer: TaxRecordCellRenderer,
                                accountCellRenderer: AccountCellRenderer,
                                noteCellRenderer: NoteCellRenderer,
                                customTooltip: CustomTooltip
                            }}
                            components={{ datePicker: getDatePicker() }}
                            singleClickEdit
                            onCellValueChanged={onCellValueChanged}
                            tooltipShowDelay={0}
                        />
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

ItemContractList.propTypes = {
    rowDataItem: PropTypes.instanceOf(Array).isRequired,
    gridHeight: PropTypes.number,
    borderTopColor: PropTypes.string,
    defaultExpanded: PropTypes.bool,
    onDeleteItem: PropTypes.func,
    disabled: PropTypes.bool
};
ItemContractList.defaultProps = {
    gridHeight: 300,
    defaultExpanded: false,
    borderTopColor: "#AEC57D",
    onDeleteItem: () => { },
    disabled: false
};

export default ItemContractList;
