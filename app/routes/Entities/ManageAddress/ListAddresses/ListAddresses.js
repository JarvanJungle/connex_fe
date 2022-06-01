import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AddressDataService from "services/AddressService";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";

import {
    Container,
    ButtonToolbar,
    ButtonGroup,
    Button,
    Row,
    Col,
    Media
} from "components";

import {
    AgGridReact
} from "components/agGrid";

import { CommonConfirmDialog } from "routes/components";
import useToast from "routes/hooks/useToast";
import UploadButton from "routes/components/UploadButton";
import { useSelector } from "react-redux";
import _ from "lodash";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";

const ListAddresses = () => {
    let message = "Opp! Something went wrong.";
    const toast = useToast();
    const activateModalRef = useRef(null);

    const _showToast = (type) => toast(type, message);

    const { t, i18n } = useTranslation();
    const history = useHistory();
    const [addresses, setAddresses] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [companyUuid, setCompanyUuid] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deactivationShow, setDeactivationShow] = useState(false);
    const [activationShow, setActivationShow] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [activationButtonVisibility, setActivationButtonVisibility] = useState("hidden");
    const [deactivateOne, setDeactivateOne] = useState(true);
    const [activateOne, setActivateOne] = useState(true);

    const handleRolePermission = usePermission(FEATURE.ADDRESS);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;

    const setAddressesRetrieveFromDB = (data) => {
        const addressesList = [];

        for (const item of data) {
            let detailAddress = item.addressFirstLine;
            if (item.addressSecondLine && item.addressSecondLine.length > 0) {
                detailAddress += `,${item.addressSecondLine}`;
            }
            const address = {
                ...item,
                detailAddress,
                pulledAt: Date.now()
            };
            addressesList.push(address);
        }
        setAddresses(addressesList);
        setActivationButtonVisibility("hidden");
    };

    const retrieveAddresses = () => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        setCompanyUuid(companyRole.companyUuid);
        AddressDataService.getCompanyAddresses(companyRole.companyUuid).then((res) => {
            if (res.data.status === "OK") {
                setAddressesRetrieveFromDB(res.data.data);
            } else {
                message = res.data.message;
                _showToast("error");
            }
        }).catch((error) => {
            message = error.response.data.message;
            _showToast("error");
        });
    };

    const selectAddress = (event) => {
        history.push(URL_CONFIG.ADDRESS_DETAILS + event.data.uuid);
    };

    const handleExport = () => {
        gridApi.exportDataAsCsv({
            fileName: CSVTemplate.Address_List_DownloadFileName,
            columnKeys: ["addressLabel", "detailAddress", "city", "state", "country", "postalCode", "default", "active"]
        });
    };

    const defaultColDef = {
        editable: false,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        resizable: true,
        sortable: true
    };

    const viewRenderer = (params) => {
        if (params.data.active) {
            return "<span style=\"color:red; cursor: pointer;\"><i class=\"fa fa-close\" style=\"font-size:15px;color:red\"></i>&emsp;Deactivate</span>";
        }

        return "<span style=\"color:navy; cursor: pointer; \"><i class=\"fa fa-plus\" style=\"font-size:15px;color:navy\"></i>&emsp;Reactivate</span>";
    };

    const columnDefs = (write) => [
        {
            headerName: t("Address Label"),
            field: "addressLabel",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            sort: "asc",
            checkboxSelection: ({ data }) => (!data.default && write)
        },
        {
            headerName: t("Detailed Address"),
            field: "detailAddress"
        },
        {
            headerName: t("City"),
            field: "city"
        },
        {
            headerName: t("State/Province"),
            field: "state"
        },
        {
            headerName: t("Country"),
            field: "country"
        },
        {
            headerName: t("Postal Code"),
            field: "postalCode"
        },
        {
            headerName: t("Is Default"),
            field: "default",
            valueGetter: ({ data }) => (data.default ? "Yes" : "No")
        },
        {
            headerName: t("IsActive"),
            field: "active",
            valueGetter: ({ data }) => (data.active ? "Yes" : "No"),
            sort: "desc",
            sortIndex: 1
        },
        {
            field: "updatedOn",
            sort: "desc",
            sortIndex: 0,
            hide: true
        },
        {
            headerName: t("Action"),
            field: "action",
            cellRenderer: (params) => (params.data.default ? "" : viewRenderer(params)),
            resizable: true,
            hide: !write
        }
    ];

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    useEffect(() => {
        retrieveAddresses();
    }, []);

    const handleOnDrop = (data) => {
        setIsLoading(true);
        const massUpload = [];
        let defaultCount = 0;
        for (let i = 0; i < data.length; i++) {
            // check if the row is empty row or header or sample data
            if (data[i].data[0] !== "" && !data[i].data[0].includes("Address Label") && !data[i].data[0].includes(CSVTemplate.Address_List_Data[0].addresslabel)) {
                // other than city and address line 2, all fields must not be empty
                if (data[i].data[0] && data[i].data[1] && data[i].data[4] && data[i].data[5] && data[i].data[6] && data[i].data[7] && data[i].data[8]) {
                    const isDefault = data[i].data[7].toLowerCase() === "yes";
                    const isActive = data[i].data[8].toLowerCase() === "yes";

                    // check and ensure that at most, there is only one default address
                    if (isDefault) {
                        defaultCount += 1;
                        if (defaultCount === 2) {
                            message = CSVTemplate.Address_List_Duplicated_Defaults_Error;
                            _showToast("error");
                            setIsLoading(false);
                            return;
                        }
                    }
                    const uploadItem = {
                        addressLabel: data[i].data[0],
                        addressFirstLine: data[i].data[1],
                        addressSecondLine: data[i].data[2],
                        city: data[i].data[3],
                        state: data[i].data[4],
                        country: data[i].data[5],
                        postalCode: data[i].data[6],
                        default: isDefault,
                        active: isActive
                    };
                    massUpload.push(uploadItem);
                } else {
                    message = CSVTemplate.NeededFields_Error;
                    _showToast("error");
                    setIsLoading(false);
                    return;
                }
            }
        }
        AddressDataService.massUploadAddresses(massUpload, companyUuid).then((res) => {
            if (res.data.status === "OK") {
                setIsLoading(false);
                message = "Mass Upload Done";
                _showToast("success");
                retrieveAddresses();
            } else {
                message = res.data.message;
                _showToast("error");
                setIsLoading(false);
            }
        }).catch((error) => {
            message = error.response.data.message;
            _showToast("error");
            setIsLoading(false);
        });
    };

    const handleOnError = (err, file, inputElem, reason) => {
        message = err;
        _showToast("error");
    };

    const buttonRef = React.createRef();

    const handleDeactivationClose = () => setDeactivationShow(false);
    const handleDeactivationShow = () => setDeactivationShow(true);
    const handleActivationClose = () => setActivationShow(false);
    const handleActivationShow = () => setActivationShow(true);

    const selectCell = (event) => {
        if (event.colDef.headerName == "Action") {
            console.log(event);
            setSelectedAddress(event.data.uuid);
            if (event.data.active) {
                setDeactivateOne(true);
                handleDeactivationShow();
            } else {
                setActivateOne(true);
                handleActivationShow();
            }
        }
    };

    const handleDeactivation = () => {
        deactivatingAddress([selectedAddress], "Address Deactivated");
    };

    const handleDeactivationAddresses = () => {
        const selectedNodes = gridApi.getSelectedNodes().filter((node) => !node.data.default);
        const selectedData = selectedNodes.map((node) => node.data.uuid);
        deactivatingAddress(selectedData, "Addresses Deactivated");
    };

    const deactivatingAddress = (addressesUuid, successMessage) => {
        handleDeactivationClose();
        AddressDataService.deactivateAddresses(addressesUuid).then((res) => {
            if (res.data.status === "OK") {
                message = successMessage;
                _showToast("success");
                retrieveAddresses();
            } else {
                message = res.data.message;
                _showToast("error");
            }
        }).catch((error) => {
            message = error.response.data.message;
            _showToast("error");
        });
    };

    const handleActivation = () => {
        activatingAddress([selectedAddress], "Address Activated");
    };

    const handleActivationAddresses = () => {
        const selectedNodes = gridApi.getSelectedNodes().filter((node) => !node.data.default);
        const selectedData = selectedNodes.map((node) => node.data.uuid);
        activatingAddress(selectedData, "Addresses Activated");
    };

    const activatingAddress = (addressesUuid, successMessage) => {
        handleActivationClose();
        AddressDataService.activateAddresses(addressesUuid).then((res) => {
            if (res.data.status === "OK") {
                message = successMessage;
                _showToast("success");
                retrieveAddresses();
            } else {
                message = res.data.message;
                _showToast("error");
            }
        }).catch((error) => {
            message = error.response.data.message;
            _showToast("error");
        });
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridApi.getSelectedNodes();
        const defaultAddress = selectedNodes?.find((node) => node?.data?.default);
        if (selectedNodes.length - Number(!!defaultAddress) > 0) {
            setActivationButtonVisibility("visible");
        } else {
            setActivationButtonVisibility("hidden");
        }
    };

    return (
        <>
            <Container fluid>
                {/* <Row className="mb-1"> */}
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("Company Address List")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            <div style={{ visibility: activationButtonVisibility }}>
                                <Button
                                    color="primary"
                                    className="mb-2 mr-2 px-3"
                                    onClick={
                                        () => setActivateOne(false) || handleActivationShow()
                                    }
                                >
                                    {t("Activate")}
                                </Button>
                                <Button
                                    color="danger"
                                    className="mb-2 mr-2 px-3"
                                    onClick={
                                        () => setDeactivateOne(false) || handleDeactivationShow()
                                    }
                                >
                                    {t("Deactivate")}
                                </Button>
                            </div>
                            <ButtonToolbar className="ml-auto">
                                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                    <i className="fa fa-download" />
                                    {" "}
                                    {t("Download")}
                                </Button>
                                {handleRolePermission?.write && (
                                    <>
                                        <UploadButton
                                            isLoading={isLoading}
                                            buttonRef={buttonRef}
                                            translation={t}
                                            handleOnDrop={handleOnDrop}
                                            handleOnError={handleOnError}
                                            handleOpenDialog={(e) => buttonRef?.current?.open(e)}
                                        />
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <CSVLink data={CSVTemplate.Address_List_Data} headers={CSVTemplate.Address_List_Headers} filename={CSVTemplate.Address_List_TemplatesFilename} style={{ color: "white" }}>
                                                <i className="fa fa-download" />
                                                {" "}
                                                {t("Template")}
                                            </CSVLink>
                                        </Button>
                                        <Link to={URL_CONFIG.CREATE_ADDRESS}>
                                            <Button color="primary" className="mb-2 mr-2 px-3">
                                                <i className="fa fa-plus" />
                                                {" "}
                                                {t("Create New")}
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </ButtonToolbar>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                            <AgGridReact
                                columnDefs={columnDefs(handleRolePermission?.write)}
                                defaultColDef={defaultColDef}
                                rowData={addresses}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={selectAddress}
                                onCellClicked={selectCell}
                                suppressRowClickSelection
                                onSelectionChanged={onSelectionChanged}
                            />
                        </div>
                    </Col>
                </Row>
                <CommonConfirmDialog
                    isShow={!!((activationShow || deactivationShow))}
                    onHide={activationShow ? handleActivationClose : handleDeactivationClose}
                    title={activationShow ? "Activation" : "Deactivation"}
                    content={`Are you sure you want to ${activationShow ? "activate" : "deactivate"}?`}
                    positiveProps={
                        {
                            onPositiveAction: (
                                activationShow ? (
                                    activateOne ? handleActivation : handleActivationAddresses
                                ) : (deactivateOne ? handleDeactivation : handleDeactivationAddresses)

                            ),
                            contentPositive: activationShow ? "Activate" : "Deactivate",
                            colorPositive: activationShow ? "primary" : "danger"
                        }

                    }
                    negativeProps={
                        {
                            onNegativeAction: activationShow ? handleActivationClose : handleDeactivationClose,
                            colorNegative: "link"
                        }
                    }
                />
            </Container>
        </>
    );
};

export default ListAddresses;
