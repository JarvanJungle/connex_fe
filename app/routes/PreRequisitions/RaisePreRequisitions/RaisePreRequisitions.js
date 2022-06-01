import React, {
    useState, useRef, useEffect, useMemo
} from "react";
import {
    Container, Row, Col,
    Button, ButtonToolbar,
    Input
} from "components";
import { useTranslation } from "react-i18next";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    clearNumber, convertToLocalTime,
    formatDateString, formatDateTime,
    isNullOrUndefined, isNullOrUndefinedOrEmpty,
    sortArrayByName
} from "helper/utilities";
import { useHistory, useLocation } from "react-router";
import { usePermission, useApprovalConfig } from "routes/hooks";
import ManageProjectService from "services/ManageProjectService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import useToast from "routes/hooks/useToast";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import CatalogueDataService from "services/CatalogueService";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import PreRequisitionService from "services/PreRequisitionService";
import {
    PPR_AUDIT_TRAIL_ROLE, PPR_AUDIT_TRAIL_ROLE_CONVERT, PPR_ROLES, PPR_STATUS, PPR_SUBMIT_STATUS
} from "helper/purchasePreRequisitionConstants";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import { CUSTOM_LOCATION_DATE_TYPE } from "helper/constantsDefined";
import {
    AuditTrail, Conversation, AddItemDialog, CommonConfirmDialog
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { PPR_ROUTING } from "services/urlConfig/UrlFeatureConfigurations/PurchasePreRequision/PurchasePreRequisitionUrlConfig";
import ProjectService from "services/ProjectService/ProjectService";
import { useSelector } from "react-redux";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import EntitiesService from "services/EntitiesService";
import { Typography } from "@material-ui/core";
import URL_CONFIG from "services/urlConfig";
import ConversationService from "services/ConversationService/ConversationService";
import CategoryService from "services/CategoryService/CategoryService";
import ActionModal from "routes/components/ActionModal";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import classNames from "classnames";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import CatalogueService from "services/CatalogueService";
import UserService from "services/UserService";
import { CatalogueItemColDefs } from "../ColumnDefs";
import ForecastItemColDefs from "../ColumnDefs/ForecastItemColDefs";
import {
    RaiseRequisitionComponent,
    GeneralInformationComponent,
    InitialSettingsComponent,
    RequestTermsComponent,
    AddingOfItemsComponent
} from "../components";

const RaisePreRequisitions = () => {
    /* Initial Data */
    const { t } = useTranslation();
    const DATE_TIME_FORMAT = CUSTOM_CONSTANTS.YYYYMMDDHHmmss;
    const history = useHistory();
    const location = useLocation();
    const showToast = useToast();
    const addingOfItemRef = useRef(null);
    // const refActionModalCancel = useRef(null);
    const refActionModalRecall = useRef(null);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    /*  */

    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [selectedCatalogue, setSelectedCatalogue] = useState([]);
    const [showAddForecast, setShowAddForecast] = useState(false);
    const [selectedForecast, setSelectedForecast] = useState([]);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [contracted, setContracted] = useState(false);

    const [reasonCancel, setReasonCancel] = useState("");
    const [showErrorReasonCancel, setShowErrorReasonCancel] = useState(false);
    const [displayCancelReason, setDisplayCancelReason] = useState(false);

    const [raisePPRStates, setRaisePPRStates] = useState({
        loading: false,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        suppliers: [],
        uoms: [],
        currencies: [],
        taxRecords: [],
        addresses: [],
        responseUOMs: [],
        glAccounts: [],
        typeOfRequisitions: [],
        listCategory: [],
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
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        externalConversationLines: [],
        internalConversationLines: [],
        isInit: false,
        showErrorReasonSendBack: false,
        reasonSendBack: "",
        displaySendBackReasonDialog: false,
        showErrorReasonReject: false,
        reasonReject: "",
        displayRejectReasonDialog: false,
        isEdit: true,
        isHandle: false,
        enablePrefix: false
    });
    const approvalConfig = useApprovalConfig(FEATURE.PPR);

    const initialValues = {
        approvalConfig: false,
        requisitionType: "",
        natureOfRequisition: false,
        selectProject: "",
        currencyCode: "",
        currencyName: "",
        pprTitle: "",
        procurementType: "",
        approvalRoute: "",
        approvalSequence: "",
        approvalSequenceValue: "",
        requester: "",
        submittedDate: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
        deliveryAddress: "",
        deliveryAddressObject: {},
        deliveryDate: "",
        note: "",
        addingItemFromList: [],
        documentDtoList: [],
        purchaseOrderDetails: [],
        auditTrailDtoList: [],
        listAddress: [],
        isEdit: true,
        enablePrefix: false
    };
    const handleRolePermission = usePermission(FEATURE.PPR);

    const validationSchema = Yup.object().shape({
        projectCode: Yup.string()
            .test(
                "projectRequired",
                t("PleaseSelectValidProject"),
                (value, testContext) => {
                    const { parent } = testContext;
                    return ((value && parent.natureOfRequisition)
                        || (!value && !parent.natureOfRequisition));
                }
            ),
        requisitionType: Yup.string()
            .required(t("PleaseSelectValidTypeOfRequisition")),
        pprTitle: Yup.string()
            .required(t("PleaseEnterValidPPRTitle")),
        procurementType: Yup.string()
            .required(t("PleaseSelectValidProcurementType")),
        approvalRoute: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
        deliveryAddress: Yup.string()
            .required(t("PleaseSelectValidDeliveryAddress")),
        deliveryDate: Yup.string()
            .required(t("PleaseSelectValidDeliveryDate")),
        currencyCode: Yup.string()
            .required(t("PleaseSelectValidCurrency")),
        pprNumber: Yup.string()
            .test(
                "doRequired",
                t("PleaseSelectValidPurchaseRequestNo"),
                (value, testContext) => {
                    const { parent } = testContext;
                    if (parent.enablePrefix && !value) {
                        return false;
                    }
                    return true;
                }
            )
    });
    const itemSchema = Yup.array()
        .of(
            Yup.object().shape({
                itemCode: Yup.string()
                    .required(t("ItemOrderPleaseEnterValidItemCode")),
                itemName: Yup.string()
                    .required(t("ItemOrderPleaseEnterValidItemName")),
                uomCode: Yup.string()
                    .required(t("ItemOrderPleaseSelectValidUOMCode")),
                itemCategory: Yup.string()
                    .required(t("ItemOrderPleaseSelectValidCategory")),
                deliveryAddress: Yup.object()
                    .required(t("ItemOrderPleaseSelectValidAddress"))
                    .test(
                        "not-valid-address",
                        t("ItemOrderPleaseSelectValidAddress"),
                        (address) => Object.keys(address).length > 0
                    ),
                requestDeliveryDate: Yup.string()
                    .required(t("PleaseSelectValidDeliveryDate")),
                quantity: Yup.number()
                    .required(t("Please enter quantity"))
                    .test(
                        "positive-integer",
                        t("QuantityMustBeGreaterThanZero"),
                        (itemQuantity) => itemQuantity > 0
                    )
            })
        );

    const itemSchemaProject = Yup.array()
        .of(
            Yup.object().shape({
                itemCode: Yup.string()
                    .required(t("ItemOrderPleaseEnterValidItemCode")),
                itemName: Yup.string()
                    .required(t("ItemOrderPleaseEnterValidItemName")),
                uomCode: Yup.string()
                    .required(t("ItemOrderPleaseSelectValidUOMCode")),
                itemCategory: Yup.string()
                    .required(t("ItemOrderPleaseSelectValidCategory")),
                deliveryAddress: Yup.object()
                    .required(t("ItemOrderPleaseSelectValidAddress"))
                    .test(
                        "not-valid-address",
                        t("ItemOrderPleaseSelectValidAddress"),
                        (address) => Object.keys(address).length > 0
                    ),
                requestDeliveryDate: Yup.string()
                    .required(t("PleaseSelectValidDeliveryDate")),
                quantity: Yup.number()
                    .positive(t("QuantityMustBeGreaterThanZero"))
                    .test(
                        "positive-integer",
                        t("QuantityMustBeGreaterThanZero"),
                        (itemQuantity) => itemQuantity > 0
                    )
            })
        );
    /* Use States */

    const [pprStatus, setPPRStatus] = useState(PPR_STATUS.RAISING_PPR);
    const [pprRoles, setPPRRoles] = useState(null);
    const [isRecall, setIsRecall] = useState(false);

    const requestFormRef = useRef(null);

    const prefixStatus = async (currentCompanyUUID) => {
        let enablePrefix = false;
        const response = await DocumentPrefixService.getAllPrefixes(currentCompanyUUID);
        if (response.data.status === "OK") {
            const { data } = response.data;
            data.buyerPortalList.forEach((item) => {
                if (item.functionName === "Pre-Purchase Requisition" && item.type === "Manual") {
                    enablePrefix = true;
                }
            });
        } else {
            throw new Error(response.data.message);
        }
        requestFormRef?.current?.setFieldValue("enablePrefix", enablePrefix);
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            enablePrefix
        }));
    };
    const retrievePPRDetails = async (pprUuid, currentCompanyUUID) => {
        try {
            const response = await PreRequisitionService
                .getPPRDetails(currentCompanyUUID, pprUuid);
            const {
                data, status, statusCode, message
            } = response.data;
            if (status === "OK" || statusCode === 200) {
                const pprItems = data?.pprItemDtoList.map((item) => ({
                    ...item,
                    supplier: {
                        companyName: item.supplierName,
                        uuid: item.supplierUuid
                    }
                }));
                setContracted(pprItems[0]?.contracted ?? false);
                requestFormRef?.current?.setValues({
                    requisitionType: data.requisitionType,
                    natureOfRequisition: data.project,
                    status: data.status,
                    selectProject: {
                        ...data.selectProject,
                        projectCode: data.projectCode,
                        currency: data.currencyCode
                    },
                    projectCode: data.projectCode,
                    pprNumber: data.pprNumber,
                    currencyCode: data.currencyCode,
                    currencyName: data.currencyName,
                    pprTitle: data.pprTitle,
                    procurementType: data.procurementType,
                    approvalRoute: data.approvalCodeUuid || "",
                    approvalCode: data.approvalCode || "",
                    approvalSequence: data.approvalSequence || "",
                    approvalSequenceValue: data.approvalSequence || "",
                    requester: data.requesterName,
                    submittedDate: data?.submittedOn
                        ? convertToLocalTime(
                            data.submittedOn, CUSTOM_CONSTANTS.DDMMYYYHHmmss
                        )
                        : convertToLocalTime(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                    deliveryAddress: data.pprItemDtoList[0]?.deliveryAddress.addressLabel,
                    deliveryAddressObject: data.pprItemDtoList[0]?.deliveryAddress,
                    deliveryDate: formatDateTime(
                        data.pprItemDtoList[0]?.requestDeliveryDate,
                        CUSTOM_CONSTANTS.YYYYMMDD
                    ),
                    note: data.note,
                    addingItemFromList: pprItems,
                    attachmentList: [],
                    auditTrailDtoList: data.auditTrailDtoList,
                    pprUuid: data.pprUuid,
                    rowDataInternalConversation: data.pprInternalConversationDtoList,
                    rowDataInternalAttachment: data.documentDtoList.filter(
                        (attachment) => attachment.externalDocument === false
                    ),
                    rowDataExternalAttachment: data.documentDtoList.filter(
                        (attachment) => attachment.externalDocument === true
                    ),
                    isEdit: raisePPRStates.isEdit,
                    enablePrefix: false
                });
                if (!isNullOrUndefined(data.status)) {
                    setPPRStatus(data.status);
                }
                const rowDataExternalConversation = [
                    ...raisePPRStates.rowDataExternalConversation];
                try {
                    const resExternalConversation = await ConversationService
                        .getDetailExternalConversation(
                            currentCompanyUUID, data.pprUuid
                        );
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
                } catch (error) {}
                const rowDataInternalConversation = [
                    ...raisePPRStates.rowDataInternalConversation];
                try {
                    const resInternalConversation = await ConversationService
                        .getDetailInternalConversation(
                            currentCompanyUUID, data.pprUuid
                        );
                    resInternalConversation?.data?.data?.conversations
                        .forEach((item) => {
                            rowDataInternalConversation.push({
                                userName: item.sender,
                                userRole: item.designation,
                                userUuid: item.userUuid,
                                dateTime: formatDateString(new Date(item.date),
                                    CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                comment: item.text,
                                externalConversation: true
                            });
                        });
                } catch (error) {}
                setRaisePPRStates((prevStates) => ({
                    ...prevStates,
                    rowDataExternalConversation,
                    rowDataInternalConversation
                }));
                if (data.status === PPR_STATUS.CANCELLED
                    || data.status === PPR_STATUS.PENDING_APPROVAL
                    || data.status === PPR_STATUS.REJECTED
                    || data.status === PPR_STATUS.CONVERTED_TO_PR
                    || data.status === PPR_STATUS.APPROVED
                    || data.status === PPR_STATUS.PENDING_CONVERSION_TO_PO
                ) {
                    const arrayAddingItemFromList = requestFormRef
                        ?.current?.values.addingItemFromList;
                    arrayAddingItemFromList.forEach((e) => { e.isView = true; });
                }
                if (
                    data.status === PPR_STATUS.RECALLED
                    || data.status === PPR_STATUS.PENDING_SUBMISSION
                    || data.status === PPR_STATUS.SENT_BACK
                ) {
                    const arrayAddingItemFromList = requestFormRef
                        ?.current?.values.addingItemFromList;
                    arrayAddingItemFromList.forEach((e) => {
                        e.isEditable = true;
                        e.isView = false;
                    });
                }
                if (data.userInfoDto) {
                    const { approverRole, hasApproved, prCreator } = data.userInfoDto;
                    if (approverRole) {
                        if (hasApproved) {
                            setPPRRoles(PPR_ROLES.PURCHASER);
                        } else {
                            setPPRRoles(PPR_ROLES.PPR_APPROVER);
                        }
                    } else if (prCreator) {
                        setPPRRoles(PPR_ROLES.PPR_CREATOR);
                    } else if (hasApproved) {
                        setPPRRoles(PPR_ROLES.PURCHASER);
                    } else {
                        setPPRRoles(PPR_ROLES.NONE_ROLE);
                    }
                }
                if (data.requesterName === userDetails.name) {
                    setIsRecall(true);
                } else {
                    setIsRecall(false);
                }
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.log("error", error);
            showToast("error", error.message);
        }
    };
    const mappingBodyParams = (params, type = "") => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        const listInternal = raisePPRStates.rowDataInternalAttachment.map((item) => ({
            guid: item.guid,
            title: "",
            fileName: item.fileLabel || item.attachment,
            description: item.fileDescription,
            uploadBy: userDetails.name
        }));
        const listExternal = raisePPRStates.rowDataExternalAttachment.map((item) => ({
            guid: item.guid,
            title: "",
            fileName: item.fileLabel || item.attachment,
            description: item.fileDescription,
            uploadBy: userDetails.name,
            externalDocument: true
        }));
        const listDocument = listInternal.concat(listExternal);
        listDocument.forEach((item) => {
            if (!item.guid) {
                throw new Error("Please attach a file!");
            }
        });
        const internal = requestFormRef.current?.values.rowDataInternalAttachment || [];
        const external = requestFormRef.current?.values.rowDataExternalAttachment || [];
        const currentAttachment = internal.concat(external);
        const listDocDto = listDocument.filter((item) => currentAttachment
            .filter((value) => value.guid === item.guid).length === 0);
        const pprItemList = params?.addingItemFromList;
        const newPprItemList = pprItemList.map(({
            itemCode, itemName, requestDeliveryDate,
            uomCode, itemCategory, supplier, accountNumber, ...rest
        }) => ({
            ...rest,
            itemCode: itemCode ?? "",
            itemName: itemName ?? "",
            requestDeliveryDate: requestDeliveryDate ? formatDateTime(
                requestDeliveryDate, DATE_TIME_FORMAT
            ) : "",
            uomCode: uomCode?.uomCode ?? uomCode ?? "",
            itemCategory: itemCategory?.categoryName ?? itemCategory ?? "",
            supplierName: supplier?.companyName ?? "",
            supplierUuid: supplier?.uuid ?? "",
            accountNumber
        }));
        newPprItemList.forEach((item) => {
            if (item.quantity === "") {
                throw new Error("Please enter quantity");
            } else if (!Number(item.quantity) && Number(item.quantity) !== 0) {
                throw new Error("Invalid Quantity");
            } else if (!item.supplierUuid && item.contracted === true) {
                throw new Error("Please select supplier");
            }
        });
        const PPRBody = {
            pprUuid: params?.pprUuid,
            pprTitle: params?.pprTitle,
            currencyCode: params?.currencyCode,
            procurementType: params?.procurementType,
            project: params?.natureOfRequisition,
            approvalCode: params?.approvalCode,
            approvalCodeUuid: params?.approvalRoute,
            pprNumber: params?.pprNumber,
            status: "",
            approvalSequence: params?.approvalSequenceValue,
            submittedDate: type !== "" ? formatDateTime(new Date(), DATE_TIME_FORMAT)
                : formatDateTime(params?.submittedDate, DATE_TIME_FORMAT),
            note: params?.note,
            requesterName: userDetails.name,
            requesterUuid: userDetails.uuid,
            companyUuid: currentCompanyUUID,
            pprItemDtoList: newPprItemList,
            documentDtoList: listDocDto
        };

        if (!PPRBody.approvalCodeUuid) {
            delete PPRBody.approvalSequence;
            delete PPRBody.approvalCode;
            delete PPRBody.approvalCodeUuid;
        }

        let projectUuid = "";
        if (params?.natureOfRequisition) {
            raisePPRStates.projects.forEach((item) => {
                if (item.projectCode === params?.projectCode) {
                    projectUuid = item.uuid;
                }
            });
        }
        const newPPRBody = params?.natureOfRequisition ? {
            ...PPRBody,
            projectCode: params?.projectCode,
            projectUuid
        } : {
            ...PPRBody
        };
        return newPPRBody;
    };
    const createPPR = async (params) => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        if (!isNullOrUndefined(params)) {
            try {
                const createPPRBody = mappingBodyParams(params);
                createPPRBody.status = PPR_SUBMIT_STATUS.CREATE;
                if (createPPRBody.project) {
                    await itemSchemaProject.validate(createPPRBody.pprItemDtoList);
                } else {
                    await itemSchema.validate(createPPRBody.pprItemDtoList);
                }
                const response = await PreRequisitionService
                    .postCreatePPR(currentCompanyUUID, createPPRBody);
                const {
                    status, statusCode, message, data
                } = response.data;
                if (status === "OK" || statusCode === 200) {
                    createPPRBody.pprItemDtoList.forEach(async (item) => {
                        setPristine();
                        if (item.isManual) {
                            const body = {
                                catalogueItemName: item.itemName,
                                catalogueItemCode: item.itemCode,
                                companyUuid: currentCompanyUUID,
                                uomCode: item.uomCode,
                                description: item.itemDescription,
                                unitPrice: item.unitPrice ? Number(clearNumber(item.unitPrice)) : 0,
                                isManual: true,
                                itemSize: item.itemSize,
                                itemModel: item.itemModel,
                                itemBrand: item.itemBrand,
                                itemCategory: item.itemCategory,
                                categoryDto: raisePPRStates.listCategory
                                    .filter((cat) => cat.categoryName === item.itemCategory)[0]
                            };
                            await CatalogueDataService.postCreateCatalogue(body);
                        }
                    });
                    try {
                        if (raisePPRStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: data,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.externalConversationLines
                            };
                            ConversationService
                                .createExternalConversation(currentCompanyUUID, conversationBody);
                        }
                        if (raisePPRStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: data,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.internalConversationLines
                            };
                            ConversationService
                                .createInternalConversation(currentCompanyUUID, conversationBody);
                        }
                    } catch (error) {}
                    history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };
    const saveDraftPPR = async (params) => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        if (!isNullOrUndefined(params)) {
            try {
                const createPPRBody = mappingBodyParams(params);
                console.log("saveDraftPPR ~ createPPRBody", createPPRBody);
                createPPRBody.status = PPR_SUBMIT_STATUS.DRAFT;
                if (createPPRBody.project) {
                    await itemSchemaProject.validate(createPPRBody.pprItemDtoList);
                } else {
                    await itemSchema.validate(createPPRBody.pprItemDtoList);
                }
                const response = await PreRequisitionService
                    .postSaveAsDraftPPR(currentCompanyUUID, createPPRBody);
                const {
                    status, statusCode, message, data
                } = response.data;
                if (status === "OK" || statusCode === 200) {
                    setPristine();
                    createPPRBody.pprItemDtoList.forEach(async (item) => {
                        if (item.isManual) {
                            const body = {
                                catalogueItemName: item.itemName,
                                catalogueItemCode: item.itemCode,
                                companyUuid: currentCompanyUUID,
                                uomCode: item.uomCode,
                                description: item.itemDescription,
                                unitPrice: item.unitPrice ? Number(clearNumber(item.unitPrice)) : 0,
                                isManual: true,
                                itemSize: item.itemSize,
                                itemModel: item.itemModel,
                                itemBrand: item.itemBrand,
                                itemCategory: item.itemCategory,
                                categoryDto: raisePPRStates.listCategory
                                    .filter((cat) => cat.categoryName === item.itemCategory)[0]
                            };
                            await CatalogueDataService.postCreateCatalogue(body);
                        }
                    });
                    try {
                        if (raisePPRStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: data,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.externalConversationLines
                            };
                            await ConversationService
                                .createExternalConversation(currentCompanyUUID, conversationBody);
                        }
                        if (raisePPRStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: data,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.internalConversationLines
                            };
                            await ConversationService
                                .createInternalConversation(currentCompanyUUID, conversationBody);
                        }
                    } catch (error) {}
                    history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };
    const cancelPPR = async (pprUuid, reason) => {
        setPristine();
        setShowErrorReasonCancel(true);
        if (!reason) return;
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        if (!isNullOrUndefined(pprUuid)) {
            try {
                setDisplayCancelReason(false);
                const response = await PreRequisitionService
                    .postCancelPPR(currentCompanyUUID, pprUuid);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    try {
                        const conversationBody = {
                            referenceId: pprUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: [{ text: reason }]
                        };
                        ConversationService
                            .createInternalConversation(currentCompanyUUID, conversationBody);
                    } catch (error) {}
                    history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };
    const mappingBodyApprove = () => {
        const listInternal = raisePPRStates.rowDataInternalAttachment.map((item) => ({
            guid: item.guid,
            title: "",
            fileName: item.fileLabel || item.attachment,
            description: item.fileDescription,
            uploadBy: userDetails.name
        }));
        const listExternal = raisePPRStates.rowDataExternalAttachment.map((item) => ({
            guid: item.guid,
            title: "",
            fileName: item.fileLabel || item.attachment,
            description: item.fileDescription,
            uploadBy: userDetails.name,
            externalDocument: true
        }));
        const listDocument = listInternal.concat(listExternal);
        listDocument.forEach((item) => {
            if (!item.guid) {
                throw new Error("Please attach a file!");
            }
        });
        const internal = requestFormRef.current?.values.rowDataInternalAttachment || [];
        const external = requestFormRef.current?.values.rowDataExternalAttachment || [];
        const currentAttachment = internal.concat(external);
        const listDocDto = listDocument.filter((item) => currentAttachment
            .filter((value) => value.guid === item.guid).length === 0);
        const PPRBody = {
            newlyAddedPrePurchaseReqDocuments: listDocDto
        };
        return PPRBody;
    };
    const sendBackPPR = async (reason) => {
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            showErrorReasonSendBack: true
        }));
        if (raisePPRStates.reasonSendBack) {
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                showErrorReasonSendBack: false
            }));
            const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
            if (!isNullOrUndefined(requestFormRef
                ?.current?.values.pprUuid)) {
                const pprUuid = requestFormRef
                    ?.current?.values.pprUuid;
                const body = mappingBodyApprove(pprUuid);
                try {
                    const response = await PreRequisitionService
                        .postSendBackPPR(currentCompanyUUID, pprUuid, body);
                    const { status, statusCode, message } = response.data;
                    if (status === "OK" || statusCode === 200) {
                        try {
                            if (raisePPRStates.externalConversationLines.length > 0) {
                                const conversationBody = {
                                    referenceId: pprUuid,
                                    supplierUuid: userDetails.uuid,
                                    conversations: raisePPRStates.externalConversationLines
                                };
                                await ConversationService
                                    .createExternalConversation(currentCompanyUUID, conversationBody);
                            }
                            const conversationsLinesExt = [...raisePPRStates.internalConversationLines];
                            conversationsLinesExt.push({ text: reason });
                            if (conversationsLinesExt.length > 0) {
                                const conversationBody = {
                                    referenceId: pprUuid,
                                    supplierUuid: userDetails.uuid,
                                    conversations: conversationsLinesExt
                                };
                                await ConversationService
                                    .createInternalConversation(currentCompanyUUID, conversationBody);
                            }
                        } catch (error) {}
                        setPristine();
                        history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                        showToast("success", message);
                    } else {
                        throw new Error(message);
                    }
                } catch (error) {
                    showToast("error", error.message);
                }
            }
        }
    };
    const rejectPPR = async (reason) => {
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));
        if (raisePPRStates.reasonReject) {
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                showErrorReasonReject: false
            }));
            const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
            if (!isNullOrUndefined(requestFormRef
                ?.current?.values.pprUuid)) {
                const pprUuid = requestFormRef
                    ?.current?.values.pprUuid;
                const body = mappingBodyApprove();
                try {
                    const response = await PreRequisitionService
                        .postRejectPPR(currentCompanyUUID, pprUuid, body);
                    const { status, statusCode, message } = response.data;
                    if (status === "OK" || statusCode === 200) {
                        try {
                            if (raisePPRStates.externalConversationLines.length > 0) {
                                const conversationBody = {
                                    referenceId: pprUuid,
                                    supplierUuid: userDetails.uuid,
                                    conversations: raisePPRStates.externalConversationLines
                                };
                                await ConversationService
                                    .createExternalConversation(currentCompanyUUID, conversationBody);
                            }
                            const conversationsLinesExt = [...raisePPRStates.internalConversationLines];
                            conversationsLinesExt.push({ text: reason });
                            if (conversationsLinesExt.length > 0) {
                                const conversationBody = {
                                    referenceId: pprUuid,
                                    supplierUuid: userDetails.uuid,
                                    conversations: conversationsLinesExt
                                };
                                await ConversationService
                                    .createInternalConversation(currentCompanyUUID, conversationBody);
                            }
                        } catch (error) {}
                        setPristine();
                        history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                        showToast("success", message);
                    } else {
                        throw new Error(message);
                    }
                } catch (error) {
                    showToast("error", error.message);
                }
            }
        }
    };
    const approvePPR = async () => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        if (!isNullOrUndefined(requestFormRef
            ?.current?.values.pprUuid)) {
            const pprUuid = requestFormRef
                ?.current?.values.pprUuid;
            try {
                const body = mappingBodyApprove(pprUuid);
                const response = await PreRequisitionService
                    .postApprovePPR(currentCompanyUUID, pprUuid, body);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    try {
                        if (raisePPRStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: pprUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.externalConversationLines
                            };
                            await ConversationService
                                .createExternalConversation(currentCompanyUUID, conversationBody);
                        }
                        if (raisePPRStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: pprUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.internalConversationLines
                            };
                            await ConversationService
                                .createInternalConversation(currentCompanyUUID, conversationBody);
                        }
                    } catch (error) {}
                    setPristine();
                    history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };
    const recallPPR = async () => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        if (!isNullOrUndefined(requestFormRef
            ?.current?.values.pprUuid)) {
            const pprUuid = requestFormRef
                ?.current?.values.pprUuid;
            try {
                const response = await PreRequisitionService
                    .postRecallPPR(currentCompanyUUID, pprUuid);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    setPristine();
                    history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };
    const editPPR = async (params) => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        if (!isNullOrUndefined(requestFormRef
            ?.current?.values.pprUuid)) {
            try {
                const createPPRBody = mappingBodyParams(params);
                if (createPPRBody.project) {
                    await itemSchemaProject.validate(createPPRBody.pprItemDtoList);
                } else {
                    await itemSchema.validate(createPPRBody.pprItemDtoList);
                }
                const response = await PreRequisitionService
                    .postEditPPR(currentCompanyUUID, createPPRBody);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    setPristine();
                    createPPRBody.pprItemDtoList.forEach(async (item) => {
                        if (item.isManual) {
                            const body = {
                                catalogueItemName: item.itemName,
                                catalogueItemCode: item.itemCode,
                                companyUuid: currentCompanyUUID,
                                uomCode: item.uomCode,
                                description: item.itemDescription,
                                unitPrice: item.unitPrice ? Number(clearNumber(item.unitPrice)) : 0,
                                isManual: true,
                                itemSize: item.itemSize,
                                itemModel: item.itemModel,
                                itemBrand: item.itemBrand,
                                itemCategory: item.itemCategory,
                                categoryDto: raisePPRStates.listCategory
                                    .filter((cat) => cat.categoryName === item.itemCategory)[0]
                            };
                            await CatalogueDataService.postCreateCatalogue(body);
                        }
                    });
                    try {
                        if (raisePPRStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: createPPRBody.pprUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.externalConversationLines
                            };
                            await ConversationService
                                .createExternalConversation(currentCompanyUUID, conversationBody);
                        }
                        if (raisePPRStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: createPPRBody.pprUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: raisePPRStates.internalConversationLines
                            };
                            await ConversationService
                                .createInternalConversation(currentCompanyUUID, conversationBody);
                        }
                    } catch (error) {}
                    history.push(PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };
    const onAddManualItem = () => {
        const deliveryDateString = requestFormRef?.current?.values.deliveryDate
            ? new Date(requestFormRef?.current?.values.deliveryDate)
                .toLocaleDateString(CUSTOM_LOCATION_DATE_TYPE.ES)
            : new Date()
                .toLocaleDateString(CUSTOM_LOCATION_DATE_TYPE.ES);
        const newItem = {
            manualEntry: true,
            isManual: true,
            itemCode: "",
            itemName: "",
            itemDescription: "",
            itemModel: "",
            itemSize: "",
            itemBrand: "",
            quantity: 0,
            deliveryAddress: requestFormRef?.current?.values.deliveryAddressObject ? requestFormRef?.current?.values.deliveryAddressObject : "",
            requestDeliveryDate: formatDateTime(deliveryDateString, CUSTOM_CONSTANTS.YYYYMMDD),
            note: ""
        };
        addingOfItemRef?.current?.api.applyTransaction({ add: [newItem] });
        const arr = [];
        addingOfItemRef?.current?.api.forEachNode((node) => arr.push(node.data));
        setContracted(arr.length > 0 ? arr[0]?.contracted : false);
        requestFormRef?.current?.setFieldValue("addingItemFromList", arr);
    };
    const handleSelectedItemCatalogue = (value) => {
        const selectedData = value?.map((node) => node.data);
        const requestFormRefValue = requestFormRef?.current?.values;
        const deliveryDateString = requestFormRef?.current?.values.deliveryDate
            ? new Date(requestFormRef?.current?.values.deliveryDate)
                .toLocaleDateString(CUSTOM_LOCATION_DATE_TYPE.ES)
            : new Date().toLocaleDateString(CUSTOM_LOCATION_DATE_TYPE.ES);
        selectedData.forEach((e) => {
            e.isEditable = true;
            e.itemDescription = e.description ? e.description : undefined;
            e.itemCode = e.catalogueItemCode ? e.catalogueItemCode : undefined;
            e.itemName = e.catalogueItemName ? e.catalogueItemName : undefined;
            e.quantity = 0;
            e.note = "";
            e.deliveryAddress = requestFormRefValue?.deliveryAddressObject ? requestFormRefValue.deliveryAddressObject : "";
            e.requestDeliveryDate = formatDateTime(deliveryDateString, CUSTOM_CONSTANTS.YYYYMMDD);
            e.itemCategory = e.itemCategory ? e.itemCategory : raisePPRStates.listCategory[0].categoryName;
            e.isNew = true;
        });
        setSelectedCatalogue(selectedData);
    };
    const handleSelectedItemForecast = (value) => {
        const selectedData = value?.map((node) => node.data);
        const deliveryDateString = requestFormRef?.current?.values.deliveryDate
            ? new Date(requestFormRef?.current?.values.deliveryDate)
                .toLocaleDateString(CUSTOM_LOCATION_DATE_TYPE.ES)
            : new Date()
                .toLocaleDateString(CUSTOM_LOCATION_DATE_TYPE.ES);
        selectedData.forEach((e) => {
            e.isEditable = true;
            e.itemDescription = e.description ? e.description : undefined;
            e.uomCode = e.uomCode ? e.uomCode : undefined;
            e.itemCode = e.catalogueItemCode ? e.catalogueItemCode : undefined;
            e.itemName = e.catalogueItemName ? e.catalogueItemName : undefined;
            e.quantity = 0;
            e.note = "";
            e.deliveryAddress = requestFormRef?.current?.values.deliveryAddressObject ? requestFormRef?.current?.values.deliveryAddressObject : "";
            e.requestDeliveryDate = formatDateTime(deliveryDateString, CUSTOM_CONSTANTS.YYYYMMDD);
            e.itemCategory = e.itemCategory || raisePPRStates.listCategory[0].categoryName;
            e.isNew = true;
        });
        setSelectedForecast(selectedData);
    };
    const handleAddCatalogueToList = () => {
        const { suppliers } = raisePPRStates;
        const newSelectedCatalogues = selectedCatalogue.map(
            ({
                glAccountNumber, supplierName, contractedRefNo, isNew, ...rest
            }) => {
                const supplier = suppliers.find((item) => item.companyName === supplierName);
                return {
                    ...rest, supplier: supplier ?? "", contractReferenceNumber: contractedRefNo, accountNumber: glAccountNumber
                };
            }
        );
        const newListCatalogue = requestFormRef?.current.values.addingItemFromList
            .concat(newSelectedCatalogues);
        setContracted(newListCatalogue.length > 0 ? newListCatalogue[0]?.contracted : false);
        requestFormRef?.current?.setFieldValue("addingItemFromList", newListCatalogue);
        setShowAddCatalogue(false);
        setSelectedCatalogue([]);
    };
    const handleAddForeCastToList = () => {
        const { suppliers } = raisePPRStates;
        const newSelectedForecasts = selectedForecast.map(
            ({
                glAccountNumber, supplierName, contractedRefNo, isNew, ...rest
            }) => {
                const supplier = suppliers.find((item) => item.companyName === supplierName);
                return {
                    ...rest, supplier: supplier ?? "", contractReferenceNumber: contractedRefNo, accountNumber: glAccountNumber
                };
            }
        );
        const newListCatalogue = requestFormRef?.current.values.addingItemFromList
            .concat(newSelectedForecasts);
        setContracted(newListCatalogue.length > 0 ? newListCatalogue[0]?.contracted : false);
        requestFormRef?.current?.setFieldValue("addingItemFromList", newListCatalogue);
        setShowAddForecast(false);
        setSelectedForecast([]);
    };
    const getTypeOfRequisitions = (permissions) => {
        const typeOfRequisitions = [];
        permissions.forEach((permission) => {
            if ([FEATURE.PPR].indexOf(permission.featureCode) > -1) {
                typeOfRequisitions.push({
                    label: permission.feature.featureName,
                    value: permission.feature.featureName
                });
            }
        });
        return typeOfRequisitions;
    };
    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const { status, data, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                return data;
            }
            showToast("error", message);
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return type === "array" ? [] : {};
    };
    const initData = async (setFieldValue) => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        try {
            if (pprRoles === PPR_ROLES.PPR_CREATOR
                && !isNullOrUndefinedOrEmpty(currentCompanyUUID)) {
                const responses = await Promise.allSettled([
                    ManageProjectService.getCompanyProjectList(currentCompanyUUID),
                    CurrenciesService.getCurrencies(currentCompanyUUID),
                    ExtVendorService.getExternalVendors(currentCompanyUUID),
                    ApprovalMatrixManagementService.getListApprovalMatrixFeature(
                        currentCompanyUUID,
                        { companyUuid: currentCompanyUUID, featureCode: FEATURE.PPR }
                    ),
                    AddressDataService.getCompanyAddresses(currentCompanyUUID),
                    UOMDataService.getUOMRecords(currentCompanyUUID),
                    CategoryService.getListCategory(currentCompanyUUID)
                ]);
                const [
                    responseProjects,
                    responseCurrencies,
                    responseSuppliers,
                    responseApprovalRoutes,
                    responseAddresses,
                    responseUOMs,
                    listCategoryResponse
                ] = responses;

                const listProject = getDataResponse(responseProjects).filter(
                    (project) => project.projectStatus === "FORECASTED"
                );
                const projects = sortArrayByName(listProject, "projectTitle");

                const listCurrencies = getDataResponse(responseCurrencies).filter(
                    (currency) => currency.active === true
                );
                const currencies = sortArrayByName(listCurrencies, "currencyName");

                currencies.forEach((item, index) => {
                    currencies[index].currencyName = `${item.currencyName} (+${item.currencyCode})`;
                });

                const listApprovalRoutes = getDataResponse(responseApprovalRoutes);

                const approvalRoutes = sortArrayByName(listApprovalRoutes, "approvalName");

                const listAddresses = getDataResponse(responseAddresses).filter(
                    (address) => address.active === true
                );
                const addresses = sortArrayByName(listAddresses, "addressLabel");

                const categories = getDataResponse(listCategoryResponse).filter(
                    (address) => address.active === true
                );
                const listCategory = sortArrayByName(categories, "categoryName");

                setFieldValue("deliveryAddressObject", addresses[0]);
                const permission = userPermission[permissionReducer.featureBasedOn];
                let typeOfRequisitions = [];
                let filtered = [];
                if (permission) {
                    typeOfRequisitions = getTypeOfRequisitions(permission.features);
                    const ids = typeOfRequisitions.map((value) => value.label);
                    filtered = typeOfRequisitions
                        .filter(({ label }, index) => !ids.includes(label, index + 1));
                }

                setRaisePPRStates((prevStates) => ({
                    ...prevStates,
                    typeOfRequisitions: filtered,
                    companyUuid: currentCompanyUUID,
                    projects,
                    currencies,
                    suppliers: getDataResponse(responseSuppliers),
                    approvalRoutes: approvalRoutes.filter((item) => item.active),
                    addresses,
                    responseUOMs: getDataResponse(responseUOMs),
                    listCategory,
                    isInit: true
                }));
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const onChangeTypeOfRequisition = async (e, setFieldValue) => {
        const { value } = e.target;
        setFieldValue("requisitionType", value);
        // Hold set ApprovalMatrixFor === value
    };
    const onChangeProject = async (e, setFieldValue) => {
        const { value } = e.target;
        setFieldValue("projectCode", value);
        setFieldValue("addingItemFromList", []);
        try {
            const response = await ProjectService.getProjectDetails(value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { projectAddressDto } = data;
                setFieldValue("deliveryAddress", projectAddressDto.addressLabel);
                setFieldValue("deliveryAddressObject", projectAddressDto);
                setFieldValue("currencyCode", data.currency);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const onChangeApprovalRoute = async (e, setFieldValue) => {
        const { value } = e.target;
        const { companyUuid } = raisePPRStates;
        setFieldValue("approvalRoute", value);
        try {
            const response = await ApprovalMatrixManagementService
                .getApprovalMatrixByApprovalUuid(companyUuid, value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { approvalRange } = data;
                let approvalSequence = "";
                approvalRange.forEach((approval, index) => {
                    const { approvalGroups } = approval;
                    if (index === 0) {
                        approvalSequence = approvalGroups[0].group.groupName;
                    } else {
                        approvalSequence += ` > ${approvalGroups[0].group.groupName}`;
                    }
                });
                setFieldValue("approvalSequenceValue", approvalSequence);
                if (pprStatus !== PPR_STATUS.RAISING_PPR) {
                    setFieldValue("approvalSequence", approvalSequence);
                }
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const onChangeDeliveryAddress = (e, setFieldValue) => {
        const { value } = e.target;
        setFieldValue("deliveryAddress", value);
        setFieldValue("deliveryAddressObject", raisePPRStates.addresses.filter((item) => item.addressLabel === value)[0]);
    };
    const onSavePressHandler = async (params, status) => {
        if (params.addingItemFromList.length === 0) {
            showToast("error", "Please enter valid Adding Of Items");
            return;
        }
        switch (status) {
        case PPR_SUBMIT_STATUS.CREATE:
        {
            createPPR(params);
            break;
        }
        case PPR_SUBMIT_STATUS.DRAFT:
        {
            saveDraftPPR(params);
            break;
        }
        case PPR_SUBMIT_STATUS.CANCELLED:
        {
            // refActionModalCancel.current.toggleModal();
            setDisplayCancelReason(true);
            break;
        }
        case PPR_SUBMIT_STATUS.APPROVE:
        {
            approvePPR();
            break;
        }
        case PPR_SUBMIT_STATUS.EDIT:
        {
            editPPR(params);
            break;
        }

        default:
            break;
        }
    };
    // eslint-disable-next-line consistent-return
    const buttonPendingApprovalState = (status, dirty, errors, values, handleSubmit) => {
        switch (status) {
        case PPR_STATUS.PENDING_APPROVAL:
        {
            if (pprRoles === PPR_ROLES.PPR_APPROVER) {
                return (
                    <>
                        {/* REJECT BUTTON */}
                        <Button
                            color="danger"
                            className="mr-3"
                            type="button"
                            label={t("Reject")}
                            onClick={() => setRaisePPRStates((prevStates) => ({
                                ...prevStates,
                                displayRejectReasonDialog: true
                            }))}
                        >
                            <span>{t("Reject")}</span>
                        </Button>
                        {/* SEND BACK BUTTON */}
                        <Button
                            color="warning"
                            className="mr-3"
                            type="button"
                            label={t("Send Back")}
                            onClick={() => setRaisePPRStates((prevStates) => ({
                                ...prevStates,
                                displaySendBackReasonDialog: true
                            }))}
                        >
                            <span>{t("Send Back")}</span>
                        </Button>
                        {/* APPROVE BUTTON */}
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Approve")}
                            onClick={() => {
                                console.log("Approve clicked");
                                approvePPR();
                            }}
                        >
                            <span>{t("Approve")}</span>
                        </Button>
                    </>
                );
            }
            if (pprRoles === PPR_ROLES.PURCHASER) return (<></>);

            if (isRecall && handleRolePermission?.write) {
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="submit"
                            label={t("Cancel")}
                            onClick={() => {
                                // refActionModalCancel.current.toggleModal();
                                setDisplayCancelReason(true);
                            }}
                        >
                            <span>{t("Cancel")}</span>
                        </Button>
                        {/* RECALL BUTTON */}
                        <Button
                            color="warning"
                            className="mr-3"
                            type="button"
                            label={t("Recall")}
                            onClick={() => {
                                console.log("Recall clicked");
                                refActionModalRecall.current.toggleModal();
                            }}
                        >
                            <span>{t("Recall")}</span>
                        </Button>
                    </>
                );
            }
            return null;
        }
        case PPR_STATUS.PENDING_SUBMISSION:
        {
            if (pprRoles === PPR_ROLES.PPR_CREATOR && handleRolePermission?.write) {
                return (
                    <>
                        {/* CANCEL PPR BUTTON */}
                        <Button
                            color="danger"
                            className="mr-3"
                            type="submit"
                            label={t("Cancel")}
                            onClick={() => {
                                // refActionModalCancel.current.toggleModal();
                                setDisplayCancelReason(true);
                            }}
                        >
                            <span>{t("Cancel")}</span>
                        </Button>
                        {/* SAVE AS DRAFT BUTTON */}
                        <Button
                            color="secondary"
                            className="mr-3"
                            type="button"
                            label={t("Save As Draft")}
                            onClick={() => {
                                handleSubmit();
                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onSavePressHandler(values, PPR_SUBMIT_STATUS.DRAFT);
                            }}
                        >
                            <span>{t("Save As Draft")}</span>
                        </Button>
                        {/* SUBMIT CREATE PPR BUTTON */}
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Submit")}
                            onClick={() => {
                                handleSubmit();
                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onSavePressHandler(values, PPR_SUBMIT_STATUS.CREATE);
                            }}
                        >
                            <span>{t("Submit")}</span>
                        </Button>
                    </>
                );
            }
            return null;
        }
        case (PPR_STATUS.RECALLED):
        {
            if (pprRoles === PPR_ROLES.PPR_CREATOR && handleRolePermission?.write) {
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="submit"
                            label={t("Cancel")}
                            onClick={() => {
                                // refActionModalCancel.current.toggleModal();
                                setDisplayCancelReason(true);
                            }}
                        >
                            <span>{t("Cancel")}</span>
                        </Button>
                        {/* SUBMIT PPR UNDER STATE RECALLED & SENT BACK */}
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Submit")}
                            onClick={() => {
                                handleSubmit();
                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onSavePressHandler(values, PPR_SUBMIT_STATUS.EDIT);
                            }}
                        >
                            <span>{t("Submit")}</span>
                        </Button>
                    </>
                );
            }
            return null;
        }
        case (PPR_STATUS.SENT_BACK):
        {
            if (pprRoles === PPR_ROLES.PPR_CREATOR && handleRolePermission?.write) {
                return (
                    <>
                        <Button
                            color="danger"
                            className="mr-3"
                            type="submit"
                            label={t("Cancel")}
                            onClick={() => {
                                // refActionModalCancel.current.toggleModal();
                                setDisplayCancelReason(true);
                            }}
                        >
                            <span>{t("Cancel")}</span>
                        </Button>
                        {/* SUBMIT PPR UNDER STATE RECALLED & SENT BACK */}
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Submit")}
                            onClick={() => {
                                handleSubmit();
                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onSavePressHandler(values, PPR_SUBMIT_STATUS.EDIT);
                            }}
                        >
                            <span>{t("Submit")}</span>
                        </Button>
                    </>
                );
            }
            return null;
        }
        case PPR_STATUS.CANCELLED: return null;
        case PPR_STATUS.REJECTED: return null;
        case PPR_STATUS.CONVERTED_TO_PR: return null;
        case PPR_STATUS.PENDING_CONVERSION_TO_PO: return null;
        case PPR_STATUS.PARTIALLY_CONVERTED_TO_PO: return null;
        case PPR_STATUS.CONVERTED_TO_PO: return null;
        case PPR_STATUS.APPROVED:
        {
            if (pprRoles === PPR_ROLES.PPR_CREATOR && handleRolePermission?.write) {
                return (
                    <>
                        {/* CANCEL BUTTON */}
                        <Button
                            color="danger"
                            className="mr-3"
                            type="submit"
                            label={t("Cancel")}
                            onClick={() => {
                                // refActionModalCancel.current.toggleModal();
                                setDisplayCancelReason(true);
                            }}
                        >
                            <span>{t("Cancel")}</span>
                        </Button>
                    </>
                );
            }
            return null;
        }
        default:
            if (handleRolePermission?.write) {
                return (
                    <>
                        {/* SAVE AS DRAFT BUTTON UNDER RAISE STATE */}
                        <Button
                            color="secondary"
                            className="mr-3"
                            type="button"
                            label={t("Save As Draft")}
                            onClick={() => {
                                handleSubmit();

                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onSavePressHandler(values, PPR_SUBMIT_STATUS.DRAFT);
                            }}
                        >
                            <span>{t("Save As Draft")}</span>
                        </Button>
                        {/* SUBMIT CREATE UNDER RAISE STATE */}
                        <Button
                            color="primary"
                            className="mr-3"
                            type="button"
                            label={t("Submit")}
                            onClick={() => {
                                handleSubmit();

                                if (!dirty || (dirty && Object.keys(errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onSavePressHandler(values, PPR_SUBMIT_STATUS.CREATE);
                            }}
                        >
                            <span>{t("Submit")}</span>
                        </Button>
                    </>
                );
            }
        }
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
                dateTime: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
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
            dateTime: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
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
        if (isInternal) {
            const { rowDataInternalAttachment } = raisePPRStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
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
            uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
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
    const handelDeleteFile = async (guid) => {
        try {
            const response = await EntitiesService.deleteDocuments(guid);
            if (response.data.status === "OK") {
                return true;
            }
            showToast("error", response.data.message);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return false;
    };
    const onAddAttachment = (event, uuid, rowData, isInternal) => {
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
    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setRaisePPRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const onCellEditingStopped = (params, isInternal) => {
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
    const convertAuditTrailRole = (value) => {
        switch (value) {
        case PPR_AUDIT_TRAIL_ROLE.SAVED_AS_DRAFT:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.SAVED_AS_DRAFT;
        }
        case PPR_AUDIT_TRAIL_ROLE.SUBMITTED:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.SUBMITTED;
        }
        case PPR_AUDIT_TRAIL_ROLE.RECALL:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.RECALL;
        }
        case PPR_AUDIT_TRAIL_ROLE.CANCEL:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.CANCEL;
        }
        case PPR_AUDIT_TRAIL_ROLE.SEND_BACK:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.SEND_BACK;
        }
        case PPR_AUDIT_TRAIL_ROLE.REJECT:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.REJECT;
        }
        case PPR_AUDIT_TRAIL_ROLE.APPROVED:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.APPROVED;
        }
        case PPR_AUDIT_TRAIL_ROLE.EDIT:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.EDIT;
        }
        default: return value;
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const pprUuid = query.get("uuid");
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID) && currentCompanyUUID !== "") {
            if (location.pathname.includes("create")) {
                setPPRRoles(PPR_ROLES.PPR_CREATOR);
                prefixStatus(currentCompanyUUID);
            } else if (!isNullOrUndefined(pprUuid)) {
                retrievePPRDetails(pprUuid, currentCompanyUUID);
            } else {
                const pprUuidError = t("Ops! Something went wrong with the UUID of this PPR details!");
                showToast("error", pprUuidError);
                history.goBack();
            }
        }
    }, [userPermission]);

    useEffect(() => {
        if (pprRoles === PPR_ROLES.PPR_CREATOR || pprRoles === null) {
            const editable = ![
                PPR_STATUS.CANCELLED,
                PPR_STATUS.REJECTED,
                PPR_STATUS.PENDING_APPROVAL,
                PPR_STATUS.APPROVED,
                PPR_STATUS.CONVERTED_TO_PR,
                PPR_STATUS.PENDING_CONVERSION_TO_PO,
                PPR_STATUS.PARTIALLY_CONVERTED_TO_PO,
                PPR_STATUS.CONVERTED_TO_PO
            ].includes(pprStatus);

            requestFormRef?.current?.setFieldValue("isEdit", editable);
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                isEdit: editable
            }));
        } else {
            requestFormRef?.current?.setFieldValue("isEdit", false);
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                isEdit: false
            }));
        }
        if (pprStatus === PPR_STATUS.PENDING_APPROVAL) {
            setRaisePPRStates((prevStates) => ({
                ...prevStates,
                isHandle: true
            }));
        }
        if (pprStatus === PPR_STATUS.PENDING_SUBMISSION
            || pprStatus === PPR_STATUS.RECALLED
            || pprStatus === PPR_STATUS.SENT_BACK) {
            requestFormRef?.current?.setFieldValue("requisitionType", "WORK");
        }
    }, [pprStatus, pprRoles]);

    const getDataFunc = async (query) => {
        try {
            const response = await CatalogueService.getCataloguesV2(
                UserService.getCurrentCompanyUuid(), query
            );
            return response?.data?.data;
        } catch (error) {
            showToast(
                "error",
                error.response
                    ? `getDataFunc: ${error.response.data.message}`
                    : `getDataFunc: ${error.message}`
            );
        }
        return [];
    };

    const backendServerConfigForecast = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc({
            ...query,
            project: requestFormRef?.current?.values?.projectCode
        })
    }), [requestFormRef?.current?.values?.projectCode]);

    const backendServerConfigCatalogue = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc(query)
    }), []);

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => {
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(userPermission)
                            && !_.isEmpty(pprRoles)
                        ) {
                            if (!values.requester) {
                                setFieldValue("requester", userDetails.name);
                            }
                            initData(setFieldValue);
                        }
                    }, [pprRoles, userDetails, userPermission]);

                    useEffect(() => {
                        if (raisePPRStates.isInit && values.isEdit) {
                            setDirty();
                        }
                        if (values.rowDataInternalAttachment || values.rowDataExternalAttachment) {
                            setRaisePPRStates((prevStates) => ({
                                ...prevStates,
                                rowDataInternalAttachment:
                                    values.rowDataInternalAttachment?.map((item) => ({
                                        guid: item.guid,
                                        fileLabel: item.fileName,
                                        fileDescription: item.description,
                                        uploadedBy: item.uploadBy,
                                        uploadedOn: convertToLocalTime(item.uploadOn)
                                    })),
                                rowDataExternalAttachment:
                                    values.rowDataExternalAttachment?.map((item) => ({
                                        guid: item.guid,
                                        fileLabel: item.fileName,
                                        fileDescription: item.description,
                                        uploadedBy: item.uploadBy,
                                        uploadedOn: convertToLocalTime(item.uploadOn)
                                    })),
                                rowDataAuditTrail: values.auditTrailDtoList?.map((item) => ({
                                    userName: item.userName,
                                    userRole: item.role,
                                    dateTime: convertToLocalTime(item.date),
                                    action: convertAuditTrailRole(item.action)
                                }))
                            }));
                        }
                    }, [values]);
                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            {pprStatus === PPR_STATUS.RAISING_PPR
                                                ? (
                                                    <div className="d-flex mb-4">
                                                        <h1 className="display-5 mr-3 mb-0 align-self-start">
                                                            {t("Raise Pre-Requisition")}
                                                        </h1>
                                                    </div>
                                                )
                                                : (
                                                    <div className="d-flex mb-4">
                                                        <h1 className="display-5 mr-3 mb-0 align-self-start">
                                                            {t("Pre-Requisition Details")}
                                                        </h1>
                                                    </div>
                                                )}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            {pprStatus === PPR_STATUS.RAISING_PPR && (
                                                <RaiseRequisitionComponent
                                                    t={t}
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    handleChange={handleChange}
                                                    setFieldValue={setFieldValue}
                                                    typeOfRequisitions={
                                                        raisePPRStates.typeOfRequisitions
                                                    }
                                                    natureOfRequisitions={
                                                        raisePPRStates.natureOfRequisitions
                                                    }
                                                    projects={raisePPRStates.projects}
                                                    onChangeTypeOfRequisition={
                                                        (e) => onChangeTypeOfRequisition(
                                                            e, setFieldValue
                                                        )
                                                    }
                                                    onChangeProject={
                                                        (e) => onChangeProject(e, setFieldValue)
                                                    }
                                                />
                                            )}

                                            <InitialSettingsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                suppliers={raisePPRStates.suppliers}
                                                currencies={raisePPRStates.currencies}
                                                projects={raisePPRStates.projects}
                                                pprStatus={pprStatus}
                                                enablePrefix={raisePPRStates.enablePrefix}
                                                handleRolePermission={handleRolePermission}
                                            />
                                        </Col>

                                        <Col md={6} lg={6}>
                                            <GeneralInformationComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={raisePPRStates.procurementTypes}
                                                approvalRoutes={raisePPRStates.approvalRoutes}
                                                onChangeApprovalRoute={
                                                    (e) => onChangeApprovalRoute(e, setFieldValue)
                                                }
                                                handleRolePermission={handleRolePermission}
                                            />
                                            <RequestTermsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={raisePPRStates.addresses}
                                                onChangeDeliveryAddress={
                                                    (e) => onChangeDeliveryAddress(e, setFieldValue)
                                                }
                                                handleRolePermission={handleRolePermission}
                                            />
                                        </Col>
                                    </Row>

                                </Col>
                            </Row>

                            <Row id="addingOfItems" className="mb-4">
                                <Col md={12} lg={12} className="mb-2">
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <HeaderSecondary title={t("Adding Of Items")} className="m-0" />
                                        </Col>

                                        <Col md={6} lg={6}>
                                            <ButtonToolbar className="justify-content-end">
                                                <Button
                                                    color="primary"
                                                    className="mr-1"
                                                    type="button"
                                                    onClick={() => {
                                                        if (!values.natureOfRequisition) {
                                                            setShowAddCatalogue(true);
                                                        } else {
                                                            setShowAddForecast(true);
                                                        }
                                                    }}
                                                    disabled={!values.isEdit}
                                                >
                                                    <span className="mr-1">+</span>
                                                    <span>{t("Add Catalogue")}</span>
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    type="button"
                                                    onClick={() => onAddManualItem()}
                                                    disabled={!values.isEdit || contracted}
                                                >
                                                    <span className="mr-1">+</span>
                                                    <span>{t("AddManual")}</span>
                                                </Button>
                                            </ButtonToolbar>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col md={12} lg={12}>
                                    <Accordion defaultExpanded className="accordion-border-head">
                                        <AccordionSummary
                                            expandIcon={<i className="pi pi-chevron-down" />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography>{t("Adding of Items")}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Col md={12} lg={12}>
                                                <AddingOfItemsComponent
                                                    t={t}
                                                    rowData={values.addingItemFromList}
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    gridRef={addingOfItemRef}
                                                    listAddress={raisePPRStates.addresses}
                                                    listCategory={raisePPRStates.listCategory}
                                                    uomList={raisePPRStates.responseUOMs}
                                                    suppliers={raisePPRStates.suppliers}
                                                    isEdit={raisePPRStates.isEdit}
                                                    setContracted={setContracted}
                                                    contracted={contracted}
                                                />
                                            </Col>
                                        </AccordionDetails>
                                    </Accordion>
                                </Col>
                            </Row>

                            <HeaderSecondary title={t("Conversations")} className="mb-2" />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    {/* Internal Conversations */}
                                    <Conversation
                                        title={t("InternalConversations")}
                                        activeTab={raisePPRStates.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setRaisePPRStates((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        sendConversation={
                                            (comment) => sendCommentConversation(comment, true)
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(true)}
                                        rowDataConversation={
                                            raisePPRStates.rowDataInternalConversation
                                        }
                                        rowDataAttachment={
                                            raisePPRStates.rowDataInternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, true
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => onAddAttachment(
                                                e, uuid, rowData, true
                                            )
                                        }
                                        onCellEditingStopped={
                                            (params) => onCellEditingStopped(params, true)
                                        }
                                        defaultExpanded
                                        disabled={(!values.isEdit && !raisePPRStates.isHandle)
                                            || (pprRoles === PPR_ROLES.PPR_CREATOR
                                                && pprStatus === PPR_STATUS.PENDING_APPROVAL)
                                            || (
                                                !handleRolePermission?.write
                                                && !handleRolePermission?.approve
                                            )}
                                    />
                                </Col>
                            </Row>
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
                                        sendConversation={
                                            (comment) => sendCommentConversation(comment, false)
                                        }
                                        addNewRowAttachment={
                                            () => addNewRowAttachment(false)
                                        }
                                        rowDataConversation={
                                            raisePPRStates.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            raisePPRStates.rowDataExternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, false
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => onAddAttachment(
                                                e, uuid, rowData, false
                                            )
                                        }
                                        onCellEditingStopped={
                                            (params) => onCellEditingStopped(params, false)
                                        }
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled={(!values.isEdit && !raisePPRStates.isHandle)
                                            || (pprRoles === PPR_ROLES.PPR_CREATOR
                                                && pprStatus === PPR_STATUS.PENDING_APPROVAL)
                                            || (
                                                !handleRolePermission?.write
                                                && !handleRolePermission?.approve
                                            )}
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary title={t("AuditTrail")} className="mb-2" />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail */}
                                    <AuditTrail
                                        rowData={raisePPRStates.rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>
                            <AddItemDialog
                                isShow={showAddCatalogue}
                                onHide={() => setShowAddCatalogue(false)}
                                title={t("Catalogue Items")}
                                onPositiveAction={() => { handleAddCatalogueToList(); }}
                                onNegativeAction={() => {
                                    setShowAddCatalogue(false);
                                    setSelectedCatalogue([]);
                                }}
                                columnDefs={CatalogueItemColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    handleSelectedItemCatalogue(params.api.getSelectedNodes());
                                    params.api.redrawRows();
                                }}
                                pageSize={10}
                                selected={requestFormRef?.current?.values?.addingItemFromList.concat(selectedCatalogue)}
                                backendPagination
                                backendServerConfig={backendServerConfigCatalogue}
                            />
                            <AddItemDialog
                                isShow={showAddForecast}
                                onHide={() => setShowAddForecast(false)}
                                title={t("Catalogue Items")}
                                onPositiveAction={() => { handleAddForeCastToList(); }}
                                onNegativeAction={() => {
                                    setShowAddForecast(false);
                                    setSelectedForecast([]);
                                }}
                                columnDefs={ForecastItemColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    handleSelectedItemForecast(params.api.getSelectedNodes());
                                    params.api.redrawRows();
                                }}
                                pageSize={10}
                                selected={requestFormRef?.current?.values?.addingItemFromList.concat(selectedForecast)}
                                backendPagination
                                backendServerConfig={backendServerConfigForecast}
                            />

                            <CommonConfirmDialog
                                isShow={raisePPRStates.displaySendBackReasonDialog}
                                onHide={() => setRaisePPRStates((prevStates) => ({
                                    ...prevStates,
                                    displaySendBackReasonDialog: false
                                }))}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => {
                                            sendBackPPR(raisePPRStates.reasonSendBack);
                                        },
                                        contentPositive: t("SendBack"),
                                        colorPositive: "warning"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => setRaisePPRStates((prevStates) => ({
                                            ...prevStates,
                                            displaySendBackReasonDialog: false
                                        })),
                                        contentNegative: t("Close"),
                                        colorNegative: "secondary"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            >
                                <Input
                                    type="textarea"
                                    rows={5}
                                    name="sendBackReason"
                                    className={
                                        classNames("form-control", {
                                            "is-invalid": raisePPRStates.showErrorReasonSendBack && !raisePPRStates.reasonSendBack
                                        })
                                    }
                                    placeholder={t("Please enter reason...")}
                                    value={raisePPRStates.reasonSendBack}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setRaisePPRStates((prevStates) => ({
                                            ...prevStates,
                                            reasonSendBack: value
                                        }));
                                    }}
                                />
                                {
                                    raisePPRStates.showErrorReasonSendBack
                                    && !raisePPRStates.reasonSendBack
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            <CommonConfirmDialog
                                isShow={raisePPRStates.displayRejectReasonDialog}
                                onHide={() => setRaisePPRStates((prevStates) => ({
                                    ...prevStates,
                                    displayRejectReasonDialog: false
                                }))}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => {
                                            rejectPPR(raisePPRStates.reasonReject);
                                        },
                                        contentPositive: t("Reject"),
                                        colorPositive: "danger"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => setRaisePPRStates((prevStates) => ({
                                            ...prevStates,
                                            displayRejectReasonDialog: false
                                        })),
                                        contentNegative: t("Close"),
                                        colorNegative: "secondary"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            >
                                <Input
                                    type="textarea"
                                    rows={5}
                                    name="rejectReason"
                                    className={
                                        classNames("form-control", {
                                            "is-invalid": raisePPRStates.showErrorReasonReject && !raisePPRStates.reasonReject
                                        })
                                    }
                                    placeholder={t("Please enter reason..")}
                                    value={raisePPRStates.reasonReject}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setRaisePPRStates((prevStates) => ({
                                            ...prevStates,
                                            reasonReject: value
                                        }));
                                    }}
                                />
                                {
                                    raisePPRStates.showErrorReasonReject
                                    && !raisePPRStates.reasonReject
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            <CommonConfirmDialog
                                isShow={displayCancelReason}
                                onHide={() => setDisplayCancelReason(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => {
                                            cancelPPR(requestFormRef?.current?.values.pprUuid, reasonCancel);
                                        },
                                        contentPositive: t("Cancel"),
                                        colorPositive: "danger"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => setDisplayCancelReason(false),
                                        contentNegative: t("Close"),
                                        colorNegative: "secondary"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            >
                                <Input
                                    type="textarea"
                                    rows={5}
                                    name="reasonCancel"
                                    className={
                                        classNames("form-control", {
                                            "is-invalid": showErrorReasonCancel && !reasonCancel
                                        })
                                    }
                                    placeholder={t("Please enter reason..")}
                                    value={reasonCancel}
                                    onChange={(e) => setReasonCancel(e?.target?.value)}
                                />
                                {
                                    showErrorReasonCancel && !reasonCancel
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    <Row className="mx-0">
                                        {buttonPendingApprovalState(
                                            pprStatus, dirty, errors, values, handleSubmit
                                        )}
                                    </Row>
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
            {/* <ActionModal
                ref={refActionModalCancel}
                title="Cancel Request"
                body="Do you wish to cancel this request?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => cancelPPR(requestFormRef?.current?.values.pprUuid)}
            /> */}
            <ActionModal
                ref={refActionModalRecall}
                title="Recall Request"
                body="Do you wish to recall this request?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => recallPPR()}
            />
            {Prompt}
        </Container>
    );
};

export default RaisePreRequisitions;
