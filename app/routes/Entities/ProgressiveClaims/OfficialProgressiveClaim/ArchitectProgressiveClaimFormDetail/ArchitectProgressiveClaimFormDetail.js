/* eslint-disable max-len */
import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    Button,
    Col,
    Container,
    Form,
    Row,
    Input
} from "components";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useToast from "routes/hooks/useToast";
import { Formik } from "formik";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import StickyFooter from "components/StickyFooter";
import { HeaderMain } from "routes/components/HeaderMain";
import URL_CONFIG from "services/urlConfig";
import {
    AuditTrail,
    Conversation,
    CommonConfirmDialog
} from "routes/components";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import i18next from "i18next";
import ConversationService from "services/ConversationService/ConversationService";
import { PPR_AUDIT_TRAIL_ROLE, PPR_AUDIT_TRAIL_ROLE_CONVERT } from "helper/purchasePreRequisitionConstants";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import moment from "moment";
import { OfficialProgressiveClaimService } from "services/OfficialProgressiveClaimService";
import { FEATURE } from "helper/constantsDefined";
import {
    ACE_ACTION,
    initialValues
} from "../Helper";
import WorkSpace from "./components/WorkSpace";
import ProgressPaymentInformation from "./components/ProgressPaymentInformation";
import PaymentClaimHistory from "./components/PaymentClaimHistory";
import SummaryDetails from "./components/SummaryDetails";
import GeneralInformation from "./components/GeneralInformation";
import VendorInformation from "./components/VendorInformation";
import InitialSetting from "./components/InitialSetting";
import ClaimDetail from "./components/ClaimDetail";
import OriginalOrder from "./components/OriginalOrder";
import UnfixedGoodsAndMaterials from "./components/UnfixedGoodsAndMaterials";
import CertificationDetails from "./components/CertificationDetails";
import ArchitectCertificateDetails from "./components/ArchitectCertificateDetails";
import {
    convertToLocalTime,
    formatDateString,
    getCurrentCompanyUUIDByStore,
    sortArrayByName,
    convertDate2String
} from "../../../../../helper/utilities";
import UOMDataService from "../../../../../services/UOMService";
import UserService from "../../../../../services/UserService";
import CUSTOM_CONSTANTS, {
    RESPONSE_STATUS
} from "../../../../../helper/constantsDefined";
import Retention from "./components/Retention";
import EntitiesService from "../../../../../services/EntitiesService";
import GroupButtonByStatus
    from "./components/GroupButtonByStatus";
import { ACE_STATUS } from "../Helper";
import {
    INVOICE_ROUTES
} from "../../../../P2P/Invoice";

