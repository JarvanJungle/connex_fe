import React, { useState, useEffect } from "react";
import _ from "lodash";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { Col, Container, Row } from "components";
import CatalogueService from "services/CatalogueService";
import { AgGridReact } from "components/agGrid";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import { useCurrentCompany } from "routes/hooks";
import ListManualCataloguesColDefs from "./ListManualCataloguesColDefs";
import CustomTooltip from "./CustomListTooltip";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ListManualCatalogues = () => {
    const showToast = useToast();
    const { t } = useTranslation();
    const currentCompany = useCurrentCompany();
    const [catalogueState, setCatalogueState] = useState({
        loading: false,
        gridApi: null,
        doList: []
    });

    const getData = async () => {
        const { gridApi } = catalogueState;
        gridApi.showLoadingOverlay();
        try {
            const { companyUuid } = currentCompany;

            const response = await CatalogueService.getManualCatalogues(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                setCatalogueState((prevStates) => ({
                    ...prevStates,
                    doList: response.data.data
                }));

                if (response.data.data.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setCatalogueState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        if (!_.isEmpty(currentCompany) && catalogueState.gridApi) {
            getData();
        }
    }, [currentCompany, catalogueState.gridApi]);

    return (
        <Container fluid>
            <Col
                md={12}
                lg={12}
            >
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("List of Manual Catalogue")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col
                        md={12}
                        lg={12}
                    >
                        <AgGridReact
                            className="ag-theme-custom-react"
                            columnDefs={ListManualCataloguesColDefs}
                            defaultColDef={defaultColDef}
                            rowData={catalogueState.doList}
                            pagination
                            paginationPageSize={10}
                            onGridReady={onGridReady}
                            containerStyle={{ height: 590 }}
                            frameworkComponents={{
                                customTooltip: CustomTooltip
                            }}
                            tooltipShowDelay={0}
                        />
                    </Col>
                </Row>
            </Col>
        </Container>
    );
};

export default ListManualCatalogues;
