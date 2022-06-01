import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import {
    Container,
    ButtonToolbar,
    Button,
    Row,
    Col
} from "components";
import {
    AgGridReact
} from "components/agGrid";
import TaxRecordDataService from "services/TaxRecordService";
import { formatNumberForRow, isNullOrUndefinedOrEmpty } from "helper/utilities";

import { CommonConfirmDialog } from "routes/components";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import UploadButton from "routes/components/UploadButton";
import _ from "lodash";
import UserService from "services/UserService";
import { FEATURE } from "helper/constantsDefined";
import { usePermission } from "routes/hooks";

const ListTaxRecords = () => {
    let message = "Opp! Something went wrong.";
    const toast = useToast();
    const showToast = (type) => toast(type, message);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;

    const { t } = useTranslation();
    const history = useHistory();
    const [listStates, setListStates] = useState({
        addresses: [],
        taxRecords: [],
        gridApi: null,
        gridColumnApi: null,
        companyUuid: null,
        isLoading: false,
        deactivationShow: false,
        activationShow: false,
        selectedTaxRecords: "",
        activationButtonVisibility: "none",
        deactivateOne: true,
        activateOne: true
    });
    const handleRolePermission = usePermission(FEATURE.TAX);

    const getCompanyRole = () => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        setListStates((prevStates) => ({
            ...prevStates,
            companyUuid: companyRole.companyUuid
        }));

        return companyRole;
    };

    const retrieveTaxRecords = async () => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID)) {
            try {
                if (listStates.gridApi) listStates.gridApi.deselectAll();
                const response = await TaxRecordDataService
                    .getTaxRecords(currentCompanyUUID);
                const taxRecords = response.data.data;
                if (taxRecords.length > 0) {
                    setListStates((prevStates) => ({
                        ...prevStates,
                        taxRecords
                    }));
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                message = error.response.data.message;
                showToast("error");
            }
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(URL_CONFIG.UPDATE_TAX_RECORD + event.data.taxCode);
    };

    const handleExport = () => {
        listStates.gridApi.exportDataAsCsv(
            {
                fileName: CSVTemplate.Tax_Records_List_DownloadFileName,
                columnKeys: [
                    "taxCode",
                    "taxRate",
                    "description",
                    "default",
                    "active"
                ]
            }
        );
    };

    const defaultColDef = {
        editable: false,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        resizable: true
    };

    const viewRenderer = (params) => {
        if (params.data.active === true) {
            return "<span style=\"color:red; cursor: pointer;\"><i class=\"fa fa-close\" style=\"font-size:15px;color:red\"></i>&emsp;Deactivate</span>";
        }

        return "<span style=\"color:navy; cursor: pointer; \"><i class=\"fa fa-plus\" style=\"font-size:15px;color:navy\"></i>&emsp;Reactivate</span>";
    };

    const columnDefs = (write) => [
        {
            headerName: t("TaxCode"),
            field: "taxCode",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            checkboxSelection: write
        },
        {
            headerName: t("TaxRate"),
            field: "taxRate",
            valueFormatter: formatNumberForRow,
            cellStyle: {
                textAlign: "right"
            }
        },
        {
            headerName: t("Description"),
            field: "description"
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
            headerName: t("Action"),
            field: "action",
            filter: false,
            cellRenderer: (params) => viewRenderer(params),
            resizable: true,
            hide: !write
        },
        {
            field: "updateOn",
            hide: true,
            sort: "desc",
            sortIndex: 0
        }
    ];

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setListStates((prevStates) => ({
            ...prevStates,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
    };

    useEffect(() => {
        retrieveTaxRecords();
    }, [userPermission]);

    const handleOnDrop = (data) => {
        setListStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        const massUpload = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].data[0] !== "" && !data[i].data[0].includes("Tax Code") && !data[i].data[0].includes(CSVTemplate.Tax_Records_List_Data[0].taxCode)) {
                if (data[i].data[0] && data[i].data[1] && data[i].data[3]) {
                    const isActive = data[i].data[3].toLowerCase() === "yes";
                    const isDefault = data[i].data[4].toLowerCase() === "yes";
                    const uploadItem = {
                        taxCode: data[i].data[0],
                        taxRate: parseFloat(data[i].data[1].replace(/[^0-9.]+/g, "")),
                        description: data[i].data[2],
                        active: isActive,
                        default: isDefault
                    };
                    massUpload.push(uploadItem);
                } else {
                    message = CSVTemplate.NeededFields_Error;
                    showToast("error");
                    setListStates((prevStates) => ({
                        ...prevStates,
                        isLoading: false
                    }));
                    return;
                }
            }
        }
        TaxRecordDataService.postUploadTaxRecords(
            { companyUuid: UserService.getCurrentCompanyUuid(), taxRecords: massUpload }
        ).then((res) => {
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
            if (res.data.status === "OK") {
                message = "Mass Upload Done";
                showToast("success");
                retrieveTaxRecords();
            } else {
                message = res.data.message;
                showToast("error");
            }
        }).catch((error) => {
            message = error.response.data.message;
            showToast("error");
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
        });
    };

    const handleOnError = (err) => {
        message = err;
        showToast("error");
    };

    const buttonRef = React.createRef();

    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef?.current) {
            buttonRef?.current.open(e);
        }
    };

    const handleDeactivationClose = () => setListStates((prevStates) => ({
        ...prevStates,
        deactivationShow: false
    }));
    const handleDeactivationShow = () => setListStates((prevStates) => ({
        ...prevStates,
        deactivationShow: true
    }));
    const handleActivationClose = () => setListStates((prevStates) => ({
        ...prevStates,
        activationShow: false
    }));
    const handleActivationShow = () => setListStates((prevStates) => ({
        ...prevStates,
        activationShow: true
    }));

    const selectCell = (event) => {
        if (event.colDef.headerName === "Action") {
            setListStates((prevStates) => ({
                ...prevStates,
                selectedTaxRecords: event.data.taxCode
            }));

            if (event.data.active === true) {
                setListStates((prevStates) => ({
                    ...prevStates,
                    deactivateOne: true
                }));
                handleDeactivationShow();
            } else {
                setListStates((prevStates) => ({
                    ...prevStates,
                    activateOne: true
                }));
                handleActivationShow();
            }
        }
    };

    const deactivatingTaxRecord = (params, successMessage) => {
        handleDeactivationClose();
        TaxRecordDataService.deactivateTaxRecords(params).then((res) => {
            if (res.data.status === "OK") {
                message = successMessage;
                showToast("success");
                retrieveTaxRecords();
            } else {
                message = res.data.message;
                showToast("error");
            }
        }).catch((error) => {
            message = error.response?.data?.message;
            showToast("error");
        });
    };

    const handleDeactivation = () => {
        deactivatingTaxRecord([listStates.selectedTaxRecords], "Deactivated");
    };

    const handleMultiDeactivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.taxCode);
        deactivatingTaxRecord(selectedData, "Deactivated");
    };

    const activating = (params, successMessage) => {
        handleActivationClose();
        TaxRecordDataService.activateTaxRecords(params).then((res) => {
            if (res.data.status === "OK") {
                message = successMessage;
                showToast("success");
                retrieveTaxRecords();
            } else {
                message = res.data.message;
                showToast("error");
            }
        }).catch((error) => {
            message = error.response?.data?.message;
            showToast("error");
        });
    };

    const handleActivation = () => {
        activating([listStates.selectedTaxRecords], "Activated");
    };

    const handleMultiActivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.taxCode);
        activating(selectedData, "Activated");
    };

    const onSelectionChanged = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        setListStates((prevStates) => ({
            ...prevStates,
            activationButtonVisibility: selectedNodes.length > 0 ? "block" : "none"
        }));
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListTax")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            <ButtonToolbar>
                                <Button
                                    color="primary"
                                    className="mb-2 mr-2 px-3"
                                    style={{ display: listStates.activationButtonVisibility }}
                                    onClick={() => {
                                        setListStates((prevStates) => ({
                                            ...prevStates,
                                            activateOne: false
                                        })); handleActivationShow();
                                    }}
                                >
                                    {t("Activate")}
                                </Button>
                                <Button
                                    color="danger"
                                    className="mb-2 mr-2 px-3"
                                    style={{ display: listStates.activationButtonVisibility }}
                                    onClick={() => {
                                        setListStates((prevStates) => ({
                                            ...prevStates,
                                            deactivateOne: false
                                        })); handleDeactivationShow();
                                    }}
                                >
                                    {t("Deactivate")}
                                </Button>
                            </ButtonToolbar>
                            <ButtonToolbar className="ml-auto">
                                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                    <i className="fa fa-download" />
                                    {" "}
                                    {t("Download")}
                                </Button>
                                {handleRolePermission?.write && (
                                    <>
                                        <UploadButton
                                            isLoading={listStates.isLoading}
                                            buttonRef={buttonRef}
                                            translation={t}
                                            handleOnDrop={handleOnDrop}
                                            handleOnError={handleOnError}
                                            handleOpenDialog={handleOpenDialog}
                                        />
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <CSVLink data={CSVTemplate.Tax_Records_List_Data} headers={CSVTemplate.Tax_Records_List_Headers} filename={CSVTemplate.Tax_Records_List_TemplatesFilename} style={{ color: "white" }}>
                                                <i className="fa fa-download" />
                                                {" "}
                                                {t("Template")}
                                            </CSVLink>
                                        </Button>
                                        <Link to={URL_CONFIG.CREATE_TAX_RECORD}>
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
                                rowData={listStates.taxRecords}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                onCellClicked={selectCell}
                                suppressRowClickSelection
                                onSelectionChanged={onSelectionChanged}
                            />
                        </div>
                    </Col>
                </Row>
                <CommonConfirmDialog
                    isShow={!!((listStates.activationShow || listStates.deactivationShow))}
                    onHide={listStates.activationShow ? handleActivationClose : handleDeactivationClose}
                    title={listStates.activationShow ? t("Activation") : t("Deactivation")}
                    content={`Are you sure you want to ${listStates.activationShow ? "activate" : "deactivate"}?`}
                    positiveProps={
                        {
                            onPositiveAction: (
                                listStates.activationShow ? (
                                    listStates.activateOne ? handleActivation : handleMultiActivation
                                ) : (listStates.deactivateOne ? handleDeactivation : handleMultiDeactivation)

                            ),
                            contentPositive: listStates.activationShow ? "Activate" : "Deactivate",
                            colorPositive: listStates.activationShow ? "primary" : "danger"
                        }

                    }
                    negativeProps={
                        {
                            onNegativeAction: listStates.activationShow ? handleActivationClose : handleDeactivationClose,
                            colorNegative: "link"
                        }
                    }
                />
            </Container>
        </>
    );
};

export default ListTaxRecords;
