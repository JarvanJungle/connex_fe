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
    Row
} from "components";
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
    Conversation
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
import { FEATURE } from "helper/constantsDefined";
import {
    DPC_STATUS,
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
import DevVariation from "./components/DevVariation";
import DraftProgressiveClaimService
    from "../../../../../services/DraftProgressiveClaimService/DraftProgressiveClaimService";
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
import EntityServices from "../../../../../services/EntitiesService";

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
export default function RecallCancel() {
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

    const [draftClaim, setDraftClaim] = useState({
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
    const [draftClaimDetail, setDraftClaimDetail] = useState();
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

    const getDraftDetail = async (currentCompanyUUID, dpcUuid, isBuyer) => {
        try {
            const draftDetail = await DraftProgressiveClaimService
                .getDraftClaimDetail(currentCompanyUUID, dpcUuid, isBuyer);
            setDraftClaimDetail(draftDetail.data.data);
            console.log("draftDetail", draftDetail);
        } catch (error) {
            console.log(error);
            showToast("error", error.message ? error.message : error.response.data.message);
        }
    };

    const getArchitects = () => {
        const consultants = draftClaimDetail.pcWorkSpace?.consultants || [];
        return consultants.filter((item) => item.role === "ARCHITECT");
    };

    const getQuantitySurveyors = () => {
        const consultants = draftClaimDetail.pcWorkSpace?.consultants || [];
        return consultants.filter((item) => item.role === "MAIN_QS");
    };

    const loadDraftClaimData = async (setValues) => {
        if (draftClaimDetail) {
            const companyUuid = permissionReducer.currentCompany?.companyUuid;
            const isBuyer = permissionReducer?.isBuyer;

            let rowDataWorkSpace = [];
            rowDataWorkSpace = await DraftProgressiveClaimService.getListChildOriginalOrder(isBuyer, companyUuid, paramsPage.dpcUuid, 0);
            rowDataWorkSpace = sortArrayByName(rowDataWorkSpace?.data?.data, "groupNumber");

            let rowDataUnfixedGoods = draftClaimDetail.pcWorkSpace?.unfixedItems || [];
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
            const rowDataAuditTrail = draftClaimDetail.pcAuditTrails?.map(
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

            const rowDataInternalAttachment = (draftClaimDetail.pcDocumentMetadataList || [])
                .filter((item) => item.externalDocument === false);
            const rowDataExternalAttachment = (draftClaimDetail.pcDocumentMetadataList || [])
                .filter((item) => item.externalDocument === true);
            const responses = await Promise.allSettled([
                ConversationService.getDetailExternalConversation(
                    companyUuid, paramsPage.dpcUuid
                ),
                ConversationService.getDetailInternalConversation(
                    companyUuid, paramsPage.dpcUuid
                )
            ]);

            const [responseDetailInternalConversation, responseDetailExternalConversation] = responses;
            const resExternalConversation = getDataResponse(responseDetailInternalConversation, "object");
            const resInternalConversation = getDataResponse(responseDetailExternalConversation, "object");

            const rowDataExternalConversation = [...draftClaim.rowDataExternalConversation];

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
            const rowDataInternalConversation = [...draftClaim.rowDataInternalConversation];
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
            let approvalRoutes = [];
            if ([DPC_STATUS.PENDING_VALUATION, DPC_STATUS.PENDING_SUBMISSION].includes(draftClaimDetail.dpcStatus)) {
                try {
                    const responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                        companyUuid,
                        FEATURE.DPC
                    );
                    approvalRoutes = responseApprovalRoutes?.data?.data || [];
                    approvalRoutes = approvalRoutes.filter((item) => item.active);
                } catch (error) {
                    console.error("error", error);
                    showToast("error", error.response ? error.response.data.message : error.message);
                }
            }
            //= ============ end get conversations================
            setDraftClaim((prevState) => ({
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

            console.log("draftClaimDetail", draftClaimDetail);
            console.log("permissionReducer", permissionReducer);
            const workSpace = draftClaimDetail.pcWorkSpace || {};
            const personalInformation = permissionReducer.isBuyer ? draftClaimDetail.supplierInformation : draftClaimDetail.buyerInformation;
            console.log("personalInformation", personalInformation);
            const initValues = {
                ...initialValues,
                approvalSequence: draftClaimDetail.approvalSequence,
                approvalRouteUuid: draftClaimDetail.approvalRouteUuid,
                approvalRouteName: draftClaimDetail.approvalRouteName,
                dpcNumber: draftClaimDetail.dpcNumber,
                dwoNumber: draftClaimDetail.dwoNumber,
                dwoUuid: draftClaimDetail.dwoUuid,
                dpcStatus: draftClaimDetail.dpcStatus,

                vendorCode: personalInformation?.vendorCode || "",
                vendorName: personalInformation?.vendorName || "",
                vendorUuid: personalInformation?.vendorUuid || "",
                contactName: personalInformation?.contactName || "",
                contactEmail: personalInformation?.contactEmail || "",
                contactNumber: personalInformation?.contactNumber || "",
                countryName: personalInformation?.countryName || "",
                countryCode: personalInformation?.countryCode || "",
                companyRegistrationNo: personalInformation?.companyRegistrationNo || "",

                cumulativeAgreedVariationOrder: draftClaimDetail.pcWorkSpace?.cumulativeAgreedVariationOrder,
                cumulativeCertAgreedVarOrder: draftClaimDetail.pcWorkSpace?.cumulativeCertAgreedVarOrder,
                cumulativeCertMainconWorks: draftClaimDetail.pcWorkSpace?.cumulativeCertMainconWorks,
                cumulativeCertUnfixedGoodsMaterials: draftClaimDetail.pcWorkSpace?.cumulativeCertUnfixedGoodsMaterials,
                cumulativeCertified: draftClaimDetail.pcWorkSpace?.cumulativeCertified,
                cumulativeClaimed: draftClaimDetail.pcWorkSpace?.cumulativeClaimed,
                cumulativeMainConWorks: draftClaimDetail.pcWorkSpace?.cumulativeMainConWorks,
                cumulativeUnfixedGoodsAndMaterials: draftClaimDetail.pcWorkSpace?.cumulativeUnfixedGoodsAndMaterials,
                retentionCumulativeWorkDone: draftClaimDetail.pcWorkSpace?.retentionCumulativeWorkDone,
                lessFinalRetentionAmnt: draftClaimDetail.pcWorkSpace?.lessFinalRetentionAmnt,
                addCertRetentionWorkDone: draftClaimDetail.pcWorkSpace?.addCertRetentionWorkDone,
                lessPrevCumulPayments: draftClaimDetail.pcWorkSpace?.lessPrevCumulPayments,
                amntCertPayments: draftClaimDetail.pcWorkSpace?.amntCertPayments,

                paymentClaimReferenceNo: draftClaimDetail.paymentClaimReferenceNo,
                paymentClaimReferenceMonth: draftClaimDetail.paymentClaimReferenceMonth ? draftClaimDetail.paymentClaimReferenceMonth : "",
                paymentClaimHistoryList: draftClaimDetail.paymentClaimHistoryList,
                claimPeriodStartDate: draftClaimDetail.claimPeriodStartDate ? moment(draftClaimDetail.claimPeriodStartDate).format(CUSTOM_CONSTANTS.DDMMYYYY) : null,
                claimPeriodEndDate: draftClaimDetail.claimPeriodEndDate ? moment(draftClaimDetail.claimPeriodEndDate).format(CUSTOM_CONSTANTS.DDMMYYYY) : null,
                workOrderTitle: draftClaimDetail.workOrderTitle,
                contractType: draftClaimDetail.pcWorkSpace?.contractType || "",
                paymentResponseReferenceNo: draftClaimDetail.paymentResponseReferenceNo,
                claimDate: draftClaimDetail.claimDate ? convertToLocalTime(draftClaimDetail.claimDate, CUSTOM_CONSTANTS.YYYYMMDD) : formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                originalContractSum: draftClaimDetail.pcWorkSpace?.originalContractSum,
                bqContingencySum: draftClaimDetail.pcWorkSpace?.bqContingencySum,
                remeasuredContractSum: draftClaimDetail.pcWorkSpace?.remeasuredContractSum,
                agreedVariationOrderSum: draftClaimDetail.pcWorkSpace?.agreedVariationOrderSum,
                adjustedContractSum: draftClaimDetail.pcWorkSpace?.adjustedContractSum,
                retentionPercentage: draftClaimDetail.pcWorkSpace?.retentionPercentage,
                includeVariation: draftClaimDetail.pcWorkSpace?.includeVariation,
                retentionCappedPercentage: draftClaimDetail.pcWorkSpace?.retentionCappedPercentage,
                retentionAmountCappedAt: draftClaimDetail.pcWorkSpace?.retentionAmountCappedAt,
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

                setDraftClaim((prevState) => ({
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
            // setDraftClaim((prevStates) => ({
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

            const { data } = await DraftProgressiveClaimService.getListChildOriginalOrder(
                isBuyer,
                companyUuid,
                paramsPage.dpcUuid,
                parentNode.itemUuid
            );
            let itemChild = sortArrayByName(data?.data, "groupNumber");
            itemChild = itemChild.map((item) => ({
                ...item,
                groupNumber: [...parentNode.groupNumber, item.groupNumber]
            }));
            setDraftClaim((prevStates) => ({
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
            const { rowDataInternalAttachment } = draftClaim;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setDraftClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = draftClaim;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setDraftClaim((prevStates) => ({
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
                setDraftClaim((prevStates) => ({
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
            setDraftClaim((prevStates) => ({
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
        const removeDocumentUuids = !draftClaim.removeDocumentUuids.includes(rowDeleted.guid) && draftClaim.removeDocumentUuids.push(rowDeleted.guid);
        if (isInternal) {
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setDraftClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData,
                removeDocumentUuids
            }));
            return;
        }
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setDraftClaim((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData,
            removeDocumentUuids
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = draftClaim;
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
            setDraftClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = draftClaim;
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
        setDraftClaim((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...draftClaim.internalConversationLines];
            const { rowDataInternalConversation } = draftClaim;
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
            setDraftClaim((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = draftClaim;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...draftClaim.externalConversationLines];
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
        setDraftClaim((prevStates) => ({
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
            + Number(draftClaim.workSpaceSummaryVariation);
        const rowDataWorkSpaceSummary = [
            {
                groupNumber: ["Total [Excl GST]"],
                weightage: 100,
                amount: totalContractAmount
            },
            {
                groupNumber: ["Total [Excl GST]", "A. Main-Con Works"],
                weightage: ((Number(totalAmount) / totalContractAmount) * 100).toFixed(2),
                amount: totalAmount
            },
            {
                groupNumber: ["Total [Excl GST]", "B. Agreed Variation Order"],
                weightage:
                    ((Number(draftClaim.workSpaceSummaryVariation) / totalContractAmount) * 100)
                        .toFixed(2),
                amount: draftClaim.workSpaceSummaryVariation
            }
        ];
        setDraftClaim((prevState) => ({
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
            dpcStatus: draftClaimDetail?.dpcStatus
        };
        gridAPI?.items?.applyTransaction({
            add: [item],
            addIndex: null
        });
        setDraftClaim((prevStates) => ({
            ...prevStates,
            rowDataUnfixedGoods: [...rowData, item]
        }));
    };

    const addUnfixedGoodsChildItem = (parentNode, rowData, gridAPI) => {
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
                dpcStatus: parentNode?.dpcStatus
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
                setDraftClaim((prevStates) => ({
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
        setDraftClaim((prevStates) => ({
            ...prevStates,
            rowDataUnfixedGoods: newRowData
        }));
    };

    const handleOnIssue = async (values, companyUuid, action) => {
        console.log("values", values);
        try {
            const {
                claimDate,
                paymentClaimReferenceNo,
                paymentClaimReferenceMonth,
                createNodes,
                editNodeList,
                oldRootNodeUuids,
                addUnfixedItems,
                rootUnfixedItems,
                createUnfixedItems
            } = values;

            const body = {
                claimDate: moment(claimDate)
                    .format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                paymentClaimReferenceNo,
                paymentClaimReferenceMonth: paymentClaimReferenceMonth ? moment(paymentClaimReferenceMonth)
                    .format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss) : null,
                removeItems: [],
                addItems: [],
                createNodes,
                editNodeList,
                oldRootNodeUuids,
                deleteNodeUuid: [],
                removeUnfixedItems: [],
                addUnfixedItems: addUnfixedItems.length ? addUnfixedItems : null,
                createUnfixedItems,
                rootUnfixedItems,
                editUnfixedItems: [],
                claimItems: [],
                removeDocuments: [],
                newDocuments: []
            };

            console.log("body", JSON.stringify(body));
            setDisplayDialogConfig(initialDialogConfig);
            const response = await DraftProgressiveClaimService.updateDraftClaim(companyUuid, paramsPage.dpcUuid, action, body);

            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
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
            const response = await DraftProgressiveClaimService.updateDraftClaim(companyUuid, paramsPage.dpcUuid, action, null);

            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
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
            const response = await DraftProgressiveClaimService.updateDraftClaim(companyUuid, paramsPage.dpcUuid, action, body);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleOnSaveAsDraft = async (values, companyUuid, action) => {
        try {
            const {
                createNodes = [],
                editNodeList,
                oldRootNodeUuids = [],
                addUnfixedItems = [],
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
                addUnfixedItems: addUnfixedItems.length ? addUnfixedItems : null,
                editUnfixedItems: [],
                claimItems: [],
                removeDocuments: [],
                newDocuments: [],
                rootUnfixedItems
            };
            console.log(JSON.stringify(body));
            setDisplayDialogConfig(initialDialogConfig);
            const response = await DraftProgressiveClaimService.updateDraftClaim(
                companyUuid,
                paramsPage.dpcUuid,
                action,
                body
            );
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast(
                "error",
                error.response ? error.response.data.message : error.message
            );
        }
    };

    const handleOnApprove = async (companyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await DraftProgressiveClaimService.updateDraftClaim(companyUuid, paramsPage.dpcUuid, action, null);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleOnRevert = async (values, companyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await DraftProgressiveClaimService.updateDraftClaim(companyUuid, paramsPage.dpcUuid, action, null);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleAcknowledgeDraftValuation = async (values, companyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await DraftProgressiveClaimService.updateDraftClaim(companyUuid, paramsPage.dpcUuid, action, null);
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handlePendingOfficialClaimSubmission = async (values, compaynyUuid, action) => {
        try {
            setDisplayDialogConfig(initialDialogConfig);
            const response = await DraftProgressiveClaimService.updateDraftClaim(
                compaynyUuid,
                paramsPage.dpcUuid,
                action,
                null
            );
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname:
                    URL_CONFIG.PROGRESSIVE_ROUTES.OFFICIAL_PROGRESS_CLAIM_LIST_CREATE.replace(
                        ":uuid",
                        response.data.data
                    )
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

    const onSavePressHandler = async (values, action) => {
        setPristine();
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (companyUuid) {
            let dialogContent = {
                ...initialDialogConfig,
                isShow: true
            };
            const {
                createNodes,
                editNodeList,
                oldRootNodeUuids
            } = originalOrderRef?.current?.getSubmitOriginOrderData();

            const {
                addUnfixedItems = [],
                createUnfixedItems,
                rootUnfixedItems,
                editUnfixedItems
            } = unfixedGoodsRef?.current?.getSubmitUnfixedData() || {};
            const valuesMerge = {
                ...values,
                createNodes,
                editNodeList,
                oldRootNodeUuids,
                addUnfixedItems,
                createUnfixedItems,
                rootUnfixedItems,
                editUnfixedItems
            };
            const unfixedClaimsHistory = unfixedGoodsRef?.current?.getUnfixedHistoryData() || [];
            switch (action) {
            case DPC_STATUS.CREATED:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleOnIssue(
                    { ...valuesMerge, createUnfixedItems: formatUnfixedData([...createUnfixedItems]) },
                    companyUuid,
                    DPC_STATUS.CREATED
                );
                break;
            case DPC_STATUS.PENDING_ACKNOWLEDGEMENT:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await hanleOnAcknowledge(valuesMerge, companyUuid, DPC_STATUS.PENDING_ACKNOWLEDGEMENT);
                break;

            case DPC_STATUS.PENDING_VALUATION:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };

                await hanleOnSubmitPendingValuation(
                    {
                        ...valuesMerge,
                        editUnfixedItems: formatUnfixedData(
                            [...editUnfixedItems],
                            unfixedClaimsHistory
                        )
                    },
                    companyUuid,
                    DPC_STATUS.PENDING_VALUATION
                );
                break;
            case DPC_STATUS.PENDING_SUBMISSION:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleOnSaveAsDraft(
                    {
                        ...valuesMerge,
                        editUnfixedItems: formatUnfixedData(
                            [...editUnfixedItems],
                            unfixedClaimsHistory
                        )
                    },
                    companyUuid,
                    DPC_STATUS.PENDING_SUBMISSION
                );
                break;
            case DPC_STATUS.PENDING_APPROVAL:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleOnApprove(companyUuid, DPC_STATUS.PENDING_APPROVAL);
                break;
            case DPC_STATUS.PENDING_REVERT:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleOnRevert(valuesMerge, companyUuid, DPC_STATUS.PENDING_REVERT);
                break;
            case DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handleAcknowledgeDraftValuation(valuesMerge, companyUuid, DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION);
                break;
            case DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION:
                dialogContent = {
                    ...initialDialogConfig,
                    isShow: false
                };
                await handlePendingOfficialClaimSubmission(
                    valuesMerge,
                    companyUuid,
                    DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION
                );
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
            const uuid = paramsPage.dpcUuid;
            const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
            getDraftDetail(currentCompanyUUID, uuid, permissionReducer.isBuyer);
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
                        loadDraftClaimData(setValues);
                    }, [JSON.stringify(draftClaimDetail)]);

                    return (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row className="justify-content-between mx-0 mb-2 align-items-center">
                                        <HeaderMain
                                            title={t("Draft Progress Claim")}
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
                                                draftClaimDetail={draftClaimDetail}
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
                                                        draftClaimDetail={draftClaimDetail}
                                                        approvalRoutes={draftClaim.approvalRoutes}
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
                                                totalAmount={draftClaim.workSpaceSummaryMainWork}
                                            />

                                            <ClaimDetail
                                                dirty={dirty}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                draftClaim={draftClaim}
                                            />
                                            {
                                                (permissionReducer?.currentCompany || (!permissionReducer.isBuyer && [
                                                    DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION,
                                                    DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION,
                                                    DPC_STATUS.CONVERTED_TO_OFFICIAL_CLAIMS
                                                ].includes(draftClaimDetail?.dpcStatus))) && (
                                                    <CertificationDetails
                                                        dirty={dirty}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        isBuyer={permissionReducer.isBuyer}
                                                        draftClaimDetail={draftClaimDetail}
                                                        setFieldValue={setFieldValue}
                                                        draftClaim={draftClaim}
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
                                                        rowData={draftClaim.rowDataWorkSpace}
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
                                                        users={draftClaim.users}
                                                        rowData={draftClaim.rowDataOriginalOrder}
                                                        onAddChildItem={addOriginalOrderChildItem}
                                                        onDeleteItem={deleteOriginalOrderItem}
                                                        onExpandRow={onExpandOriginalOrder}
                                                        uoms={draftClaim.uoms}
                                                        onChangeOriginalOrder={(dataCb) => {
                                                            // console.log("dataCb", dataCb);
                                                            setDraftClaim((prevState) => ({
                                                                ...prevState,
                                                                workSpaceSummaryMainWork: dataCb.totalAmount,
                                                                totalDataOriginalOrder: dataCb
                                                            }));
                                                            loadWorkSpaceTotalAmount(dataCb.totalAmount);
                                                        }}
                                                        draftDetail={draftClaimDetail}
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
                                                            rowData={draftClaim.rowDataUnfixedGoods}
                                                            onAddItemManual={addUnfixedGoodsItemManual}
                                                            onAddChildItem={addUnfixedGoodsChildItem}
                                                            onDeleteItem={deleteUnfixedGoodsItem}
                                                            uoms={draftClaim.uoms}
                                                            onAddAttachment={(e, uuid, rowData) => addUnfixedAttachment(e, uuid, rowData, true)}
                                                            onDeleteAttachment={(uuid, rowData) => deleteUnfixedAttachment(uuid, rowData)}
                                                            refCb={unfixedGoodsRef}
                                                            onCellValueChanged={(row, rowData) => {
                                                                setDraftClaim((prevState) => ({
                                                                    ...prevState,
                                                                    rowDataUnfixedGoods: rowData
                                                                }));
                                                            }}
                                                            draftDetail={draftClaimDetail}
                                                            onChangeUnfixedGoods={(dataCb) => {
                                                                setDraftClaim((prevState) => ({
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
                                                        draftClaimDetail={draftClaimDetail}
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
                                                activeTab={draftClaim.activeInternalTab}
                                                setActiveTab={(idx) => {
                                                    setDraftClaim((prevStates) => ({
                                                        ...prevStates,
                                                        activeInternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={(comment) => sendCommentConversation(comment, true)}
                                                addNewRowAttachment={() => addNewRowAttachment(true)}
                                                rowDataConversation={draftClaim.rowDataInternalConversation}
                                                rowDataAttachment={draftClaim.rowDataInternalAttachment}
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
                                                activeTab={draftClaim.activeExternalTab}
                                                setActiveTab={(idx) => {
                                                    setDraftClaim((prevStates) => ({
                                                        ...prevStates,
                                                        activeExternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={(comment) => sendCommentConversation(comment, false)}
                                                addNewRowAttachment={() => addNewRowAttachment(false)}
                                                rowDataConversation={draftClaim.rowDataExternalConversation}
                                                rowDataAttachment={draftClaim.rowDataExternalAttachment}
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
                                                rowData={draftClaim.rowDataAuditTrail}
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

                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        /* eslint-disable-next-line max-len */
                                        onClick={() => history.push(URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST)}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {
                                        permissionReducer?.currentCompany
                                        && draftClaim.loading && (
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
                                                detailDataState={draftClaimDetail}
                                                draftClaim={draftClaim}
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
