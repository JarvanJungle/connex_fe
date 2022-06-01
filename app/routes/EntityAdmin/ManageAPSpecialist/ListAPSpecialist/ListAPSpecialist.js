/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { CSVLink } from "react-csv";
import {
    Container, ButtonToolbar, Button, Row, Col
} from "components";
import UploadButton from "routes/components/UploadButton";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import { AgGridTable } from "routes/components";
import APSpecialistService from "services/APSpecialistService/APSpecialistService";
import { useSelector } from "react-redux";
import CSVHelper from "helper/CSVHelper";
import _ from "lodash";
import useToast from "routes/hooks/useToast";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { usePermission } from "routes/hooks";
import AP_SPECIALIST_ROUTES from "../routes";
import { ListAPSpecialistColDefs } from "../ColumnDefs";

export default function ListAPSpecialist() {
    const { t } = useTranslation();
    const history = useHistory();
    const showToast = useToast();
    const buttonRef = React.createRef();
    const [isLoading, setIsLoading] = useState(false);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const apSpecialistPermission = usePermission(FEATURE.AP_SPECIALIST);

    const [companyUuid, setCompanyUuid] = useState("");
    const [listAPSpecialist, setListAPSpecialist] = useState([]);
    const [gridApi, setGridApi] = useState(null);

    const handleOnError = (err) => {
        showToast("error", err);
    };

    const handleOpenDialog = (e) => {
        if (buttonRef?.current) {
            buttonRef?.current.open(e);
        }
    };

    const retrieveListAPSpecialist = async () => {
        gridApi.showLoadingOverlay();
        try {
            const response = await APSpecialistService.getListAPSpecialist(companyUuid);
            gridApi.hideOverlay();
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response && response.data;
                setListAPSpecialist(data);

                if (data.length === 0) {
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

    const handleOnDrop = (data = []) => {
        setIsLoading(true);
        const massUpload = [];
        try {
            for (let i = 0; i < data.length; i++) {
                if (data[i].data[0] !== "" && !data[i].data[0].includes("Group Code *")) {
                    const validationResult = CSVHelper.validateCSV(data, ["Group Code *", "AP Specialist Group *", "External Vendors *"]);
                    if (validationResult.missingField) {
                        throw new Error(`Validate Error: Please select valid  ${validationResult.missingField}`);
                    } else if (!validationResult.validate) {
                        throw new Error(CSVTemplates.NeededFields_Error);
                    }
                    const userEmails = data[i].data[1].split(", ");
                    const vendorCodes = data[i].data[3].split(", ");
                    const uploadItem = {
                        groupCode: data[i].data[0],
                        userEmails,
                        remarks: data[i].data[2],
                        vendorCodes
                    };
                    massUpload.push(uploadItem);
                }
            }
        } catch (error) {
            showToast("error", error.message);
            setIsLoading(false);
            return;
        }
        const payload = [
            ...massUpload
        ];
        APSpecialistService.postMassUploadAPSpecialList(companyUuid, payload).then((res) => {
            setIsLoading(false);
            if (res.data.status === "OK") {
                const message = "Mass Upload Done";
                showToast("success", message);
                retrieveListAPSpecialist();
            } else {
                const { message } = res.data;
                showToast("error", message);
            }
        }).catch((error) => {
            const { message } = error.response.data;
            showToast("error", message);
            setIsLoading(false);
        });
    };

    const handleExport = () => {
        gridApi.exportDataAsCsv({ fileName: CSVTemplates.List_AP_Specialist_DownloadFileName });
    };

    const onRowDoubleClick = (event) => {
        history.push(`${AP_SPECIALIST_ROUTES.AP_SPECIALIST_DETAILS}?uuid=${event.data.uuid}`);
    };

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
    };

    useEffect(() => {
        if (companyUuid && gridApi) retrieveListAPSpecialist();
    }, [companyUuid, gridApi]);

    useEffect(() => {
        if (!_.isEmpty(permissionReducer)) {
            const currentCompanyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (currentCompanyUuid) setCompanyUuid(currentCompanyUuid);
        }
    }, [permissionReducer]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ManageAPSpecialist")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row>
                <Col lg={12}>
                    <div className="d-flex mb-2">

                        <ButtonToolbar className="ml-auto">
                            <Button color="secondary" className="mb-2 mr-2 px-3" onClick={handleExport}>
                                <i className="fa fa-download" />
                                {" "}
                                {t("Download")}
                            </Button>
                            {apSpecialistPermission.write && (
                                <>
                                    <UploadButton
                                        buttonRef={buttonRef}
                                        handleOnDrop={handleOnDrop}
                                        isLoading={isLoading}
                                        handleOnError={handleOnError}
                                        translation={t}
                                        handleOpenDialog={handleOpenDialog}
                                    />
                                    <Button color="primary" className="mb-2 mr-2 px-3">
                                        <CSVLink
                                            data={CSVTemplates.AP_Specialist_ListData}
                                            headers={CSVTemplates.AP_Specialist_ListHeaders}
                                            filename={CSVTemplates.AP_Specialist_TemplateFileName}
                                            style={{ color: "white" }}
                                        >
                                            <i className="fa fa-download" />
                                            {" "}
                                            {t("Template")}
                                        </CSVLink>
                                    </Button>
                                    <Link to={AP_SPECIALIST_ROUTES.AP_SPECIALIST_CREATE}>
                                        <Button color="primary" className="mb-2 px-3">
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
                    <AgGridTable
                        columnDefs={ListAPSpecialistColDefs}
                        rowData={listAPSpecialist}
                        gridHeight={500}
                        onGridReady={onGridReady}
                        onRowDoubleClicked={onRowDoubleClick}
                        sizeColumnsToFit
                    />
                </Col>
            </Row>
        </Container>
    );
}
