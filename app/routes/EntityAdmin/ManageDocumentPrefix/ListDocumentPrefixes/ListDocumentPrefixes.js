import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import useToast from "routes/hooks/useToast";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import { Container, Row, Col } from "react-bootstrap";
import { HeaderMain } from "routes/components/HeaderMain";
import { convertToLocalTime, defaultColDef } from "helper/utilities";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import { AgGridReact } from "components/agGrid";
import ButtonSpinner from "components/ButtonSpinner";
import _ from "lodash";
import { useCurrentCompany, usePermission } from "routes/hooks";
import DOCUMENT_PREFIX_ROUTES from "../routes";

const ListDocumentPrefixes = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const [companyUuid, setCompanyUuid] = useState("");
    const [gridApi, setGridApi] = useState();
    const [prefixList, setPrefixList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { isBuyer } = permissionReducer;
    const handleRolePermission = usePermission(FEATURE.DOCUMENT_PREFIX);
    const currentCompany = useCurrentCompany();

    const columnDefs = [
        {
            headerName: t("Function"),
            field: "functionName"
        },
        {
            headerName: t("Type"),
            field: "type"
        },
        {
            headerName: t("Prefix"),
            field: "prefixSampleOutput"
        },
        {
            headerName: t("CreatedBy"),
            field: "creator"
        },
        {
            headerName: t("CreatedOn"),
            field: "createdOn",
            valueFormatter: (param) => convertToLocalTime(
                param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss
            )
        }
    ];

    useEffect(() => {
        if (!_.isEmpty(currentCompany)) {
            setCompanyUuid(currentCompany.companyUuid);
        }
    }, [currentCompany]);

    const retrieveDocumentPrefixes = async () => {
        try {
            if (companyUuid) {
                const response = await DocumentPrefixService.getAllPrefixes(companyUuid);
                if (response.data.status === "OK") {
                    const { data } = response.data;
                    let prefixList_ = [];
                    prefixList_ = prefixList_.concat(data.buyerPortalList, data.supplierPortalList);
                    const newList = prefixList_.filter((item) => (
                        item.functionName !== "Rental/Leasing Order"
                        && item.functionName !== "Repair Order"
                        && item.functionName !== "Pre-Purchase Order"
                        && item.functionName !== "Service Order"
                        && item.functionName !== "Pre-Purchase Requisition"
                        && item.functionName !== "Purchase Requisition"
                        && item.functionName !== "Goods Receipt"
                    ));
                    if (isBuyer) {
                        const buyerList = newList.filter((item) => (item.functionName !== "Delivery Order"));
                        setPrefixList(buyerList);
                    } else {
                        const supplierList = newList.filter((item) => (item.functionName === "Delivery Order" || item.functionName === "Invoice" || item.functionName === "Credit Note"));
                        setPrefixList(supplierList);
                    }
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    useEffect(() => {
        retrieveDocumentPrefixes();
    }, [companyUuid]);

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
    };

    const onRowDoubleClick = (event) => {
        history.push(`${DOCUMENT_PREFIX_ROUTES.DOCUMENT_PREFIX_DETAILS}?uuid=${event.data.prefixUuid}`);
    };

    const selectCell = (event) => {
    };

    const onSelectionChanged = (event) => {
    };

    const generatePrefixes = async () => {
        setIsLoading(true);
        try {
            const response = await DocumentPrefixService.generatePrefixes(companyUuid);
            if (response.data.status === "OK") {
                showToast("success", response.data.message);
                retrieveDocumentPrefixes();
            } else {
                throw new Error(response.data.message);
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListOfDocumentPrefixes")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                {
                    prefixList.length === 0 ? (
                        <>
                            <Row className="mb-3">
                                {handleRolePermission?.write ? (
                                    <Col lg={12} className="text-center">
                                        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                            <span className="text-dark">There is no document prefixes for this company. Please click on Generate Prefix button below to generate the list.</span>
                                        </div>
                                        <div>
                                            <ButtonSpinner
                                                isLoading={isLoading}
                                                text={t("GeneratePrefixes")}
                                                className="mb-2 mr-2 px-3"
                                                onclick={generatePrefixes}
                                            />
                                        </div>
                                    </Col>
                                ) : (
                                    <Col lg={12} className="text-center">
                                        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                            <span className="text-dark">There is no document prefixes for this company.</span>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </>
                    ) : (
                        <>
                            <Row className="mb-3">
                                <Col lg={12}>
                                    <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                                        <AgGridReact
                                            columnDefs={columnDefs}
                                            defaultColDef={defaultColDef}
                                            rowData={prefixList}
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
                        </>
                    )
                }
            </Container>
        </>
    );
};

export default ListDocumentPrefixes;
