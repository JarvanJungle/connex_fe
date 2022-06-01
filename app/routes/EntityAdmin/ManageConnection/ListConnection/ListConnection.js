import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import {
    Container,
    Row,
    Col
} from "components";
import {
    AgGridReact
} from "components/agGrid";
import {
    contentInfo, contentError, defaultColDef, defaultColDefNoResize
} from "helper/utilities";
import ConnectionService from "services/ConnectionService";

const ListConnection = () => {
    let message = "Opp! Something went wrong.";
    const showToast = (type) => {
        switch (type) {
        case "success":
            toast.success(contentInfo({ message }));
            break;
        case "error":
            toast.info(contentError({ message }));
            break;
        }
    };

    const { t } = useTranslation();
    const history = useHistory();
    const [listStates, setListStates] = useState({
        addresses: [],
        connections: [],
        trails: [],
        gridApi: null,
        gridColumnApi: null,
        companyUuid: null,
        isLoading: false,
        deactivationShow: false,
        activationShow: false,
        selectedAddress: "",
        activationButtonVisibility: "hidden",
        deactivateOne: true,
        activateOne: true
    });

    const retrieveConnections = async () => {
        try {
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            setListStates((prevStates) => ({
                ...prevStates,
                companyUuid: companyRole.companyUuid,
                isLoading: true
            }));
            const response = await ConnectionService.getConnections(companyRole.companyUuid);
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
            if (response.data.status === "OK") {
                setListStates((prevStates) => ({
                    ...prevStates,
                    connections: response.data.data
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            message = error.response.data.message;
            showToast("error");
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(URL_CONFIG.CONNECTION_DETAILS + event.data.connectionUuid);
    };

    const connectionColumnDefs = [
        {
            headerName: t("ResponseStatus"),
            field: "status",
            width: 200
        },
        {
            headerName: t("CompanyName"),
            field: "entityName",
            valueFormatter: ({ value }) => value.toUpperCase(),
            width: 250
        },
        {
            headerName: t("Company Reg. No."),
            field: "companyRegistrationNumber",
            valueFormatter: ({ value }) => value.toUpperCase(),
            width: 200
        },
        {
            headerName: t("Contact Person"),
            field: "contactInformation.name",
            width: 200
        },
        {
            headerName: t("Email"),
            field: "contactInformation.email",
            width: 300
        },
        {
            headerName: t("Tax-Registered Company"),
            field: "companyRegistrationNumber",
            valueGetter: ({ data }) => (data.gstApplicable ? "Yes" : "No"),
            width: 200
        },
        {
            headerName: t("Country"),
            field: "country",
            width: 200
        },
        {
            field: "updatedOn",
            sort: "desc",
            hide: true
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

    const onSortChanged = (e) => {
        e.api.refreshCells();
    };

    const onFilterChanged = (e) => {
        e.api.refreshCells();
    };

    useEffect(() => {
        retrieveConnections();
    }, []);

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ManageConnectionRequest")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                            <AgGridReact
                                columnDefs={connectionColumnDefs}
                                defaultColDef={defaultColDef}
                                rowData={listStates.connections}
                                pagination
                                paginationPageSize={15}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                suppressRowClickSelection
                                onSortChanged={onSortChanged}
                                onFilterChanged={onFilterChanged}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ListConnection;
