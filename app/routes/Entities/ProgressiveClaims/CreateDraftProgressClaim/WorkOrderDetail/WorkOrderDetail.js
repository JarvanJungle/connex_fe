import React, {
    useEffect,
    useRef,
    useState
} from "react";
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    Input
} from "components";
import { useTranslation } from "react-i18next";
import {
    useHistory,
    useLocation
} from "react-router";
import useToast from "routes/hooks/useToast";
import { Formik } from "formik";
import { ToastContainer } from "react-toastify";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import StickyFooter from "components/StickyFooter";
import URL_CONFIG from "services/urlConfig";
import {
    AuditTrail,
    CommonConfirmDialog,
    Conversation
} from "routes/components";
import { HeaderMain } from "routes/components/HeaderMain";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import classNames from "classnames";
import InitialSetting from "./InitialSetting";
import VendorInformation from "./VendorInformation";
import GeneralInformation from "./GeneralInformation";
import SummaryDetails from "./SummaryDetails";
import PaymentClaimHistory from "./PaymentClaimHistory";
import WorkSpace from "./WorkSpace";
import {
    initialValues,
    PAGE_STAGE,
    validationSchema
} from "../Helper";
import ContractModuleService
    from "../../../../../services/ContractModuleService/ContractModuleService";
import CUSTOM_CONSTANTS, {
    CONTRACT_REQUEST_LIST_STATUS,
    DWR_ACTIONS
} from "../../../../../helper/constantsDefined";
import DraftProgressiveClaimService
    from "../../../../../services/DraftProgressiveClaimService/DraftProgressiveClaimService";
import {
    convertToLocalTime,
    formatDateString,
    formatDisplayDecimal,
    getCurrentCompanyUUIDByStore,
    sortArrayByName
} from "../../../../../helper/utilities";
import ExtVendorService from "../../../../../services/ExtVendorService";
import PurchaseOrderService
    from "../../../../../services/PurchaseOrderService/PurchaseOrderService";
import UserService from "../../../../../services/UserService";
import UOMDataService from "../../../../../services/UOMService";
import ConversationService from "../../../../../services/ConversationService/ConversationService";
import { WorkSpaceComponent } from "../../../../P2P/PurchaseOrder/DeveloperWorkOrderDetails/components";
import AuditTrailComponent
    from "../../../../P2P/PurchaseOrder/DeveloperWorkOrderDetails/components/AuditTrailComponent/AuditTrailComponent";
import GroupButtonByStatus from "../../components/GroupButtonByStatus";
import useUnsavedChangesWarning
    from "../../../../components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import DeveloperWorkRequestService
    from "../../../../../services/DeveloperWorkRequestService/DeveloperWorkRequestService";
import DEVELOPER_WR_MODULE_ROUTE from "../../../../../services/DeveloperWorkRequestService/urls";
import EntitiesService from "../../../../../services/EntitiesService";