const convertAuditTrailRole = (value) => {
    switch (value) {
    case PPR_AUDIT_TRAIL_ROLE.SAVED_AS_DRAFT: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.SAVED_AS_DRAFT;
    }
    case PPR_AUDIT_TRAIL_ROLE.SUBMITTED: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.SUBMITTED;
    }
    case PPR_AUDIT_TRAIL_ROLE.RECALL: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.RECALL;
    }
    case PPR_AUDIT_TRAIL_ROLE.CANCEL: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.CANCEL;
    }
    case PPR_AUDIT_TRAIL_ROLE.SEND_BACK: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.SEND_BACK;
    }
    case PPR_AUDIT_TRAIL_ROLE.REJECT: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.REJECT;
    }
    case PPR_AUDIT_TRAIL_ROLE.APPROVED: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.APPROVED;
    }
    case PPR_AUDIT_TRAIL_ROLE.EDIT: {
        return PPR_AUDIT_TRAIL_ROLE_CONVERT.EDIT;
    }
    default:
        return value.replace(/_/g, " ");
    }
};
export default function ArchitectProgressiveClaimFormDetail() {
    const { t } = useTranslation();
    const history = useHistory();
    const showToast = useToast();
    const requestFormRef = useRef(null);
    const paramsPage = useParams();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const isInit = useRef("");
    const originalOrderRef = useRef();
    const unfixedGoodsRef = useRef();
    const architectCertify = useRef();

    const [aceOfficialClaim, setAceOfficialClaim] = useState({
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
        rowDataWorkSpace: [],
        rowDataOriginalOrder: [],
        rowDataUnfixedGoods: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        selectedCatalogueItems: [],
        selectedForecastItems: [],
        selectedContactItems: [],
        externalConversationLines: [],
        internalConversationLines: [],
        users: [],
        workSpaceSummaryMainWork: 0,
        workSpaceSummaryVariation: 0,
        removeDocumentUuids: []
    });
    const [aceOfficialClaimDetail, setAceOfficialClaimDetail] = useState();
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const getUuid = (item = {}) => item.uuid || item.itemUuid;
    const initialDialogConfig = {
        isShow: false,
        title: "",
        isTextArea: false,
        textAreaPlaceholder: t("Please enter reason.."),
        contentPositive: t("Confirm"),
        colorPositive: "primary",
        contentNegative: t("Close"),
        colorNegative: "secondary",
        titleRequired: false,
        validateForm: false,
        onPositiveAction: () => null
    };

    const itemSchema = Yup.object().shape({

        claimDate: Yup.string()
            .required(i18next.t("PleaseSelectValidClaimDate")),
        approvalRouteUuid: Yup.string()
            .test(
                "approvalRouteUuid",
                i18next.t("PleaseSelectValidApprovalRoute"),
                (value, testContext) => {
                    const dom = document.getElementById("approvalRouteUuid");
                    return !(dom && !value); //  false => show message
                }
            ).nullable(true),
        paymentClaimReferenceNo: Yup.string()
            .required(i18next.t("PleaseEnterValidPaymentClaimReferenceNo")),
        paymentClaimReferenceMonth: Yup.string()
            .required(i18next.t("PleaseSelectValidPaymentClaimReferenceMonth"))

    });

    const [displaDialogConfig, setDisplayDialogConfig] = useState(initialDialogConfig);
    const reasonInputRef = useRef(null);

    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const {
                status,
                data,
                message
            } = value && value.data;
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

    const getPCDetail = async (currentCompanyUUID, uuid, isBuyer) => {
        try {
            const draftDetail = await OfficialProgressiveClaimService
                .getArchitectProgressiveClaimDetail(currentCompanyUUID, uuid, isBuyer);
            setAceOfficialClaimDetail(draftDetail.data.data);
            console.log("draftDetail", draftDetail);
        } catch (error) {
            console.log(error);
            showToast("error", error.message ? error.message : error.response.data.message);
        }
    };

    const getArchitects = () => {
        const consultants = aceOfficialClaimDetail.aceWorkSpaceDto?.consultants || [];
        return consultants.filter((item) => item.role === "ARCHITECT");
    };

    const getQuantitySurveyors = () => {
        const consultants = aceOfficialClaimDetail.aceWorkSpaceDto?.consultants || [];
        return consultants.filter((item) => item.role === "MAIN_QS");
    };

    const loadOfficialClaimData = async (setValues) => {
        if (aceOfficialClaimDetail) {
            const companyUuid = permissionReducer.currentCompany?.companyUuid;
            const isBuyer = permissionReducer?.isBuyer;

            let rowDataWorkSpace = [];
            rowDataWorkSpace = await OfficialProgressiveClaimService.getListChildOriginalOrder(isBuyer, companyUuid, paramsPage.uuid, 0);
            rowDataWorkSpace = sortArrayByName(rowDataWorkSpace?.data?.data, "groupNumber");

            let rowDataUnfixedGoods = aceOfficialClaimDetail.aceWorkSpaceDto?.unfixedItems || [];
            rowDataWorkSpace = rowDataWorkSpace.map((workSpace) => {
                const item = workSpace;
                const groupTreeNumber = [];
                const groupNumber = item.groupNumber.split(".");
                for (let i = 0; i < groupNumber.length; i++) {
                    if (i) {
                        groupTreeNumber.push(`${groupNumber[i - 1]}.${groupNumber[i]}`);
                    } else {
                        groupTreeNumber.push(groupNumber[i]);
                    }
                }
                console.log("groupTreeNumber", groupTreeNumber);
                return {
                    ...item,
                    groupNumber: groupTreeNumber
                };
            });
            rowDataUnfixedGoods = rowDataUnfixedGoods.map((unfixedItem) => {
                const item = unfixedItem;
                const groupTreeNumber = [];
                const groupNumber = item.groupNumber.split(".");
                for (let i = 0; i < groupNumber.length; i++) {
                    if (i) {
                        groupTreeNumber.push(`${groupTreeNumber[i - 1]}.${groupNumber[i]}`);
                    } else {
                        groupTreeNumber.push(groupNumber[i]);
                    }
                }
                return {
                    ...item,
                    groupNumber: groupTreeNumber
                };
            });
            const rowDataAuditTrail = aceOfficialClaimDetail.aceAuditTrailDtoList?.map(
                ({
                    action,
                    role,
                    date,
                    ...rest
                }) => ({
                    userRole: role,
                    dateTime: convertToLocalTime(date),
                    action: convertAuditTrailRole(action),
                    ...rest
                })
            );
            const quantitySurveyors = getQuantitySurveyors();
            const architects = getArchitects();

            // ================= get conversations ============================

            const rowDataInternalAttachment = (aceOfficialClaimDetail.pcDocumentMetadataList || [])
                .filter((item) => item.externalDocument === false);
            const rowDataExternalAttachment = (aceOfficialClaimDetail.pcDocumentMetadataList || [])
                .filter((item) => item.externalDocument === true);
            const responses = await Promise.allSettled([
                ConversationService.getDetailExternalConversation(
                    companyUuid, paramsPage.uuid
                ),
                ConversationService.getDetailInternalConversation(
                    companyUuid, paramsPage.uuid
                )
            ]);

            const [responseDetailInternalConversation, responseDetailExternalConversation] = responses;
            const resExternalConversation = getDataResponse(responseDetailInternalConversation, "object");
            const resInternalConversation = getDataResponse(responseDetailExternalConversation, "object");

            const rowDataExternalConversation = [...aceOfficialClaim.rowDataExternalConversation];

            if (resExternalConversation && Object.keys(resExternalConversation).length) {
                const { conversations } = resExternalConversation;
                conversations.forEach((item) => {
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
            const rowDataInternalConversation = [...aceOfficialClaim.rowDataInternalConversation];
            if (resInternalConversation && Object.keys(resInternalConversation).length) {
                const { conversations } = resInternalConversation;
                conversations.forEach((item) => {
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
            }
            //= ============ end get conversations================
            let approvalRoutes = [];
            if ([
                ACE_STATUS.PENDING_ARCHITECT_REVIEW
            ].includes(aceOfficialClaimDetail.aceStatus)) {
                const responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                    companyUuid,
                    FEATURE.DPC
                );
                approvalRoutes = responseApprovalRoutes.data.data || [];
                approvalRoutes = approvalRoutes.filter((item) => item.active);
            }

            setAceOfficialClaim((prevState) => ({
                ...prevState,
                loading: true,
                rowDataUnfixedGoods,
                rowDataOriginalOrder: rowDataWorkSpace,
                rowDataExternalConversation,
                rowDataInternalConversation,
                rowDataAuditTrail,
                rowDataInternalAttachment,
                rowDataExternalAttachment,
                approvalRoutes
            }));

            console.log("aceOfficialClaimDetail", aceOfficialClaimDetail);
            console.log("permissionReducer", permissionReducer);
            const workSpace = aceOfficialClaimDetail.aceWorkSpaceDto || {};
            const personalInformation = permissionReducer.isBuyer ? aceOfficialClaimDetail.supplierInformation : aceOfficialClaimDetail.buyerInformation;
            console.log("personalInformation", personalInformation);
            const initValues = {
                ...initialValues,
                approvalRouteSequence: aceOfficialClaimDetail.approvalRouteSequence,
                approvalRouteUuid: aceOfficialClaimDetail.approvalRouteUuid,
                approvalRouteName: aceOfficialClaimDetail.approvalRouteName,
                invoiceStatus: aceOfficialClaimDetail.invoiceStatus,
                isESignRouting: aceOfficialClaimDetail.isESignRouting || false,
                dpcNumber: aceOfficialClaimDetail.dpcNumber,
                pcNumber: aceOfficialClaimDetail.pcNumber,
                dwoNumber: aceOfficialClaimDetail.dwoNumber,
                dpcStatus: aceOfficialClaimDetail.dpcStatus,
                pcStatus: aceOfficialClaimDetail.pcStatus,
                aceStatus: aceOfficialClaimDetail.aceStatus,
                developerProgressClaimNo: aceOfficialClaimDetail.developerProgressClaimNo,

                vendorCode: personalInformation?.vendorCode || "",
                vendorName: personalInformation?.vendorName || "",
                vendorUuid: personalInformation?.vendorUuid || "",
                contactName: personalInformation?.contactName || "",
                contactEmail: personalInformation?.contactEmail || "",
                contactNumber: personalInformation?.contactNumber || "",
                countryName: personalInformation?.countryName || "",
                countryCode: personalInformation?.countryCode || "",
                companyRegistrationNo: personalInformation?.companyRegistrationNo || "",

                cumulativeAgreedVariationOrder: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeAgreedVariationOrder,
                cumulativeCertAgreedVarOrder: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeCertAgreedVarOrder,
                cumulativeCertMainconWorks: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeCertMainconWorks,
                cumulativeCertUnfixedGoodsMaterials: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeCertUnfixedGoodsMaterials,
                cumulativeCertified: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeCertified,
                cumulativeClaimed: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeClaimed,
                cumulativeMainConWorks: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeMainConWorks,
                cumulativeUnfixedGoodsAndMaterials: aceOfficialClaimDetail.aceWorkSpaceDto?.cumulativeUnfixedGoodsAndMaterials,
                retentionCumulativeWorkDone: aceOfficialClaimDetail.aceWorkSpaceDto?.retentionCumulativeWorkDone,
                lessFinalRetentionAmnt: aceOfficialClaimDetail.aceWorkSpaceDto?.lessFinalRetentionAmnt,
                addCertRetentionWorkDone: aceOfficialClaimDetail.aceWorkSpaceDto?.addCertRetentionWorkDone,
                lessPrevCumulPayments: aceOfficialClaimDetail.aceWorkSpaceDto?.lessPrevCumulPayments,
                amntCertPayments: aceOfficialClaimDetail.aceWorkSpaceDto?.amntCertPayments,

                paymentClaimReferenceNo: aceOfficialClaimDetail.paymentClaimReferenceNo,
                paymentClaimReferenceMonth: aceOfficialClaimDetail.paymentClaimReferenceMonth ? aceOfficialClaimDetail.paymentClaimReferenceMonth : "",
                paymentClaimHistoryList: aceOfficialClaimDetail.paymentClaimHistoryList,
                claimPeriodStartDate: aceOfficialClaimDetail.claimPeriodStartDate ? moment(aceOfficialClaimDetail.claimPeriodStartDate).format(CUSTOM_CONSTANTS.DDMMYYYY) : null,
                claimPeriodEndDate: aceOfficialClaimDetail.claimPeriodEndDate ? moment(aceOfficialClaimDetail.claimPeriodEndDate).format(CUSTOM_CONSTANTS.DDMMYYYY) : null,
                workOrderTitle: aceOfficialClaimDetail.workOrderTitle,
                contractType: aceOfficialClaimDetail.aceWorkSpaceDto?.contractType || "",
                paymentResponseReferenceNo: aceOfficialClaimDetail.paymentResponseReferenceNo,
                claimDate: aceOfficialClaimDetail.claimDate ? convertToLocalTime(aceOfficialClaimDetail.claimDate, CUSTOM_CONSTANTS.YYYYMMDD) : formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                originalContractSum: aceOfficialClaimDetail.aceWorkSpaceDto?.originalContractSum,
                bqContingencySum: aceOfficialClaimDetail.aceWorkSpaceDto?.bqContingencySum,
                remeasuredContractSum: aceOfficialClaimDetail.aceWorkSpaceDto?.remeasuredContractSum,
                agreedVariationOrderSum: aceOfficialClaimDetail.aceWorkSpaceDto?.agreedVariationOrderSum,
                adjustedContractSum: aceOfficialClaimDetail.aceWorkSpaceDto?.adjustedContractSum,
                retentionPercentage: aceOfficialClaimDetail.aceWorkSpaceDto?.retentionPercentage,
                includeVariation: aceOfficialClaimDetail.aceWorkSpaceDto?.includeVariation,
                retentionCappedPercentage: aceOfficialClaimDetail.aceWorkSpaceDto?.retentionCappedPercentage,
                retentionAmountCappedAt: aceOfficialClaimDetail.aceWorkSpaceDto?.retentionAmountCappedAt,
                quantitySurveyors,
                architects,
                currencyCode: workSpace.currencyCode,
                project: workSpace.project,
                projectCode: workSpace.projectCode,
                tradeCode: workSpace.tradeCode,
                tradeTitle: workSpace.tradeTitle

            };
            setValues(initValues);
        }
    };
    const initData = async () => {
        try {
            const companyUuid = permissionReducer.currentCompany?.companyUuid;
            if (companyUuid) {
                const responses = await Promise.allSettled([
                    UOMDataService.getUOMRecords(companyUuid),
                    UserService.getCompanyUsers(companyUuid)
                    // ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                    //     companyUuid, "DPC"
                    // )
                ]);

                const [
                    responseUOMs,
                    responseCompanyUsers
                    // responseApprovalRoutes
                ] = responses;
                // let approvalRoutes = getDataResponse(responseApprovalRoutes) || [];
                // approvalRoutes = approvalRoutes.filter((item) => item.active);

                setAceOfficialClaim((prevState) => ({
                    ...prevState,
                    uoms: getDataResponse(responseUOMs),
                    users: getDataResponse(responseCompanyUsers)
                    // approvalRoutes
                }));
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const getRootChildren = (rowData = [], itemParent = {}) => {
        const children = [];
        const groupNumber = itemParent.groupNumber.at(-1);
        rowData.forEach((element) => {
            if (
                element.groupNumber.length
                === itemParent.groupNumber.length + 1
                && element.groupNumber.at(itemParent.groupNumber.length - 1) === groupNumber
            ) {
                children.push(element);
            }
        });
        return children;
    };
    const addOriginalOrderChildItem = async (parentNode, rowData, gridAPI) => {
        try {
            const { groupNumber } = parentNode;
            const currentLevelStr = groupNumber.at(-1);
            const childrenItems = getRootChildren(rowData, parentNode);
            let newGroupNumberItem = `${currentLevelStr}.1`;
            if (childrenItems.length) {
                const lastChild = childrenItems[childrenItems.length - 1];
                const groupNumberLastChild = lastChild.groupNumber.at(-1);
                const tempArray = groupNumberLastChild?.split(".") || [];
                const number = Number(tempArray[tempArray.length - 1]);
                newGroupNumberItem = `${currentLevelStr}.${number + 1}`;
            }
            // update data parent item when have child item
            const uuild = uuidv4();
            const item = {
                uuid: uuild,
                itemUuid: uuild,
                workCode: "",
                remarks: "",
                description: "",
                weightage: null,
                uom: null,
                retention: parentNode.retention,
                retentionPercentage: null,
                quantity: null,
                unitPrice: null,
                totalAmount: null,
                groupNumber: [...groupNumber, newGroupNumberItem],
                groupName: newGroupNumberItem,
                parentGroup: currentLevelStr,
                evaluators: null,
                draftItem: true
            };
            gridAPI?.originalItem?.applyTransaction({
                add: [item],
                addIndex: null
            });
            // setAceOfficialClaim((prevStates) => ({
            //     ...prevStates,
            //     rowDataOriginalOrder: [...rowData, item]
            // }));
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message);
        }
    };

    const onExpandOriginalOrder = async (parentNode, rowData, gridAPI) => {
        try {
            const companyUuid = permissionReducer.currentCompany?.companyUuid;
            const isBuyer = permissionReducer?.isBuyer;

            const { data } = await OfficialProgressiveClaimService.getArchitectListChildOriginalOrder(
                isBuyer,
                companyUuid,
                paramsPage.uuid,
                parentNode.itemUuid
            );
            let itemChild = sortArrayByName(data?.data, "groupNumber");
            itemChild = itemChild.map((item) => ({
                ...item,
                groupNumber: [...parentNode.groupNumber, item.groupNumber]
            }));
            setAceOfficialClaim((prevStates) => ({
                ...prevStates,
                rowDataOriginalOrder: [...rowData, ...itemChild]
            }));
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message);
        }
    };

    // ===action converstation===//

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

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = aceOfficialClaim;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setAceOfficialClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = aceOfficialClaim;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setAceOfficialClaim((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
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
                            attachment: result.fileLabel,
                            fileLabel: result.fileLabel
                        };
                    }
                });
                setAceOfficialClaim((prevStates) => ({
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
                        attachment: result.fileLabel,
                        fileLabel: result.fileLabel
                    };
                }
            });
            setAceOfficialClaim((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        const removeDocumentUuids = !aceOfficialClaim.removeDocumentUuids.includes(rowDeleted.guid) && aceOfficialClaim.removeDocumentUuids.push(rowDeleted.guid);
        if (isInternal) {
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setAceOfficialClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData,
                removeDocumentUuids
            }));
            return;
        }
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setAceOfficialClaim((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData,
            removeDocumentUuids
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = aceOfficialClaim;
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
            setAceOfficialClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = aceOfficialClaim;
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
        setAceOfficialClaim((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...aceOfficialClaim.internalConversationLines];
            const { rowDataInternalConversation } = aceOfficialClaim;
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
            setAceOfficialClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = aceOfficialClaim;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...aceOfficialClaim.externalConversationLines];
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
        setAceOfficialClaim((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    // ===end action converstation===//

    const deleteOriginalOrderItem = (uuid, rowNodes, gridAPI) => {
        const rowData = rowNodes.map((item) => item.data);
        const deletedItem = rowData.find((item) => getUuid(item) === uuid);
        if (deletedItem) {
            const { groupName } = deletedItem;
            const maxLengthGroup = deletedItem.groupNumber.length;
            let removeDeleted = rowData.filter((item) => item.groupNumber.length > maxLengthGroup && item.groupNumber.includes(groupName));
            removeDeleted = removeDeleted.map((item) => item.groupName);
            removeDeleted.push(groupName);
            const filteredRowNodes = rowData.filter((item) => removeDeleted.includes(item.groupName));
            gridAPI?.originalItem?.applyTransaction({ remove: filteredRowNodes });
        }
    };

    const loadWorkSpaceTotalAmount = async (totalAmount) => {
        const totalContractAmount = Number(totalAmount)
            + Number(aceOfficialClaim.workSpaceSummaryVariation);
        const rowDataWorkSpaceSummary = [
            {
                groupNumber: ["Total [Excl GST]"],
                weightage: 100,
                amount: totalContractAmount,
                currencyCode: aceOfficialClaimDetail?.aceWorkSpaceDto?.currencyCode || ""
            },
            {
                groupNumber: ["Total [Excl GST]", "A. Main-Con Works"],
                weightage: ((Number(totalAmount) / totalContractAmount) * 100).toFixed(2),
                amount: totalAmount,
                currencyCode: aceOfficialClaimDetail?.aceWorkSpaceDto?.currencyCode || ""
            },
            {
                groupNumber: ["Total [Excl GST]", "B. Agreed Variation Order"],
                weightage:
                    ((Number(aceOfficialClaim.workSpaceSummaryVariation) / totalContractAmount) * 100)
                        .toFixed(2),
                amount: aceOfficialClaim.workSpaceSummaryVariation,
                currencyCode: aceOfficialClaimDetail?.aceWorkSpaceDto?.currencyCode || ""
            }
        ];
        setAceOfficialClaim((prevState) => ({
            ...prevState,
            rowDataWorkSpace: rowDataWorkSpaceSummary
        }));
    };

    const addUnfixedGoodsItemManual = (gridAPI, rowData) => {
        let item = null;
        const rootItems = rowData
            .filter((x) => x.groupNumber && x.groupNumber.length === 1);
        const uuid = uuidv4();
        item = {
            groupNumber: [`${rootItems.length + 1}`],
            groupName: `${rootItems.length + 1}`,
            uuid,
            workCode: "",
            description: "",
            uom: null,
            deliveryOrder: "",
            deliveryOrderDate: "",
            attachment: "",
            mainConClaimQty: null,
            mainConClaimUnitPrice: null,
            mainConClaimTotalAmount: null,
            mainConClaimRemarks: null,
            retention: null,
            cetifiedQty: null,
            cetifiedUnitPrice: null,
            cetifiedTotalAmount: null,
            cetifiedRemarks: null,
            ufgmUuid: uuid,
            ufgmParentUuid: null,
            itemChildren: null,
            draftItem: true,
            quantitySurveyors: getQuantitySurveyors(),
            aceStatus: aceOfficialClaimDetail?.aceStatus
        };
        gridAPI?.items?.applyTransaction({
            add: [item],
            addIndex: null
        });
        setAceOfficialClaim((prevStates) => ({
            ...prevStates,
            rowDataUnfixedGoods: [...rowData, item]
        }));
    };

    const addUnfixedGoodsChildItem = async (parentNode, rowData, gridAPI) => {
        try {
            const { groupNumber } = parentNode;
            const currentLevelStr = groupNumber.at(-1);
            const childrenItems = getRootChildren(rowData, parentNode);

            let newGroupNumberItem = `${currentLevelStr}.1`;
            if (childrenItems.length) {
                const lastChild = childrenItems[childrenItems.length - 1];
                const groupNumberLastChild = lastChild.groupNumber.at(-1);
                const tempArray = groupNumberLastChild?.split(".") || [];
                const number = Number(tempArray[tempArray.length - 1]);
                newGroupNumberItem = `${currentLevelStr}.${number + 1}`;
            }
            // update data parent item when have child item
            const uuid = uuidv4();
            const item = {
                groupNumber: [...groupNumber, newGroupNumberItem],
                uuid,
                workCode: "",
                description: "",
                uom: null,
                deliveryOrder: "",
                deliveryOrderDate: "",
                attachment: "",
                mainConClaimQty: null,
                mainConClaimUnitPrice: null,
                mainConClaimTotalAmount: null,
                mainConClaimRemarks: null,
                retention: null,
                cetifiedQty: null,
                cetifiedUnitPrice: null,
                cetifiedTotalAmount: null,
                cetifiedRemarks: null,
                ufgmUuid: uuid,
                ufgmParentUuid: parentNode.uuid,
                itemChildren: null,
                draftItem: true,
                groupName: newGroupNumberItem,
                parentGroup: currentLevelStr,
                aceStatus: aceOfficialClaimDetail?.aceStatus
            };
            gridAPI?.items?.applyTransaction({
                add: [item],
                addIndex: null
            });
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message);
        }
    };

    const deleteUnfixedGoodsItem = (uuid, rowNodes, gridAPI) => {
        const rowData = rowNodes.map((item) => item.data);
        const deletedItem = rowData.find((item) => getUuid(item) === uuid);
        if (deletedItem) {
            const { groupName } = deletedItem;
            const maxLengthGroup = deletedItem.groupNumber.length;
            let removeDeleted = rowData.filter((item) => item.groupNumber.length > maxLengthGroup && item.groupNumber.includes(groupName));
            removeDeleted = removeDeleted.map((item) => item.groupName);
            removeDeleted.push(groupName);
            const filteredRowNodes = rowData.filter((item) => removeDeleted.includes(item.groupName));
            gridAPI?.items?.applyTransaction({ remove: filteredRowNodes });
        }
    };
    const updateItemRetention = (data) => {
        console.log("data", data);
    };

    const addUnfixedAttachment = (event, uuid, rowData) => {
        handleFileUpload(event)
            .then((result) => {
                if (!result) return;
                const newRowData = [...rowData];
                newRowData.forEach((row, index) => {
                    if (row.uuid === uuid) {
                        newRowData[index] = {
                            ...row,
                            guid: result.guid,
                            attachment: result.fileLabel,
                            fileLabel: result.fileLabel
                        };
                    }
                });
                setAceOfficialClaim((prevStates) => ({
                    ...prevStates,
                    rowDataUnfixedGoods: newRowData
                }));
            })
            .catch((error) => {
                showToast("error", error.response ? error.response.data.message : error.message);
            });
    };

    const deleteUnfixedAttachment = (uuid, rowData) => {
        const data = rowData.find((item) => item.uuid === uuid);
        const { guid } = data;
        let newRowData = [...rowData];
        if (guid) {
            handelDeleteFile(guid);
        }
        newRowData = newRowData.map(
            (item) => {
                if (item.uuid === uuid) {
                    const newItem = { ...item };
                    delete newItem.guid;
                    delete newItem.attachment;
                    delete newItem.fileLabel;
                    return newItem;
                }
                return item;
            }
        );
        setAceOfficialClaim((prevStates) => ({
            ...prevStates,
            rowDataUnfixedGoods: newRowData
        }));
    };

    const handleOnIssue = async (values, companyUuid, action) => {
        console.log("values", values);
        try {
            const {
                itemRemarks,
                approvalRouteUuid,
                isESignRouting,
                cumulativeContractorWorksReasonForDifference = "",
                cumulativeUnfixedGoodsandMaterialsonSiteReasonForDifference = "",
                cumulativeVariationOrderReasonForDifference = "",
                retentionReleaseReasonForDifference = "",
                subTotalForResponseAmountReasonForDifference = "",
                amountDueReasonForWithheld = ""
            } = values;

            const body = {
                companyUuid,
                pcUuid: paramsPage.uuid,
                approvalRouteUuid,
                isESignRouting,
                itemRemarks,
                cumulativeContractorWorksReasonForDifference,
                cumulativeUnfixedGoodsandMaterialsonSiteReasonForDifference,
                cumulativeVariationOrderReasonForDifference,
                retentionReleaseReasonForDifference,
                subTotalForResponseAmountReasonForDifference,
                amountDueReasonForWithheld
            };

            console.log("body", JSON.stringify(body));
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, body);

            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            console.log(error);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const hanleOnAcknowledge = async (values, companyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, null);

            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const hanleOnConvert = async (values, companyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, null);

            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: `${INVOICE_ROUTES.CREATE_INV}`,
                    search: `?invoiceType=OPC_INVOICE&OPC=${response.data.data}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const hanleOnSubmitPendingValuation = async (values, companyUuid, action) => {
        try {
            const {
                createNodes = [],
                editNodeList,
                oldRootNodeUuids = [],
                editUnfixedItems = [],
                approvalRouteUuid,
                rootUnfixedItems
            } = values;

            const body = {
                approvalRouteUuid,
                removeItems: [],
                addItems: [],
                createNodes,
                editNodeList,
                oldRootNodeUuids,
                deleteNodeUuid: [],
                removeUnfixedItems: [],
                editUnfixedItems,
                claimItems: [],
                removeDocuments: [],
                newDocuments: [],
                rootUnfixedItems
            };
            console.log(JSON.stringify(body));
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, body);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleSumbitToArchitect = async (values, companyUuid, action) => {
        try {
            const {
                claimDate,
                paymentClaimReferenceNo,
                paymentClaimReferenceMonth,
                createNodes = [],
                editNodeList,
                oldRootNodeUuids = [],
                addUnfixedItems = [],
                approvalRouteUuid
            } = values;

            const body = {
                // claimDate: moment(claimDate)
                //     .format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                // paymentClaimReferenceNo,
                // paymentClaimReferenceMonth: paymentClaimReferenceMonth ? moment(paymentClaimReferenceMonth)
                //     .format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss) : null,
                approvalRouteUuid,
                removeItems: [],
                addItems: [],
                createNodes,
                editNodeList,
                oldRootNodeUuids,
                deleteNodeUuid: [],
                removeUnfixedItems: [],
                addUnfixedItems: addUnfixedItems.length ? addUnfixedItems : null,
                editUnfixedItems: [],
                claimItems: [],
                removeDocuments: [],
                newDocuments: []

            };
            console.log(JSON.stringify(body));
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, body);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleSumbitToReviewer = async (values, companyUuid, action) => {
        try {
            const {
                itemRemarks,
                approvalRouteUuid,
                isESignRouting,
                cumulativeContractorWorksReasonForDifference = "",
                cumulativeUnfixedGoodsandMaterialsonSiteReasonForDifference = "",
                cumulativeVariationOrderReasonForDifference = "",
                retentionReleaseReasonForDifference = "",
                subTotalForResponseAmountReasonForDifference = "",
                amountDueReasonForWithheld = ""
            } = values;

            const body = {
                companyUuid,
                pcUuid: paramsPage.uuid,
                approvalRouteUuid,
                isESignRouting,
                itemRemarks,
                cumulativeContractorWorksReasonForDifference,
                cumulativeUnfixedGoodsandMaterialsonSiteReasonForDifference,
                cumulativeVariationOrderReasonForDifference,
                retentionReleaseReasonForDifference,
                subTotalForResponseAmountReasonForDifference,
                amountDueReasonForWithheld
            };
            console.log(JSON.stringify(body));
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, body);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendReasonConverstation = async (companyUuid, reason) => {
        try {
            const conversationLines = [];
            conversationLines.push({ text: reason });
            const conversationBody = {
                referenceId: paramsPage.uuid,
                supplierUuid: userDetails.uuid,
                conversations: conversationLines
            };
            await ConversationService.createExternalConversation(companyUuid, conversationBody);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleOnApproveAC = async (companyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, null);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const formatUnfixedData = (unfixedData, unfixedClaimsHistory = []) => {
        let newUnfixItem = unfixedData;
        newUnfixItem = newUnfixItem.map((item) => {
            const unfixed = _.pick(item, [
                "groupNumber",
                "workCode",
                "description",
                "uom",
                "deliveryOrder",
                "deliveryOrderDate",
                "attachment",
                "mainConClaimQty",
                "mainConClaimUnitPrice",
                "mainConClaimRemarks",
                "retention",
                "parentGroup",
                "cetifiedQty",
                "cetifiedUnitPrice",
                "retentionPercentage"
            ]);
            unfixed.deliveryOrderDate = convertDate2String(
                unfixed.deliveryOrderDate,
                CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            );
            unfixed.uom = unfixed.uom?.uomCode || unfixed.uom;
            unfixed.unfixedClaimsHistory = [];
            unfixedClaimsHistory.map((unfixedHistory) => {
                if (unfixedHistory.groupNumber === item.groupNumber) {
                    unfixed.unfixedClaimsHistory.push(unfixedHistory);
                }
                return unfixedHistory;
            });
            unfixed.parentGroup = unfixed.parentGroup || "0";
            unfixed.retention = !!unfixed.retention;
            unfixed.attachment = item.guid;
            return unfixed;
        });
        return newUnfixItem;
    };

    const handleOnSendBackArchitectCert = async (companyUuid, reason, action) => {
        try {
            const response = await OfficialProgressiveClaimService.updateOfficialClaim(companyUuid, paramsPage.uuid, action, null);
            await sendReasonConverstation(companyUuid, reason);
            setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };

    const onSavePressHandler = async (values, action) => {
        setPristine();
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (companyUuid) {
            let dialogContent = {
                ...initialDialogConfig,
                isShow: true
            };
            const {
                itemRemarks
            } = originalOrderRef?.current?.getSubmitOriginOrderData();

            const reasonData = architectCertify.current?.getSubmitArchitectCertifyData();

            const valuesMerge = {
                ...values,
                ...reasonData,
                itemRemarks
            };
            switch (action) {
            case ACE_ACTION.APPROVED_ARCHITECT_CERTIFICATE:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleOnApproveAC(companyUuid, ACE_ACTION.APPROVED_ARCHITECT_CERTIFICATE);
                break;
            case ACE_ACTION.SUBMITTED_ARCHITECT_CERTIFICATE:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };

                await handleSumbitToReviewer(
                    valuesMerge,
                    companyUuid,
                    ACE_ACTION.SUBMITTED_ARCHITECT_CERTIFICATE
                );
                break;
            case ACE_ACTION.ISSUED_ARCHITECT_CERTIFICATE_TO_MAIN_CONTRACTOR:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleOnIssue(
                    valuesMerge,
                    companyUuid,
                    ACE_ACTION.ISSUED_ARCHITECT_CERTIFICATE_TO_MAIN_CONTRACTOR
                );
                break;
            case ACE_ACTION.SENT_BACK_ARCHITECT_CERTIFICATE:
            case ACE_ACTION.SENT_BACK_ARCHITECT_CERTIFICATE_TO_MQS:
                dialogContent = {
                    ...dialogContent,
                    ...{
                        title: t("Reason"),
                        isTextArea: true,
                        onPositiveAction: () => {
                            setDisplayDialogConfig({ ...dialogContent, ...{ validateForm: true } });
                            if (reasonInputRef.current.value) {
                                handleOnSendBackArchitectCert(companyUuid, reasonInputRef.current.value, action);
                            }
                        },
                        contentPositive: t("SendBack"),
                        colorPositive: "warning",
                        titleRequired: true
                    }
                };
                break;
            case ACE_ACTION.ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_ARCHITECT:
            case ACE_ACTION.ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_MC:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await hanleOnAcknowledge(valuesMerge, companyUuid, action);
                break;
            case ACE_ACTION.CONVERTED_ARCHITECT_CERTIFICATE_TO_INVOICE:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await hanleOnConvert(valuesMerge, companyUuid, ACE_ACTION.CONVERTED_ARCHITECT_CERTIFICATE_TO_INVOICE);
                break;
            default:
                break;
            }
            setDisplayDialogConfig(dialogContent);
        }
    };

    useEffect(() => {
        if (
            permissionReducer
            && permissionReducer?.currentCompany
            && !isInit.current
        ) {
            isInit.current = true;
            const { uuid } = paramsPage;
            const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
            getPCDetail(currentCompanyUUID, uuid, permissionReducer.isBuyer);
        }
    }, [permissionReducer]);

    useEffect(() => {
        if (!_.isEmpty(userDetails) && !_.isEmpty(userPermission)) {
            initData();
        }
    }, [userDetails, userPermission]);

    return (
        <Container fluid>
            <Formik
                validationSchema={itemSchema}
                innerRef={requestFormRef}
                initialValues={initialValues}
                onSubmit={() => { }}
            >
                {({
                    errors,
                    values,
                    touched,
                    dirty,
                    handleChange,
                    setFieldValue,
                    setValues,
                    handleSubmit
                }) => {
                    useEffect(() => {
                        loadOfficialClaimData(setValues);
                    }, [JSON.stringify(aceOfficialClaimDetail)]);

                    return (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row className="justify-content-between mx-0 mb-2 align-items-center">
                                        <HeaderMain
                                            title={t("Developer Progress Claim")}
                                            className="mb-3 mb-lg-3"
                                        />
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
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <InitialSetting
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                            />
                                            <VendorInformation
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                            />
                                            <ProgressPaymentInformation
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                draftClaimDetail={aceOfficialClaimDetail}
                                            />
                                            <PaymentClaimHistory
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                            />
                                        </Col>

                                        <Col md={6} lg={6}>
                                            {
                                                permissionReducer?.currentCompany && (
                                                    <GeneralInformation
                                                        dirty={dirty}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        isBuyer={permissionReducer.isBuyer}
                                                        draftClaimDetail={aceOfficialClaimDetail}
                                                        approvalRoutes={aceOfficialClaim.approvalRoutes}
                                                        setFieldValue={setFieldValue}
                                                        currentCompany={permissionReducer?.currentCompany}
                                                    />
                                                )
                                            }

                                            <SummaryDetails
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                totalAmount={aceOfficialClaim.workSpaceSummaryMainWork}
                                            />

                                            <ClaimDetail
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                draftClaim={aceOfficialClaim}
                                            />
                                            {
                                                permissionReducer?.currentCompany && (
                                                    <CertificationDetails
                                                        dirty={dirty}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        isBuyer={permissionReducer.isBuyer}
                                                        draftClaimDetail={aceOfficialClaimDetail}
                                                        setFieldValue={setFieldValue}
                                                        draftClaim={aceOfficialClaim}
                                                    />
                                                )
                                            }

                                        </Col>
                                    </Row>
                                    <HeaderSecondary
                                        title={t("Architect's Certificate Details")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {
                                                permissionReducer?.currentCompany
                                                && aceOfficialClaim.loading && (
                                                    <ArchitectCertificateDetails
                                                        defaultExpanded
                                                        detailDataState={aceOfficialClaimDetail}
                                                        refCb={architectCertify}
                                                    />
                                                )
                                            }
                                        </Col>
                                    </Row>

                                    <HeaderSecondary
                                        title={t("Work Space")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {
                                                permissionReducer?.currentCompany && (
                                                    <WorkSpace
                                                        defaultExpanded
                                                        rowData={aceOfficialClaim.rowDataWorkSpace}
                                                    />
                                                )
                                            }
                                        </Col>
                                    </Row>

                                    <HeaderSecondary
                                        title={t("Original Order")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {
                                                permissionReducer?.currentCompany && (
                                                    <OriginalOrder
                                                        userDetails={userDetails}
                                                        isBuyer={permissionReducer?.isBuyer}
                                                        defaultExpanded
                                                        t={t}
                                                        refCb={originalOrderRef}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        users={aceOfficialClaim.users}
                                                        rowData={aceOfficialClaim.rowDataOriginalOrder}
                                                        onAddChildItem={addOriginalOrderChildItem}
                                                        onDeleteItem={deleteOriginalOrderItem}
                                                        onExpandRow={onExpandOriginalOrder}
                                                        uoms={aceOfficialClaim.uoms}
                                                        onChangeOriginalOrder={(dataCb) => {
                                                            // console.log("dataCb", dataCb);
                                                            setAceOfficialClaim((prevState) => ({
                                                                ...prevState,
                                                                workSpaceSummaryMainWork: dataCb.totalAmount,
                                                                totalDataOriginalOrder: dataCb
                                                            }));
                                                            loadWorkSpaceTotalAmount(dataCb.totalAmount);
                                                        }}
                                                        draftDetail={aceOfficialClaimDetail}
                                                    />
                                                )
                                            }
                                        </Col>
                                    </Row>

                                    {
                                        permissionReducer?.currentCompany
                                        && (
                                            <>
                                                <HeaderSecondary
                                                    title={t("Unfixed Goods and Materials on Site")}
                                                    className="mb-2"
                                                />
                                                <Row className="mb-4">
                                                    <Col xs={12}>
                                                        <UnfixedGoodsAndMaterials
                                                            defaultExpanded
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            rowData={aceOfficialClaim.rowDataUnfixedGoods}
                                                            onAddItemManual={addUnfixedGoodsItemManual}
                                                            onAddChildItem={addUnfixedGoodsChildItem}
                                                            onDeleteItem={deleteUnfixedGoodsItem}
                                                            uoms={aceOfficialClaim.uoms}
                                                            onAddAttachment={(e, uuid, rowData) => addUnfixedAttachment(e, uuid, rowData, true)}
                                                            onDeleteAttachment={(uuid, rowData) => deleteUnfixedAttachment(uuid, rowData)}
                                                            refCb={unfixedGoodsRef}
                                                            onCellValueChanged={(row, rowData) => {
                                                                setAceOfficialClaim((prevState) => ({
                                                                    ...prevState,
                                                                    rowDataUnfixedGoods: rowData
                                                                }));
                                                            }}
                                                            draftDetail={aceOfficialClaimDetail}
                                                            onChangeUnfixedGoods={(dataCb) => {
                                                                setAceOfficialClaim((prevState) => ({
                                                                    ...prevState,
                                                                    totalDataUnfixedGoods: dataCb
                                                                }));
                                                            }}
                                                            isBuyer={permissionReducer?.isBuyer}
                                                        />
                                                    </Col>
                                                </Row>
                                            </>
                                        )
                                    }
                                    {/* <Row className="mb-4">
                                      <Col xs={12}>
                                          <DevVariation
                                              defaultExpanded
                                              t={t}
                                              values={values}
                                              errors={errors}
                                              touched={touched}
                                              handleChange={handleChange}
                                              setFieldValue={setFieldValue}
                                          />
                                      </Col>
                                  </Row> */}

                                    <HeaderSecondary
                                        title={t("Retention")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {
                                                permissionReducer?.currentCompany && (
                                                    <Retention
                                                        defaultExpanded
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        updateItemRetention={updateItemRetention}
                                                        isBuyer={permissionReducer.isBuyer}
                                                        draftClaimDetail={aceOfficialClaimDetail}
                                                    />
                                                )
                                            }
                                        </Col>
                                    </Row>
                                    <HeaderSecondary
                                        title={t("Conversations")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-2">
                                        <Col xs={12}>
                                            {/* Internal Conversations */}
                                            <Conversation
                                                title={t("InternalConversations")}
                                                activeTab={aceOfficialClaim.activeInternalTab}
                                                setActiveTab={(idx) => {
                                                    setAceOfficialClaim((prevStates) => ({
                                                        ...prevStates,
                                                        activeInternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={(comment) => sendCommentConversation(comment, true)}
                                                addNewRowAttachment={() => addNewRowAttachment(true)}
                                                rowDataConversation={aceOfficialClaim.rowDataInternalConversation}
                                                rowDataAttachment={aceOfficialClaim.rowDataInternalAttachment}
                                                onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, true)}
                                                onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, true)}
                                                onCellEditingStopped={(params) => onCellEditingStopped(params, true)}
                                                defaultExpanded
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {/* External Conversations */}
                                            <Conversation
                                                title={t("ExternalConversations")}
                                                activeTab={aceOfficialClaim.activeExternalTab}
                                                setActiveTab={(idx) => {
                                                    setAceOfficialClaim((prevStates) => ({
                                                        ...prevStates,
                                                        activeExternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={(comment) => sendCommentConversation(comment, false)}
                                                addNewRowAttachment={() => addNewRowAttachment(false)}
                                                rowDataConversation={aceOfficialClaim.rowDataExternalConversation}
                                                rowDataAttachment={aceOfficialClaim.rowDataExternalAttachment}
                                                onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, false)}
                                                onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, false)}
                                                onCellEditingStopped={(params) => onCellEditingStopped(params, false)}
                                                defaultExpanded
                                                borderTopColor="#A9A2C1"
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
                                            <AuditTrail
                                                rowData={aceOfficialClaim.rowDataAuditTrail || []}
                                                onGridReady={(params) => {
                                                    params.api.sizeColumnsToFit();
                                                }}
                                                paginationPageSize={10}
                                                gridHeight={350}
                                                defaultExpanded
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            {/* Recalled status */}
                            <CommonConfirmDialog
                                isShow={displaDialogConfig.isShow && displaDialogConfig.type !== "actionmodal"}
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
                                        {displaDialogConfig.validateForm && displaDialogConfig.titleRequired && reasonInputRef?.current?.value === "" && <div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>}
                                    </>
                                )}

                            </CommonConfirmDialog>
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        /* eslint-disable-next-line max-len */
                                        onClick={() => history.push(URL_CONFIG.PROGRESSIVE_ROUTES.ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST)}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {
                                        permissionReducer?.currentCompany
                                        && aceOfficialClaim.loading && (
                                            <GroupButtonByStatus
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                dirty={dirty}
                                                isBuyer={permissionReducer.isBuyer}
                                                onSavePressHandler={
                                                    (valueForm, status) => {
                                                        if (!dirty
                                                            || (dirty && Object.keys(errors).length)) {
                                                            console.log("error", errors);
                                                            showToast("error", "Validation error, please check your input.");
                                                            return;
                                                        }
                                                        // console.log("validate");
                                                        onSavePressHandler(valueForm, status);
                                                    }
                                                }
                                                detailDataState={aceOfficialClaimDetail}
                                                draftClaim={aceOfficialClaim}
                                            />
                                        )
                                    }

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
