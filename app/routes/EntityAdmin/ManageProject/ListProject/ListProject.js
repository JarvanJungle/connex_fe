import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Row,
    Col,
    Button,
    ButtonToolbar
} from "components";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { getFromLS } from "helper/utilities";
import ProjectForecastService from "services/ProjectForecastService";
import { FEATURE, LS_KEYS, RESPONSE_STATUS } from "helper/constantsDefined";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_MANAGE_PROJECT from "services/ProjectService/url";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { usePermission } from "routes/hooks";
import ProjectForecastTable from "../components/ProjectForecastTable";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ListProject = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [listStates, setListStates] = useState({
        companyUuid: "",
        isLoading: false,
        projects: [],
        gridApi: null
    });
    const projectPermission = usePermission(FEATURE.PROJECT);

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
        history.push(URL_MANAGE_PROJECT.PROJECT_DETAILS + event.data.projectCode);
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
                <Col xs={12}>
                    <HeaderMain
                        title={t("ProjectForecastListHeader")}
                        className="mb-2 mb-lg-2"
                    />
                </Col>
            </Row>
            <Row className="mb-1">
                <Col xs={12} className="text-right">
                    {projectPermission.write && (
                        <ButtonToolbar className="justify-content-end">
                            <Link to={URL_MANAGE_PROJECT.CREATE_PROJECT}>
                                <Button color="primary" className="mb-1">
                                    <i className="fa fa-plus" />
                                    {` ${t("CreateNew")}`}
                                </Button>
                            </Link>
                        </ButtonToolbar>
                    )}
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <ProjectForecastTable
                        columnDefs={ProjectForecastService.getListProjectColDefs(t)}
                        rowData={listStates.projects}
                        onGridReady={onGridReady}
                        selectCell={() => { }}
                        onSelectionChanged={() => { }}
                        onRowDoubleClicked={onRowDoubleClick}
                        paginationPageSize={10}
                        defaultColDef={defaultColDef}
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

export default ListProject;
