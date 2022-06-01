import React, { useState, useEffect } from "react";
import RequestForQuotationService from "services/RequestForQuotationService";
import useToast from "routes/hooks/useToast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { usePermission } from "routes/hooks";
import { Container, Row, Col } from "components";
import { AgGridTable, HeaderMain } from "routes/components";
import { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { getRFQsListColDefs } from "../ColumnDefs";
import RFQ_ROUTES from "../routes";
import { RFQ_CONSTANTS } from "../helper";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip",
    sortable: true
};

const RFQsList = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const rfqPermission = usePermission(FEATURE.RFQF);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { isBuyer } = permissionReducer;
    const [rfqList, setRFQList] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [columnDefs, setColumnDefs] = useState([]);

    const initData = async (companyUuid) => {
        gridApi.showLoadingOverlay();
        try {
            const response = await RequestForQuotationService.getRFQsList(companyUuid, isBuyer);
            const { data, message, status } = response && response?.data;
            if (status === RESPONSE_STATUS.OK) {
                let RFQs = data;
                if (
                    rfqPermission?.read
                    && !rfqPermission?.write
                    && rfqPermission?.approve
                ) { // approver
                    RFQs = RFQs.filter((item) => item.rfqStatus !== RFQ_CONSTANTS.PENDING_QUOTATION
                        && item.rfqStatus !== RFQ_CONSTANTS.CANCELLED
                        && item.rfqStatus !== RFQ_CONSTANTS.PENDING_ISSUE);
                }
                // Query params filter
                const query = new URLSearchParams(location.search);
                if (query.get("status")) {
                    RFQs = RFQs.filter((item) => query?.get("status")?.split(",")?.includes(item.rfqStatus) ?? true);
                }
                gridApi.hideOverlay();
                setRFQList(RFQs);
                if (RFQs.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    useEffect(() => {
        if (typeof isBuyer === "boolean") {
            setColumnDefs(getRFQsListColDefs(isBuyer));
        }
    }, [isBuyer]);

    useEffect(() => {
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (
            gridApi
            && columnDefs.length > 0
            && companyUuid
        ) {
            initData(companyUuid);
        }
    }, [gridApi, columnDefs, permissionReducer, isBuyer]);

    const onRowDoubleClicked = (event) => {
        const { uuid, rfqStatus } = event && event.data;
        if (isBuyer) {
            if (rfqStatus === RFQ_CONSTANTS.PENDING_ISSUE) {
                history.push({
                    pathname: RFQ_ROUTES.ISSUE_RFQ,
                    search: `?uuid=${uuid}&status=${rfqStatus}`
                });
            } else {
                history.push({
                    pathname: RFQ_ROUTES.RFQ_DETAILS,
                    search: `?uuid=${uuid}&status=${rfqStatus}`
                });
            }
        } else {
            history.push({
                pathname: RFQ_ROUTES.RFQ_DETAILS_SUPPLIER,
                search: `?uuid=${uuid}`
            });
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col xs={12} ml={12} lg={12}>
                    <HeaderMain title={t("RequestForQuotationsList")} />
                    <AgGridTable
                        gridHeight={580}
                        rowData={rfqList}
                        columnDefs={columnDefs}
                        colDef={defaultColDef}
                        onGridReady={(params) => setGridApi(params.api)}
                        autoSizeColumn={false}
                        onRowDoubleClicked={onRowDoubleClicked}
                        frameworkComponents={{
                            customTooltip: CustomTooltip
                        }}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default RFQsList;
