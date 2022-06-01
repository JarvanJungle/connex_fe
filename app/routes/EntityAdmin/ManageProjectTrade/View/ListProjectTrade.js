import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv";
import { convertToLocalTime } from "helper/utilities";
import {
    // Container,
    ButtonToolbar,
    Button,
    Row,
    Col
} from "components";
import {
    AgGridReact
} from "components/agGrid";
import ManageProjectTradeService from "services/ManageProjectTradeService";

import { CommonConfirmDialog } from "routes/components";

import useToast from "routes/hooks/useToast";
import CSVHelper from "helper/CSVHelper";
import UploadButton from "routes/components/UploadButton";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";

const ListProjectTrade = () => {
    const showToast = useToast();

    const { t } = useTranslation();
    const history = useHistory();
    const tradePermission = usePermission(FEATURE.TRADE);

    const [listStates, setListStates] = useState({
        listOfTrades: [],
        catalogues: [],
        gridApi: null,
        gridColumnApi: null,
        companyUuid: null,
        isLoading: false,
        deactivationShow: false,
        activationShow: false,
        selectedProjectTrade: "",
        activationButtonVisibility: "none",
        deactivateOne: true,
        activateOne: true
    });

    const getCompanyRole = () => {
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        setListStates((prevStates) => ({
            ...prevStates,
            companyUuid: companyRole.companyUuid
        }));

        return companyRole;
    };

    const getListOfTrades = async () => {
        try {
            const companyRole = getCompanyRole();
            const response = await ManageProjectTradeService.getListProjectTrade(companyRole);
            const listOfTrades = response.data.data;
            if (listOfTrades.length > 0) {
                setListStates((prevStates) => ({
                    ...prevStates,
                    listOfTrades
                }));
            }
        } catch (error) {
            showToast("error", error?.response?.data?.message);
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(URL_CONFIG.UPDATE_PROJECT_TRADE + event.data.tradeCodeUuid);
    };

    const handleExport = () => {
        listStates.gridApi.exportDataAsCsv(
            {
                fileName: CSVTemplate.ManageProjectTrade_List_DownloadFileName,
                columnKeys: [
                    "tradeCode",
                    "tradeTitle",
                    "description",
                    "createdBy",
                    "createdOn",
                    "active"
                ],
                processCellCallback: (cell) => {
                    if (cell?.column?.colId === "createdOn") {
                        return convertToLocalTime(cell.value);
                    }
                    return cell.value;
                }
            }
        );
    };

    const viewRenderer = (params) => {
        if (params.data.active) {
            return "<span style=\"color:red; cursor: pointer;\"><i class=\"fa fa-close\" style=\"font-size:15px;color:red\"></i>&emsp;Deactivate</span>";
        }
        return "<span style=\"color:navy; cursor: pointer; \"><i class=\"fa fa-plus\" style=\"font-size:15px;color:navy\"></i>&emsp;Reactivate</span>";
    };

    const defaultColDef = {
        editable: false,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        resizable: true
    };

    const columnDefs = useMemo(() => [
        {
            headerName: t("TradeCode"),
            field: "tradeCode",
            headerCheckboxSelection: () => tradePermission?.write,
            headerCheckboxSelectionFilteredOnly: () => tradePermission?.write,
            checkboxSelection: () => tradePermission?.write,
            width: 200
        },
        {
            headerName: t("TradeTitle"),
            field: "tradeTitle",
            width: 300
        },
        {
            headerName: t("Description"),
            field: "description",
            width: 350
        },
        {
            headerName: t("CreatedBy"),
            field: "createdBy",
            width: 200
        },
        {
            headerName: t("CreatedOn"),
            field: "createdOn",
            valueFormatter: ({ value }) => convertToLocalTime(value),
            sort: "desc",
            width: 200
        },
        {
            headerName: t("IsActive"),
            field: "active",
            valueGetter: ({ data }) => (data.active ? "Yes" : "No"),
            width: 150
        },
        {
            headerName: t("Action"),
            field: "action",
            filter: false,
            cellRenderer: (params) => viewRenderer(params),
            resizable: true,
            width: 150,
            hide: !tradePermission?.write
        }
    ], [tradePermission]);

    const onGridReady = (params) => {
        setListStates((prevStates) => ({
            ...prevStates,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
    };

    useEffect(() => {
        getListOfTrades();
    }, []);

    const handleOnDrop = (csvData) => {
        setListStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        const massUpload = [];
        try {
            csvData.shift();
            const payload = csvData
                // Filter valid row: Trade Code, Trade Title and Is active required
                .filter(({ data }) => data[0] && data[1] && ["Yes", "No"].includes(data[3]))
                .map(({ data }) => ({
                    tradeCode: data[0].toUpperCase(),
                    tradeTitle: data[1],
                    description: data[2],
                    active: data[3]?.toLowerCase() === "yes"
                }));
            if ([...(new Set(payload.map(({ tradeCode }) => tradeCode)))].length < payload.length) {
                throw Error("Duplicate Records Found");
            }
            if (payload.length === 0) throw Error("No valid row to upload");
            massUpload.push(...payload);
        } catch (error) {
            showToast("error", error.message);
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
            return;
        }
        ManageProjectTradeService.massUploadProjectTrade(massUpload, listStates.companyUuid)
            .then((res) => {
                setListStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (res.data.status === "OK") {
                    showToast("success", "Upload successfully!");
                    getListOfTrades();
                } else {
                    showToast("error", res.data.message);
                }
            }).catch((error) => {
                showToast("error", error?.response?.data?.message ?? error?.message);
                setListStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
    };

    const handleOnError = (err) => {
        showToast("error", err?.message);
    };

    const buttonRef = React.createRef();

    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef.current) {
            buttonRef.current.open(e);
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
                selectedProjectTrade: event.data.tradeCodeUuid
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

    const deactivatingProjectTrade = (projectTradeUuid, successMessage) => {
        handleDeactivationClose();
        ManageProjectTradeService.deactivateProjectTrade(projectTradeUuid,
            listStates.companyUuid).then(() => {
            showToast("success", successMessage);
            getListOfTrades();
            setListStates((prevStates) => ({
                ...prevStates,
                activationButtonVisibility: "none"
            }));
        }).catch((error) => {
            showToast("error", error?.response?.data?.message ?? error?.message);
        });
    };

    const handleDeactivationProjectTrade = () => {
        deactivatingProjectTrade([listStates.selectedProjectTrade], "Trade code deactivated");
    };

    const handleDeactivationProjectTrades = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.tradeCodeUuid);
        deactivatingProjectTrade(selectedData, "Trade codes deactivated");
    };

    const activatingProjectTrade = (projectTradeUuid, successMessage) => {
        handleActivationClose();
        ManageProjectTradeService.activateProjectTrade(projectTradeUuid,
            listStates.companyUuid).then((res) => {
            showToast("success", successMessage);
            getListOfTrades();
            setListStates((prevStates) => ({
                ...prevStates,
                activationButtonVisibility: "none"
            }));
        }).catch((error) => {
            showToast("error", error?.response?.data?.message ?? error?.message);
        });
    };

    const handleActivationProjectTrade = () => {
        activatingProjectTrade([listStates.selectedProjectTrade], "Trade code activated");
    };

    const handleActivationProjectTrades = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.tradeCodeUuid);
        activatingProjectTrade(selectedData, "Trade codes activated");
    };

    const onSelectionChanged = () => {
        const selectedNodes = listStates.gridApi.getSelectedNodes();
        if (selectedNodes.length > 0) {
            setListStates((prevStates) => ({
                ...prevStates,
                activationButtonVisibility: "block"
            }));
        } else {
            setListStates((prevStates) => ({
                ...prevStates,
                activationButtonVisibility: "none"
            }));
        }
    };

    return (
        <>
            <div className="container-fluid">
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListManageProjectTrades")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12} className="d-flex group-ag-grid-table-buttons">
                        <ButtonToolbar className="group-ag-grid-buttons">
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
                        <ButtonToolbar className="ml-auto group-ag-grid-buttons">
                            <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                <i className="fa fa-download" />
                                {" "}
                                {t("Download")}
                            </Button>
                            {tradePermission?.write && (
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
                                        <CSVLink
                                            data={CSVTemplate.ManageProjectTrade_List_Data}
                                            headers={CSVTemplate.ManageProjectTrade_List_Headers}
                                            filename={CSVTemplate.ManageProjectTrade_List_TemplatesFilename}
                                            style={{ color: "white" }}
                                        >
                                            <i className="fa fa-download" />
                                            {" "}
                                            {t("Template")}
                                        </CSVLink>
                                    </Button>
                                    <Link to={URL_CONFIG.CREATE_PROJECT_TRADE}>
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <i className="fa fa-plus" />
                                            {" "}
                                            {t("Create New")}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </ButtonToolbar>

                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "560px" }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={listStates.listOfTrades}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                onCellClicked={selectCell}
                                suppressRowClickSelection
                                onSelectionChanged={onSelectionChanged}
                                detailRowAutoHeight
                            />
                        </div>
                    </Col>
                </Row>
                <CommonConfirmDialog
                    isShow={!!((listStates.activationShow || listStates.deactivationShow))}
                    onHide={listStates.activationShow ? handleActivationClose : handleDeactivationClose}
                    title={listStates.activationShow ? t("Activation") : t("Deactivation")}
                    content={
                        `Are you sure you want to ${listStates.activationShow ? "activate" : "deactivate"}?`
                    }
                    positiveProps={
                        {
                            onPositiveAction: (
                                listStates.activationShow ? (
                                    listStates.activateOne ? handleActivationProjectTrade : handleActivationProjectTrades
                                ) : (listStates.deactivateOne ? handleDeactivationProjectTrade : handleDeactivationProjectTrades)

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
            </div>
        </>
    );
};

export default ListProjectTrade;
