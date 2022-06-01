import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Row,
    Col
} from "components";
import { CommonConfirmDialog } from "routes/components";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import ExtVendorService from "services/ExtVendorService";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { HeaderMain } from "routes/components/HeaderMain";
import urlConfig from "services/urlConfig";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import {
    closeConfirmDisconnectDialog,
    disconnectSupplier,
    filterSellerAndBuyer,
    getAllPaymentTerms,
    getExternalVendors, reconnectSupplier,
    settingGridApi,
    settingUuidSupplierDisconnect,
    showConfirmDisconnectDialog, showConfirmReConnectDialog,
    uploadDataVendor
} from "actions/externalVendorActions";
import { useSelector, useDispatch } from "react-redux";
import UserService from "services/UserService";
import TaxRecordDataService from "services/TaxRecordService";
import { usePermission } from "routes/hooks";
import { VendorGrid, VendorGridButtonToolbar, VendorsGridFilterCheckboxes } from "../components";
import { getFieldValue, getListVendor } from "./Helper";

const ListVendor = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [taxRecords, setTaxRecords] = useState([]);
    const vendorPermission = usePermission(FEATURE.EXTERNAL_VENDOR);

    const [filterStates, setFilterStates] = useState({
        seller: false,
        buyer: false
    });
    const dispatch = useDispatch();
    const externalVendorSelector = useSelector((state) => state.externalVendorReducer);
    const {
        paymentTerms,
        externalVendors,
        externalVendorsFilter,
        gridApi,
        showConfirmDisconnectionDialog,
        showConfirmReconnectionDialog,
        uuidSupplierDisconnect
    } = externalVendorSelector;
    const uploadButtonRef = useRef(null);

    const onGridReady = (params) => {
        dispatch(settingGridApi(params.api));
    };

    const onRowDoubleClick = (event) => {
        history.push(urlConfig.VENDOR_EXT_DETAILS + event.data.uuid);
    };

    const onExtFilterChange = (key, checked) => {
        setFilterStates((prevStates) => ({
            ...prevStates,
            [key]: checked
        }));
    };

    useEffect(() => {
        dispatch(getExternalVendors(UserService.getCurrentCompanyUuid()));
        dispatch(getAllPaymentTerms(UserService.getCurrentCompanyUuid()));

        try {
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            TaxRecordDataService.getTaxRecords(companyRole.companyUuid).then((response) => {
                const taxRecordsList = response.data.data;

                if (taxRecordsList.length > 0) {
                    setTaxRecords(taxRecordsList);
                } else {
                    throw new Error(response.data.message);
                }
            });
        } catch (error) {
            const { message } = error.response.data;
            showToast("error", message);
        }
    }, []);

    useEffect(() => {
        dispatch(filterSellerAndBuyer(filterStates.seller, filterStates.buyer, externalVendors));
    }, [filterStates]);

    const onAddPressHandler = () => {
        history.push(urlConfig.CREATE_EXT_VENDOR);
    };

    const onDownloadPressHandler = () => {
        gridApi
            .exportDataAsCsv({
                fileName: CSVTemplates.ManageExtVendor_List_DownloadFileName,
                columnKeys: [
                    "connectionStatus",
                    "companyCode",
                    "companyName",
                    "uen",
                    "gstRegBusiness",
                    "defaultSupplierUser.fullName",
                    "defaultSupplierUser.emailAddress",
                    "systemStatus"
                ],
                processCellCallback: (cell) => {
                    if (cell.column?.colId === "gstRegBusiness") {
                        return cell.value === "yes" ? "Yes" : "No";
                    }
                    return cell.value;
                }
            });
    };

    const handleOnDrop = async (data) => {
        const body = [];

        if (data && data.length) {
            data.forEach((row, rowIdx) => {
                if (rowIdx !== 0 && row?.data?.length > 1) {
                    const item = {};
                    item.companyCode = getFieldValue(data, rowIdx, "Company Code");
                    item.companyName = getFieldValue(data, rowIdx, "Company Name");

                    item.supplierUserList = [
                        {
                            fullName: getFieldValue(data, rowIdx, "Contact Name 1"),
                            emailAddress: getFieldValue(data, rowIdx, "Email Address 1"),
                            countryCode: getFieldValue(data, rowIdx, "Country Code 1"),
                            workNumber: getFieldValue(data, rowIdx, "Work Number 1"),
                            default: true
                        }
                    ];

                    if (getFieldValue(data, rowIdx, "Contact Name 2")) {
                        item.supplierUserList.push({
                            fullName: getFieldValue(data, rowIdx, "Contact Name 2"),
                            emailAddress: getFieldValue(data, rowIdx, "Email Address 2"),
                            countryCode: getFieldValue(data, rowIdx, "Country Code 2"),
                            workNumber: getFieldValue(data, rowIdx, "Work Number 2")
                        });
                    }
                    const paymentTermUuid = paymentTerms.find(
                        (element) => element.ptDays === Number(getFieldValue(data, rowIdx, "Payment Term"))
                    )?.ptUuid ?? "";
                    item.paymentTerm = { ptUuid: paymentTermUuid };

                    item.uen = getFieldValue(data, rowIdx, "Company Reg. No");
                    item.gstRegBusiness = getFieldValue(data, rowIdx, "Tax Registered Business") === "Yes"
                        ? "Registered" : "No Registered";

                    item.countryOfOrigin = getFieldValue(data, rowIdx, "Country of Origin");

                    if (item.gstRegBusiness === "Registered") {
                        item.gstRegNo = getFieldValue(data, rowIdx, "Tax Reg. No.");
                        const taxCode = getFieldValue(data, rowIdx, "Tax Code");
                        const taxUuid = taxRecords.find((element) => element.taxCode === taxCode)?.uuid ?? "";
                        item.tax = { uuid: taxUuid };
                        item.taxUuid = taxUuid;
                    }

                    item.addressesDto = [
                        {
                            addressLabel: getFieldValue(data, rowIdx, "Address Label 1"),
                            addressFirstLine: getFieldValue(data, rowIdx, "Address Line 1"),
                            addressSecondLine: getFieldValue(data, rowIdx, "Address Line 2"),
                            city: getFieldValue(data, rowIdx, "City"),
                            state: getFieldValue(data, rowIdx, "State/Province"),
                            country: getFieldValue(data, rowIdx, "Country"),
                            postalCode: getFieldValue(data, rowIdx, "Postal Code"),
                            default: true
                        }
                    ];

                    if (getFieldValue(data, rowIdx, "Address Label 2")) {
                        item.addressesDto.push({
                            addressLabel: getFieldValue(data, rowIdx, "Address Label 2"),
                            addressFirstLine: getFieldValue(data, rowIdx, "Address Label 2", 1),
                            addressSecondLine: getFieldValue(data, rowIdx, "Address Label 2", 2),
                            city: getFieldValue(data, rowIdx, "Address Label 2", 3),
                            state: getFieldValue(data, rowIdx, "Address Label 2", 4),
                            country: getFieldValue(data, rowIdx, "Address Label 2", 5),
                            postalCode: getFieldValue(data, rowIdx, "Address Label 2", 6)
                        });
                    }

                    item.buyer = getFieldValue(data, rowIdx, "Is Buyer")?.trim() === "Yes";
                    item.seller = getFieldValue(data, rowIdx, "Is Supplier")?.trim() === "Yes";
                    body.push(item);
                }
            });
        }

        dispatch(uploadDataVendor(UserService.getCurrentCompanyUuid(), body)).then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                dispatch(getExternalVendors(UserService.getCurrentCompanyUuid()));
                showToast("success", res.data.message);
            } else {
                showToast("error", res.data.message);
            }
        }).catch((error) => {
            showToast("error", error.response.data.message || error);
        });
    };

    const handleOnError = (error) => {
        showToast("error", error.message);
    };

    const handleOpenDialog = (e) => {
        if (uploadButtonRef.current) {
            uploadButtonRef.current.open(e);
        }
    };

    const selectCell = (event) => {
        if (event.colDef.headerName === "Action") {
            if (event.data.connected === "Connected") {
                dispatch(settingUuidSupplierDisconnect(event.data.uuid));
                dispatch(showConfirmDisconnectDialog());
            } else {
                dispatch(settingUuidSupplierDisconnect(event.data.uuid));
                dispatch(showConfirmReConnectDialog());
            }
        }
    };

    const handleNegativeAction = () => {
        dispatch(closeConfirmDisconnectDialog());
    };

    const handlePositiveAction = async () => {
        const isDisconnection = showConfirmDisconnectionDialog;
        dispatch(closeConfirmDisconnectDialog());
        if (isDisconnection) {
            dispatch(
                disconnectSupplier(UserService.getCurrentCompanyUuid(), uuidSupplierDisconnect)
            ).then((res) => {
                if (res.data.status === RESPONSE_STATUS.OK) {
                    showToast("success", res.data.message);
                    dispatch(getExternalVendors(UserService.getCurrentCompanyUuid()));
                } else {
                    showToast("error", res.data.message);
                }
            }).catch((error) => {
                showToast("error", error.message || error);
            });
        } else {
            try {
                const supplierDetails = (await ExtVendorService.getExternalVendorDetails(
                    UserService.getCurrentCompanyUuid(),
                    uuidSupplierDisconnect
                ))?.data?.data;
                await dispatch(reconnectSupplier(UserService.getCurrentCompanyUuid(), supplierDetails));
                showToast("success", "A connection request is sent to vendor successfully.");
            } catch (e) {
                showToast("error", e?.response?.data?.message ?? e?.message);
            }
        }
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ManageExtVendor")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <Row lg={12} className="px-3">
                        <VendorsGridFilterCheckboxes
                            t={t}
                            seller={filterStates.seller}
                            buyer={filterStates.buyer}
                            onChange={onExtFilterChange}
                        />
                        <VendorGridButtonToolbar
                            t={t}
                            onAddPressHandler={onAddPressHandler}
                            buttonRef={uploadButtonRef}
                            handleOnDrop={handleOnDrop}
                            handleOnError={handleOnError}
                            handleOpenDialog={handleOpenDialog}
                            onDownloadPressHandler={onDownloadPressHandler}
                            hasWritePermission={vendorPermission.write}
                        />
                    </Row>
                    <VendorGrid
                        columnDefs={ExtVendorService.getVendorsColDefs(t, !vendorPermission.write)}
                        rowData={
                            (!filterStates.seller && filterStates.buyer)
                                || (filterStates.seller && !filterStates.buyer)
                                ? getListVendor(externalVendorsFilter)
                                : getListVendor(externalVendors)
                        }
                        onGridReady={onGridReady}
                        onRowDoubleClicked={onRowDoubleClick}
                        paginationPageSize={10}
                        onCellClicked={selectCell}
                    />
                </Col>
            </Row>
            <CommonConfirmDialog
                isShow={(showConfirmDisconnectionDialog || showConfirmReconnectionDialog)}
                onHide={handleNegativeAction}
                title={t(showConfirmDisconnectionDialog ? "Supplier Disconnection" : "Supplier Reconnection")}
                content={t(`Are you sure you want to ${showConfirmDisconnectionDialog ? "disconnect" : "reconnect"} this supplier?`)}
                positiveProps={
                    {
                        onPositiveAction: handlePositiveAction,
                        contentPositive: showConfirmDisconnectionDialog ? "Disconnect" : "Reconnect",
                        colorPositive: showConfirmDisconnectionDialog ? "danger" : "primary"
                    }

                }
                negativeProps={
                    {
                        onNegativeAction: handleNegativeAction,
                        colorNegative: "link"
                    }
                }
            />
        </Container>
    );
};

export default ListVendor;
