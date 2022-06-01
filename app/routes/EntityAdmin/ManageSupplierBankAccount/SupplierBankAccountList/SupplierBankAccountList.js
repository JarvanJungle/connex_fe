import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { HeaderMain } from "routes/components/HeaderMain";
import { CSVLink } from "react-csv";
import {
    Container, ButtonToolbar, Button, Row, Col
} from "components";
import UploadButton from "routes/components/UploadButton";
import { AgGridTable } from "routes/components";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import BankAccountService from "services/BankAccountService/BankAccountService";
import CSVHelper from "helper/CSVHelper";
import { useSelector } from "react-redux";
import { contentError, contentInfo, isNullOrUndefinedOrEmpty } from "helper/utilities";
import ExtVendorService from "services/ExtVendorService";
import _ from "lodash";
import SUPPLIER_BANK_ACCOUNT_ROUTES_PATH from "../routes";
import {
    supplierBankAccountColumnDefs,
    defaultColDef
} from "../helper";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";

export default function SupplierBankAccountList() {
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
    const buttonRef = React.createRef();
    const [isLoading, setIsLoading] = useState(false);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;
    const [listStates, setListStates] = useState({
        listBankAccount: [],
        gridApi: null,
        gridColumnApi: null,
        isLoading: false,
        deactivationShow: false,
        activationShow: false,
        selectedRow: "",
        activationButtonVisibility: "hidden",
        deactivateOne: true,
        activateOne: true,
        currentCompanyUUID: "",
        listSupplier: []
    });
    const handleRolePermission = usePermission(FEATURE.SUPPLIER_BANK_ACCOUNT);

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setListStates((prevStates) => ({
            ...prevStates,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
    };

    const retrieveBankAccountList = async () => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID)) {
            const res = await BankAccountService.getAllSupplierBankAccount(currentCompanyUUID);
            const resSupplier = await ExtVendorService.getExternalVendors(currentCompanyUUID);
            if (res.data.status === "OK") {
                const listBankAccount = res.data.data;
                setListStates((prevStates) => ({
                    ...prevStates,
                    currentCompanyUUID,
                    listBankAccount,
                    listSupplier: resSupplier.data.data.filter((item) => item.seller === true)
                }));
            } else {
                throw new Error(res.data.message);
            }
        }
    };

    const handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef?.current) {
            buttonRef?.current.open(e);
        }
    };

    const handleOnError = (err) => {
        message = err;
        showToast("error");
    };

    const getSupplierUuid = (value) => {
        const supplier = listStates.listSupplier.find((item) => item.companyCode === value);
        return supplier ? supplier.uuid : null;
    };

    const handleOnDrop = (data = []) => {
        setIsLoading(false);
        const massUpload = [];
        try {
            for (let i = 0; i < data.length; i++) {
                if (data[i].data[0] !== "" && !data[i].data[0].includes("Company Code")) {
                    const validationResult = CSVHelper.validateCSV(data, ["Company Code", "Bank Label", "Country", "Bank Name", "Bank Account No.", "Account Holder Name", "Currency"]);
                    if (validationResult.missingField) {
                        throw new Error(`Validate Error: Please select valid  ${validationResult.missingField}`);
                    } else if (!validationResult.validate) {
                        throw new Error(CSVTemplates.NeededFields_Error);
                    }
                    const defaultAccountBeforeApproval = data[i].data[15].toLowerCase() === "yes";
                    const supplierUuid = getSupplierUuid(data[i].data[0]);
                    if (supplierUuid) {
                        const uploadItem = {
                            companyUuid: listStates.currentCompanyUUID,
                            bankLabel: data[i].data[1],
                            country: data[i].data[2],
                            bankName: data[i].data[3],
                            bankAccountNo: data[i].data[4],
                            accountHolderName: data[i].data[5],
                            currency: data[i].data[6],
                            swiftCode: data[i].data[7],
                            branch: data[i].data[8],
                            branchCode: data[i].data[9],
                            branchCity: data[i].data[10],
                            branchAddressLine1: data[i].data[11],
                            branchAddressLine2: data[i].data[12],
                            postalCode: data[i].data[13],
                            stateProvince: data[i].data[14],
                            defaultAccountBeforeApproval,
                            supplierUuid
                        };
                        massUpload.push(uploadItem);
                    } else {
                        throw new Error("Validate Error: Please select valid Company Code");
                    }
                }
                if (i !== 0 && data[i].data[0] === "") {
                    if (data[i].data.length === 1 && _.isEmpty(data[i].data[0].replace(/ +(?= )/g, ""))) continue;
                    throw new Error("Validate Error: Please select valid Company Code");
                }
            }
        } catch (error) {
            message = error.message;
            showToast("error", message);
            setIsLoading(false);
            return;
        }
        if (massUpload.length !== 0) {
            BankAccountService.postMassUploadSupplierBankAccount(
                listStates.currentCompanyUUID, massUpload
            ).then((res) => {
                setIsLoading(false);
                if (res.data.status === "OK") {
                    message = "Mass Upload Done";
                    showToast("success", message);
                    retrieveBankAccountList();
                } else {
                    message = res.data.message;
                    showToast("error", message);
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error", message);
                setIsLoading(false);
            });
        } else {
            message = "No Data Received";
            showToast("error", message);
        }
    };

    const handleExport = () => {
        listStates.gridApi.exportDataAsCsv(
            { fileName: CSVTemplates.Supplier_Bank_Account_List_DownloadFileName }
        );
    };

    const onRowDoubleClick = (event) => {
        history.push(`${SUPPLIER_BANK_ACCOUNT_ROUTES_PATH.SUPPLIER_BANK_ACCOUNT_DETAILS}?uuid=${event.data.uuid}`);
    };

    useEffect(() => {
        retrieveBankAccountList();
    }, [userPermission]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("List of Supplier Bank Account")}
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
                            {handleRolePermission?.write && (
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
                                            data={CSVTemplates.Supplier_Bank_Account_List_Data}
                                            headers={CSVTemplates.Supplier_Bank_Account_List_Headers}
                                            filename={
                                                CSVTemplates.Supplier_Bank_Account_List_TemplatesFilename
                                            }
                                            style={{ color: "white" }}
                                        >
                                            <i className="fa fa-download" />
                                            {" "}
                                            {t("Template")}
                                        </CSVLink>
                                    </Button>
                                    <Link to={
                                        SUPPLIER_BANK_ACCOUNT_ROUTES_PATH.SUPPLIER_BANK_ACCOUNT_CREATE
                                    }
                                    >
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <i className="fa fa-plus" />
                                            {" "}
                                            {t("Add New")}
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
                        columnDefs={supplierBankAccountColumnDefs(t)}
                        defaultColDef={defaultColDef}
                        rowData={listStates.listBankAccount}
                        gridHeight={580}
                        onGridReady={onGridReady}
                        rowSelection="multiple"
                        rowMultiSelectWithClick
                        onRowDoubleClicked={onRowDoubleClick}
                    />
                </Col>
            </Row>
        </Container>
    );
}
