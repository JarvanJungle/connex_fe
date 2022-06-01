import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import CreditNoteService from "services/CreditNoteService/CreditNoteService";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { Container, Row, Col } from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { useLocation } from "react-router";
import { getCNListColDefs } from "../ColumnDefs";
import CREDIT_NOTE_ROUTES from "../route";

const CNList = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany, isBuyer } = permissionReducer;
    const [gridApi, setGridApi] = useState(null);
    const [cnList, setCNList] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);

    const getData = async (companyUuid) => {
        gridApi.showLoadingOverlay();
        try {
            const response = await CreditNoteService.getCNList(companyUuid, isBuyer);
            gridApi.hideOverlay();
            let listData = response.data.data;
            // Query params filter
            const query = new URLSearchParams(location.search);
            if (query.get("status")) {
                if (query?.get("status") === "ALL_PENDING") {
                    listData = listData?.filter?.(({ status }) => ["PENDING_APPROVAL", "PENDING_CN_APPROVAL"].includes(status));
                    console.log("getData ~ listData", listData);
                } else {
                    listData = listData.filter((item) => query?.get("status")?.split(",")?.includes(item.status) ?? true);
                }
            }
            setCNList(listData);

            if (listData.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setGridApi(params.api);
    };

    useEffect(() => {
        if (!_.isEmpty(userDetails)
            && gridApi
            && currentCompany
        ) {
            const { companyUuid } = currentCompany;
            if (companyUuid) getData(companyUuid);
            setColumnDefs(getCNListColDefs(isBuyer));
        }
    }, [userDetails, currentCompany, gridApi, isBuyer]);

    const onRowDoubleClicked = (params) => {
        const { cnUuid } = params && params.data;
        history.push({
            pathname: CREDIT_NOTE_ROUTES.CN_DETAILS,
            search: `?uuid=${cnUuid}`
        });
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("CreditNotesList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={columnDefs}
                        onGridReady={onGridReady}
                        rowData={cnList}
                        gridHeight={500}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                        autoSizeColumn={false}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default CNList;