export default function WorkOrderDetail() {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const showToast = useToast();
    const params = useParams();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const requestFormRef = useRef(null);
    const companyID = useRef("");
    const dwoID = useRef("");
    const [pageState, setPageState] = useState(PAGE_STAGE.CREATE);
    const [raisePPRStates, setRaisePPRStates] = useState({
        loading: false,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        showAddCatalogue: false,
        showAddContact: false,
        showAddForecast: false,
        catalogueItems: [],
        forecastItems: [],
        contactItems: [],
        suppliers: [],
        uoms: [],
        currencies: [],
        taxRecords: [],
        addresses: [],
        responseUOMs: [],
        glAccounts: [],
        typeOfRequisitions: [],
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        projects: [],
        procurementTypes: [
            { label: "Goods", value: "GOODS" },
            { label: "Service", value: "SERVICE" }
        ],
        approvalRoutes: [],
        rowDataProject: [],
        rowDataTrade: [],
        rowDataItem: [],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataItemReq: [],
        rowDataAuditTrail: [],
        rowDataPaymentClaimHistory: [],
        rowDataSummary: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        selectedCatalogueItems: [],
        selectedForecastItems: [],
        selectedContactItems: [],
        externalConversationLines: [],
        internalConversationLines: [],
        users: []
    });
    const [woDetailState, setWoDetaitState] = useState();
    const initialDialogConfig = {
        isShow: false,
        title: "",
        isTextArea: false,
        textAreaPlaceholder: t("Please enter reason.."),
        contentPositive: t("Confirm"),
        colorPositive: "primary",
        contentNegative: t("Back"),
        colorNegative: "secondary",
        titleRequired: false,
        validateForm: false,
        onPositiveAction: () => null
    };
    const [displaDialogConfig, setDisplayDialogConfig] = useState(initialDialogConfig);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const { userDetails } = authReducer;

    const getArchitects = () => {
        const consultants = woDetailState.workSpace?.consultants || [];
        return consultants.filter((item) => item.role === "ARCHITECT");
    };

    const getQuantitySurveyors = () => {
        const consultants = woDetailState.workSpace?.consultants || [];
        return consultants.filter((item) => item.role === "MAIN_QS");
    };

    const getWorkingOrderDetail = async (currentCompanyUUID, dwoUuid) => {
        try {
            const dwoDetails = await DraftProgressiveClaimService
                .getWorkingOrderDetail(currentCompanyUUID, dwoUuid);
            const { data } = dwoDetails.data;
            setWoDetaitState(data);
        } catch (error) {
            console.log(error);
            showToast("error", error.message ? error.message : error.response.data.message);
        }
    };

    const loadWorkingOrderDetails = async (setValues) => {
        if (woDetailState) {
            const workSpace = woDetailState.workSpace || {};
            const vendorInformation = permissionReducer.isBuyer
                ? woDetailState.supplierInformation : woDetailState.buyerInformation;
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            const { dwoUuId } = params;
            companyID.current = companyUuid;
            dwoID.current = dwoUuId;
            let listParentItemsWorkSpace = await PurchaseOrderService.getListChildWorkSpace(
                permissionReducer.isBuyer,
                companyUuid,
                dwoUuId,
                0
            );
            listParentItemsWorkSpace = sortArrayByName(listParentItemsWorkSpace?.data?.data, "workCode");
            listParentItemsWorkSpace = listParentItemsWorkSpace.map((item) => ({
                ...item,
                groupNumber: [item.groupNumber]
            }));
            const listUserResponse = await UserService.getCompanyUsers(companyUuid);
            const listUser = listUserResponse.data.data;
            const responseUOMs = await UOMDataService.getUOMRecords(companyUuid);

            const resExternalConversation = await ConversationService
                .getDetailExternalConversation(
                    companyUuid, dwoUuId
                );
            const rowDataExternalConversation = [
                ...raisePPRStates.rowDataExternalConversation
            ];

            if (resExternalConversation.data.status === "OK") {
                resExternalConversation?.data?.data?.conversations
                    .forEach((item) => {
                        rowDataExternalConversation.push({
                            userName: item.sender,
                            userRole: item.designation,
                            userUuid: item.userUuid,
                            dateTime: formatDateString(new Date(item.createdAt),
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                            comment: item.text,
                            externalConversation: true
                        });
                    });
            }

            const quantitySurveyors = getQuantitySurveyors();
            const architects = getArchitects();

            setRaisePPRStates((prevState) => ({
                ...prevState,
                users: listUser,
                uoms: responseUOMs.data.data,
                rowDataAuditTrail: woDetailState.dwoAuditTrail,
                rowDataPaymentClaimHistory: woDetailState.paymentClaimHistory,
                rowDataSummary: listParentItemsWorkSpace,
                rowDataExternalConversation
            }));

            const initValues = {
                ...initialValues,
                project: workSpace.project || false,
                tradeTitle: workSpace.tradeTitle,
                tradeCode: workSpace.tradeCode,

                // General information
                contractType: workSpace.contractType,
                workOrderTitle: woDetailState.workOrderTitle || "",
                dwoDate: formatDateString(woDetailState.dwoDate),
                dateOfConfirmation: formatDateString(woDetailState.dateOfConfirmation) || "",
                remarks: woDetailState.remarks || "",

                // Summary details
                originalContractSum: workSpace.originalContractSum,
                bqContingencySum: workSpace.bqContingencySum,
                remeasuredContractSum: workSpace.remeasuredContractSum,
                agreedVariationOrderSum: `${workSpace.currencyCode} ${workSpace.agreedVariationOrderSum}`,
                adjustedContractSum: `${workSpace.currencyCode} ${workSpace.adjustedContractSum}`,
                includeVariation: workSpace.includeVariation,
                retentionPercentage: parseFloat(workSpace.retentionPercentage)
                    .toFixed(2),
                retentionCappedPercentage: parseFloat(workSpace.retentionCappedPercentage)
                    .toFixed(2),
                retentionAmountCappedAt: parseFloat(workSpace.retentionAmountCappedAt)
                    .toFixed(2),

                companyUuid: vendorInformation.companyUuid,

                // Vendor information
                vendorCode: vendorInformation.vendorCode,
                vendorName: vendorInformation.vendorName,
                vendorUuid: vendorInformation.vendorUuid,
                contactName: vendorInformation.contactName,
                contactEmail: vendorInformation.contactEmail,
                contactNumber: vendorInformation.contactNumber,
                countryCode: vendorInformation.countryCode,
                companyRegistrationNo: vendorInformation.companyRegistrationNo,

                // Initial Setting
                dwoNumber: woDetailState.dwoNumber,
                dwoStatus: woDetailState.dwoStatus.replace("_", " "),
                projectCode: workSpace.projectCode,
                currencyCode: workSpace.currencyCode || "",

                // Payment claim history
                paymentClaimHistory: woDetailState.paymentClaimHistory,

                // Work space
                architects,
                quantitySurveyors
            };
            setValues(initValues);
        }
    };

    const addDWRChildItem = async (parentNode, rowData) => {
        try {
            const { dwoUuId } = params;
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);

            const { data } = await PurchaseOrderService.getListChildWorkSpace(
                permissionReducer.isBuyer,
                companyUuid,
                dwoUuId,
                parentNode.itemUuid
            );
            let itemChild = sortArrayByName(data?.data, "workCode");
            itemChild = itemChild.map((item) => ({
                ...item,
                groupNumber: [...parentNode.groupNumber, item.groupNumber]
            }));

            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                rowDataSummary: [...rowData, ...itemChild]
            }));
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message);
        }
    };

    const handleCreateDraftClaim = async (companyUuid) => {
        try {
            const response = await DraftProgressiveClaimService.createDraftClaim(
                companyUuid,
                dwoID.current
            );
            setDisplayDialogConfig(initialDialogConfig);

            const {
                externalConversationLines
            } = raisePPRStates;
            if (externalConversationLines.length > 0) {
                const conversationBody = {
                    referenceId: response.data.data,
                    supplierUuid: userDetails.uuid,
                    conversations: raisePPRStates.externalConversationLines
                };
                await ConversationService
                    .createExternalConversation(companyUuid, conversationBody);
            }
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST_CREATE.replace(":dpcUuid", response.data.data)
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };

    const onSavePressHandler = async (values, action) => {
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);

        let dialogContent = {
            ...initialDialogConfig,
            isShow: true
        };
        switch (action) {
        case PAGE_STAGE.DETAIL:
            dialogContent = {
                ...dialogContent,
                ...{
                    title: "Are you sure you want to create draft claim?",
                    onPositiveAction: () => handleCreateDraftClaim(companyUuid),
                    contentPositive: t("Approve"),
                    colorPositive: "primary"
                }
            };
            break;
        }
        setDisplayDialogConfig(dialogContent);
        setPristine();
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...raisePPRStates.internalConversationLines];
            const { rowDataInternalConversation } = raisePPRStates;
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: new Date(),
                comment,
                externalConversation: false
            });
            internalConversationLines.push({
                text: comment
            });
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = raisePPRStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...raisePPRStates.externalConversationLines];
        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: new Date(),
            comment,
            externalConversation: true
        });
        externalConversationLines.push({
            text: comment
        });
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = raisePPRStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: new Date(),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4(),
                isNew: true
            });
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = raisePPRStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: new Date(),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4(),
            isNew: true
        });
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            const file = event.target.files[0];
            data.append("file", file);
            data.append("category", "purchase-service/documents");
            data.append("uploaderRole", "user");
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === "BAD_REQUEST") {
                    showToast("error", "We don't support this file format, please upload another.");
                } else {
                    showToast("error", error.response.data.message);
                }
            } else {
                showToast("error", error.message);
            }
        }
        return null;
    };

    const onAddAttachment = (event, uuid, rowData, isInternal) => {
        setDirty();
        handleFileUpload(event).then((result) => {
            if (!result) return;
            if (isInternal) {
                const newRowData = [...rowData];
                newRowData.forEach((row, index) => {
                    if (row.uuid === uuid) {
                        newRowData[index] = {
                            ...row,
                            guid: result.guid,
                            attachment: result.fileLabel
                        };
                    }
                });
                setRaisePPRStates((prevStates) => ({
                    ...prevStates,
                    rowDataInternalAttachment: newRowData
                }));
                return;
            }

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        guid: result.guid,
                        attachment: result.fileLabel
                    };
                }
            });
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = raisePPRStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = raisePPRStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    useEffect(() => {
        if (
            permissionReducer
            && permissionReducer?.currentCompany
        ) {
            const uuid = params.dwoUuId;
            const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
            if (uuid) {
                setPageState(PAGE_STAGE.DETAIL);
            }
            getWorkingOrderDetail(currentCompanyUUID, uuid);
        }
    }, [permissionReducer]);

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema(t)}
                onSubmit={(value) => {
                }}
            >
                {({
                    errors,
                    values,
                    touched,
                    dirty,
                    handleChange,
                    setFieldValue,
                    handleSubmit,
                    setValues
                }) => {
                    useEffect(() => {
                        loadWorkingOrderDetails(setValues);
                    }, [woDetailState]);
                    return (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row className="justify-content-between mx-0 mb-2 align-items-center">
                                        <HeaderMain
                                            title={t("Develop Worker Order")}
                                            className="mb-3 mb-lg-3"
                                        />

                                        {pageState === PAGE_STAGE.CREATE && (
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                }}
                                                // disabled={poDetailsStates.loading}
                                                style={{
                                                    height: 40,
                                                    minWidth: 100
                                                }}
                                            >
                                                {t("PREVIEW DRAFT PAYMENT CLAIM")}
                                            </Button>
                                        )}
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <InitialSetting
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                pageState={pageState}
                                                handleChange={handleChange}
                                            />
                                            <VendorInformation
                                                dirty={dirty}
                                                values={values.supplierInformation}
                                                errors={errors}
                                                touched={touched}
                                                pageState={pageState}
                                                handleChange={handleChange}
                                            />
                                            <PaymentClaimHistory
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                pageState={pageState}
                                                handleChange={handleChange}
                                            />
                                        </Col>

                                        <Col md={6} lg={6}>
                                            <GeneralInformation
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                pageState={pageState}
                                                handleChange={handleChange}
                                            />
                                            <SummaryDetails
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                pageState={pageState}
                                                handleChange={handleChange}
                                            />
                                        </Col>
                                    </Row>

                                    <HeaderSecondary
                                        title={t("Work Space")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-2">
                                        <Col xs={12}>
                                            {permissionReducer?.currentCompany && (
                                                <WorkSpaceComponent
                                                    t={t}
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    handleChange={handleChange}
                                                    setFieldValue={setFieldValue}
                                                    users={raisePPRStates.users}
                                                    rowDataWorkSpace={raisePPRStates.rowDataSummary}
                                                    onAddChildItem={addDWRChildItem}
                                                    uoms={raisePPRStates.uoms}
                                                />
                                            )}
                                        </Col>
                                    </Row>

                                    <HeaderSecondary
                                        title={t("Conversations")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {/* External Conversations */}
                                            <Conversation
                                                title={t("ExternalConversations")}
                                                activeTab={raisePPRStates.activeExternalTab}
                                                setActiveTab={(idx) => {
                                                    setRaisePPRStates((prevStates) => ({
                                                        ...prevStates,
                                                        activeExternalTab: idx
                                                    }));
                                                }}
                                                rowDataConversation={
                                                    raisePPRStates.rowDataExternalConversation
                                                }
                                                rowDataAttachment={
                                                    raisePPRStates.rowDataExternalAttachment
                                                }
                                                defaultExpanded
                                                borderTopColor="#A9A2C1"
                                                sendConversation={(comment) => {
                                                    sendCommentConversation(comment, false);
                                                }}
                                                addNewRowAttachment={() => {
                                                    addNewRowAttachment(false);
                                                }}
                                                onAddAttachment={(e, uuid, rowData) => {
                                                    onAddAttachment(e, uuid, rowData, false);
                                                }}
                                                onCellEditingStopped={(params) => {
                                                    onCellEditingStopped(params, false);
                                                }}
                                                onDeleteAttachment={() => {}}
                                            />
                                        </Col>
                                    </Row>

                                    <HeaderSecondary
                                        title={t("AuditTrail")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-5">
                                        <Col xs={12}>
                                            {/* Audit Trail */}
                                            <AuditTrailComponent
                                                rowData={raisePPRStates.rowDataAuditTrail || []}
                                                onGridReady={(gridParams) => {
                                                    gridParams.api.sizeColumnsToFit();
                                                }}
                                                paginationPageSize={10}
                                                gridHeight={350}
                                                defaultExpanded
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <CommonConfirmDialog
                                footerBetween
                                isShow={displaDialogConfig.isShow}
                                onHide={() => setDisplayDialogConfig(initialDialogConfig)}
                                title={displaDialogConfig.title}
                                positiveProps={
                                    {
                                        onPositiveAction: () => displaDialogConfig && displaDialogConfig.onPositiveAction(),
                                        contentPositive: displaDialogConfig.contentPositive,
                                        colorPositive: displaDialogConfig.colorPositive
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => setDisplayDialogConfig(initialDialogConfig),
                                        contentNegative: displaDialogConfig.contentNegative,
                                        colorNegative: displaDialogConfig.colorNegative
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired={displaDialogConfig.titleRequired}
                            >
                                {displaDialogConfig.isTextArea && (
                                    <>
                                        <Input
                                            innerRef={reasonInputRef}
                                            type="textarea"
                                            rows={5}
                                            className={
                                                classNames("form-control", {
                                                    "is-invalid": displaDialogConfig.validateForm && displaDialogConfig.titleRequired && reasonInputRef?.current?.value === ""
                                                })
                                            }
                                            placeholder={displaDialogConfig.textAreaPlaceholder}
                                            // value={"reasonState"}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                // setReasonState(value);
                                            }}
                                        />
                                        {displaDialogConfig.validateForm && displaDialogConfig.titleRequired && reasonInputRef?.current?.value === ""
                                        && <div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>}
                                    </>
                                )}

                            </CommonConfirmDialog>
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="danger"
                                        onClick={() => history.push(URL_CONFIG.PROGRESSIVE_ROUTES.SUBMIT_DRAFT_CLAIM)}
                                    >
                                        {t("Back")}
                                    </Button>

                                    <GroupButtonByStatus
                                        t={t}
                                        values={values}
                                        onSavePressHandler={onSavePressHandler}
                                        detailDataState={woDetailState}
                                        pageState={pageState}
                                    />
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
}
