import React, { useState, useEffect } from "react";
import { Row, Col } from "components";
import { AgGridReact } from "components/agGrid";
import PreRequisitionService from "services/PreRequisitionService";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useToast } from "routes/hooks";
import URL_CONFIG from "services/urlConfig";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "react-bootstrap";
import { PPR_STATUS } from "helper/purchasePreRequisitionConstants";
import { PR_ROUTES } from "routes/P2P/PurchaseRequest";
import { FEATURE } from "helper/constantsDefined";
import { usePermission } from "routes/hooks";
import { useLocation } from "react-router-dom";
import { defaultColDef, columnDefs } from "./PurchasePreRequisitionListGridDefinition";
import CustomTooltip from "./CustomListTooltip";

const PurchasePreRequisitionList = () => {
    const [PPRListRowData, setPPRListRowData] = useState([]);
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const showToast = useToast();

    const permissionReducer = useSelector((state) => state.permissionReducer);

    const { userPermission } = permissionReducer;

    const [show, setShow] = useState(false);
    const [pprTitle, setPPRTitle] = useState();

    const handleRolePermission = usePermission(FEATURE.PPR);

    const handleClose = () => setShow(false);

    /* Retrieve Data From Service */
    const retrieveData = async () => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID) {
            try {
                const response = await PreRequisitionService.getPPRList(
                    currentCompanyUUID
                );

                let listData = response.data.data;
                if (handleRolePermission?.approve && !handleRolePermission?.write) {
                    listData = listData.filter((item) => item.status !== PPR_STATUS.RECALLED
                    && item.status !== PPR_STATUS.PENDING_SUBMISSION);
                }

                // Query params filter
                const query = new URLSearchParams(location.search);
                if (query.get("status")) {
                    listData = listData.filter((item) => query?.get("status")?.split(",")?.includes(item.status) ?? true);
                }

                setPPRListRowData(listData);
            } catch (error) {
                let message = "";
                if (error.response) {
                    const res = error.response;
                    message = res.data.message;
                }
                showToast("error", message);
            }
        }
    };

    const onRowDoubleClick = (event) => {
        const { data } = event;
        switch (data.status) {
        case PPR_STATUS.APPROVED:
            history.push(`${PR_ROUTES.COVERT_PURCHASE_REQUISITION}?uuid=${event.data.pprUuid}`);
            break;
        default:
            history.push(`${URL_CONFIG.PPR_ROUTING.DETAIL_PRE_REQUISITIONS}?uuid=${event.data.pprUuid}`);
            break;
        }
    };

    const onRowClicked = (params) => {
        if (params.colDef.field === "pprTitle") {
            setPPRTitle(params.data.pprTitle);
        }
    };

    useEffect(() => {
        retrieveData();
    }, [userPermission]);

    return (
        <Row id="purchasePreRequisitionList">
            <Col
                md={12}
                lg={12}
            >
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("Purchase Pre-Requisitions List")}
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
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowData={PPRListRowData}
                            pagination
                            paginationPageSize={10}
                            onGridReady={(params) => params.api.sizeColumnsToFit()}
                            containerStyle={{ height: 590 }}
                            onRowDoubleClicked={onRowDoubleClick}
                            onCellClicked={(params) => onRowClicked(params)}
                            frameworkComponents={{
                                customTooltip: CustomTooltip
                            }}
                            tooltipShowDelay={0}
                        />
                    </Col>
                </Row>
            </Col>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Purchase Pre-requisition Title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <strong>
                        {pprTitle}
                    </strong>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default PurchasePreRequisitionList;
