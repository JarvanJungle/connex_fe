import React, { useState, useEffect } from "react";
import {
    Row,
    Col
} from "components";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { getFromLS } from "helper/utilities";
import ProjectForecastService from "services/ProjectForecastService";
import { LS_KEYS, RESPONSE_STATUS } from "helper/constantsDefined";
import { HeaderMain } from "routes/components/HeaderMain";
import urlConfig from "services/urlConfig";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import ProjectForecastTable from "../components/ProjectForecastTable";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ListProjectForecast = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [listStates, setListStates] = useState({
        companyUuid: "",
        isLoading: false,
        projects: [],
        gridApi: null
    });

    const onGridReady = (params) => {
        setListStates((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    const getProjects = async (companyUuid) => {
        try {
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: true
            }));
            const response = await ProjectForecastService.getProjects(companyUuid);
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
            if (response.data.status === RESPONSE_STATUS.OK) {
                setListStates((prevStates) => ({
                    ...prevStates,
                    projects: response.data.data
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            showToast("error", error.message);
            setListStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
        }
    };

    const onRowDoubleClick = (event) => {
        history.push(urlConfig.UPDATE_PROJECT_FORECAST + event.data.projectCode);
    };

    useEffect(() => {
        const companyRole = getFromLS(LS_KEYS.COMPANY_ROLE);
        setListStates((prevStates) => ({
            ...prevStates,
            companyUuid: companyRole.companyUuid
        }));

        getProjects(companyRole.companyUuid);
    }, []);

    return (
        <div className="container-fluid">
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("List of Project Forecast")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <ProjectForecastTable
                        columnDefs={ProjectForecastService.getListProjectColDefs(t)}
                        rowData={listStates.projects}
                        onGridReady={onGridReady}
                        selectCell={() => {}}
                        onSelectionChanged={() => {}}
                        onRowDoubleClicked={onRowDoubleClick}
                        paginationPageSize={10}
                        defaultColumnDef={defaultColDef}
                        frameworkComponents={{
                            customTooltip: CustomTooltip
                        }}
                        tooltipShowDelay={0}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ListProjectForecast;
