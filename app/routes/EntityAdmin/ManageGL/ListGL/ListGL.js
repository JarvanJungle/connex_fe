import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import { CSVReader } from "react-papaparse";
import ButtonSpinner from "components/ButtonSpinner";
import Modal from "react-bootstrap/Modal";
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
import GLService from "services/GLService";

import { CommonConfirmDialog } from "routes/components";
import useToast from "routes/hooks/useToast";
import { useSelector } from "react-redux";
import _ from "lodash";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import CSVHelper from "helper/CSVHelper";

const ListGL = () => {
    let message = "Opp! Something went wrong.";
    const toast = useToast();
    const showToast = (type) => toast(type, message);

    const { t } = useTranslation();
    const history = useHistory();
    const [listStates, setListStates] = useState({
        gls: [],
        gridApi: null,
        gridColumnApi: null,
        companyUuid: null,
        isLoading: false,
        deactivationShow: false,
        activationShow: false,
        selectedRow: "",
        activationButtonVisibility: "hidden",
        deactivateOne: true,
        activateOne: true
    });
    const handleRolePermission = usePermission(FEATURE.GL);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;

    const retrieveGLAccount = async () => {
        try {
            if (listStates.gridApi) listStates.gridApi.deselectAll();
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            setListStates((prevStates) => ({
                ...prevStates,
                companyUuid: companyRole.companyUuid
            }));
            const response = await GLService.getGLs(companyRole.companyUuid);
            if (response.data.status === "OK") {
                setListStates((prevStates) => ({
                    ...prevStates,
                    taxRecords: response.data.data
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            message = error.response.data.message;
            showToast("error");
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(URL_CONFIG.GL_DETAILS + event.data.accountNumber, { gl: event.data });
    };

    const handleExport = () => {
        listStates.gridApi
            .exportDataAsCsv({
                fileName: CSVTemplate.GL_Account_List_DownloadFileName,
                columnKeys: [
                    "accountNumber",
                    "description",
                    "costCode",
                    "departmentCode",
                    "active"
                ]
            });
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
            headerName: t("GLAccount"),
            field: "accountNumber",
            headerCheckboxSelection: write,
            headerCheckboxSelectionFilteredOnly: write,
            checkboxSelection: write
        },
        {
            headerName: t("GL Code"),
            field: "code",
            hide: true
        },
        {
            headerName: t("Description"),
            field: "description"
        },
        {
            headerName: t("Cost Code"),
            field: "costCode",
            valueGetter: (params) => params.data?.costCodeDtoList?.map((item) => item.code).join("; ")
        },
        {
            headerName: t("Department Code"),
            field: "departmentCode",
            valueGetter: (params) => params.data?.departmentCodeDtoList?.map((item) => item.code).join("; ")
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
            filter: false,
            cellRenderer: (params) => viewRenderer(params),
            hide: !write
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
        retrieveGLAccount();
    }, []);

    const handleOnDrop = (data, file) => {
        setListStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        // data.shift();
        const massUpload = [];
        try {
            console.log(file.type);
            const listType = file.type.split("/");
            if (listType[1] !== "csv" && listType[1] !== "vnd.ms-excel") {
                throw new Error("Only csv file is supported for upload feature. Please recheck");
            }
            for (let i = 0; i < data.length; i++) {
                if (data[i].data[0] !== "" && !data[i].data[0].includes("G/L Account")) {
                    const validationResult = CSVHelper.validateCSV(data, ["G/L Account", "Is Active"]);
                    if (validationResult.missingField) {
                        throw new Error(`Validate Error: Please select valid  ${validationResult.missingField}`);
                    } else if (!validationResult.validate) {
                        throw new Error(CSVTemplate.NeededFields_Error);
                    }
                    const costList = data[i].data[2]?.split("; ");
                    const departmentList = data[i].data[3]?.split("; ");
                    const isActive = data[i].data[4].toLowerCase() === "yes";
                    const uploadItem = {
                        companyUuid: listStates.companyUuid,
                        accountNumber: data[i].data[0],
                        description: data[i].data[1],
                        costCodeDtoList: costList?.map((item) => ({ code: item, remarks: "" })),
                        departmentCodeDtoList: departmentList?.map((item) => ({ code: item, remarks: "" })),
                        active: isActive
                    };
                    massUpload.push(uploadItem);
                }
            }
        } catch (error) {
            message = error?.message;
            showToast("error");
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
            return;
        }

        GLService.postUploadGLs({ companyUuid: listStates.companyUuid, gls: massUpload })
            .then((res) => {
                setListStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (res.data.status === "OK") {
                    message = "Mass Upload Done";
                    showToast("success");
                    retrieveGLAccount();
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
                selectedRow: event.data.accountNumber
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

    const deactivating = (accountNumberList, successMessage) => {
        handleDeactivationClose();
        GLService.postDeactivateGL({ companyUuid: listStates.companyUuid, gls: accountNumberList })
            .then((res) => {
                if (res.data.status === "OK") {
                    message = successMessage;
                    showToast("success");
                    retrieveGLAccount();
                } else {
                    message = res.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
            });
    };

    const handleDeactivation = () => {
        deactivating([listStates.selectedRow], "G/L Deactivated");
    };

    const handleMultiDeactivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.accountNumber);
        deactivating(selectedData, "G/L Deactivated");
    };

    const activating = (accountNumberList, successMessage) => {
        handleActivationClose();
        GLService.postActivateGL({ companyUuid: listStates.companyUuid, gls: accountNumberList })
            .then((res) => {
                if (res.data.status === "OK") {
                    message = successMessage;
                    showToast("success");
                    retrieveGLAccount();
                } else {
                    message = res.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error");
            });
    };

    const handleActivation = () => {
        activating([listStates.selectedRow], "G/L Activated");
    };

    const handleMultiActivation = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.accountNumber);
        activating(selectedData, "G/L Activated");
    };

    const onSelectionChanged = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        setListStates((prevStates) => ({
            ...prevStates,
            activationButtonVisibility: selectedNodes.length > 0 ? "visible" : "hidden"
        }));
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListGLAccount")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            <Button
                                color="primary"
                                className="mb-2 mr-2 px-3"
                                style={{ visibility: listStates.activationButtonVisibility }}
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
                                style={{ visibility: listStates.activationButtonVisibility }}
                                onClick={() => {
                                    setListStates((prevStates) => ({
                                        ...prevStates,
                                        deactivateOne: false
                                    })); handleDeactivationShow();
                                }}
                            >
                                {t("Deactivate")}
                            </Button>
                            <ButtonToolbar className="ml-auto">
                                <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                    <i className="fa fa-download" />
                                    {" "}
                                    {t("Download")}
                                </Button>
                                {handleRolePermission?.write && (
                                    <>
                                        <CSVReader
                                            ref={buttonRef}
                                            onFileLoad={handleOnDrop}
                                            onError={handleOnError}
                                            noClick
                                            noDrag
                                        >
                                            {() => (
                                                <ButtonSpinner
                                                    text={t("Upload")}
                                                    icon="fa fa-upload"
                                                    className="mb-2 mr-2 px-3"
                                                    onclick={handleOpenDialog}
                                                    isLoading={listStates.isLoading}
                                                />
                                            )}
                                        </CSVReader>
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <CSVLink
                                                data={CSVTemplate.GL_Account_List_Data}
                                                headers={CSVTemplate.GL_Account_List_Headers}
                                                filename={CSVTemplate.GL_Account_List_TemplatesFilename}
                                                style={{ color: "white" }}
                                            >
                                                <i className="fa fa-download" />
                                                {" "}
                                                {t("Template")}
                                            </CSVLink>
                                        </Button>
                                        <Link to={URL_CONFIG.CREATE_GL}>
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
                    isShow={(listStates.activationShow || listStates.deactivationShow)}
                    onHide={listStates.activationShow ? handleActivationClose
                        : handleDeactivationClose}
                    title={listStates.activationShow ? "Activation" : "Deactivation"}
                    content={`Are you sure you want to ${listStates.activationShow ? "activate" : "deactivate"} ?`}
                    positiveProps={
                        {
                            onPositiveAction: (
                                listStates.activationShow ? (
                                    listStates.activateOne ? handleActivation : handleMultiActivation
                                ) : (listStates.deactivateOne ? handleDeactivation : handleMultiDeactivation)

                            ),
                            contentPositive: listStates.activationShow ? "Activate" : "Deactivate",
                            colorPositive: listStates.activationShow ? "info" : "warning"
                        }

                    }
                    negativeProps={
                        {
                            onNegativeAction: listStates.activationShow ? handleActivationClose
                                : handleDeactivationClose
                        }
                    }
                />
                <Modal show={listStates.deactivationShow} onHide={handleDeactivationClose} className="modal-outline-danger">
                    <Modal.Header closeButton>
                        <Modal.Title className="text-danger">{t("Deactivation")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {t("Are you sure you want to deactivate")}
                        ?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleDeactivationClose} color="link">
                            {t("Cancel")}
                        </Button>
                        <Button variant="primary" onClick={listStates.deactivateOne ? handleDeactivation : handleMultiDeactivation} color="danger">
                            {t("Deactivate")}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={listStates.activationShow} onHide={handleActivationClose} className="modal-outline-primary">
                    <Modal.Header closeButton>
                        <Modal.Title className="text-primary">{t("Activation")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {t("Are you sure you want to activate")}
                        ?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleActivationClose} color="link">
                            {t("Cancel")}
                        </Button>
                        <Button variant="primary" onClick={listStates.activateOne ? handleActivation : handleMultiActivation} color="primary">
                            {t("Activate")}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default ListGL;
