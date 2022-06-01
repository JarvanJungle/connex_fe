/* eslint-disable max-len */
import React, {
    useEffect,
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
import ProgressPaymentInformation from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/ProgressPaymentInformation";
import PaymentClaimHistory from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/PaymentClaimHistory";
import SummaryDetails from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/SummaryDetails";
import GeneralInformation from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/GeneralInformation";
import VendorInformation from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/VendorInformation";
import ClaimDetail from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/ClaimDetail";
import OriginalOrder from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/OriginalOrder";
import UnfixedGoodsAndMaterials from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/UnfixedGoodsAndMaterials";
import CertificationDetails from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/CertificationDetails";
import DevVariation from "routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/RecallCancel/components/DevVariation";
import Retention from "./components/Retention";
import WorkSpace from "./components/WorkSpace";
import InitialSetting from "./components/InitialSetting";
import {
    initialValues
} from "../Helper";
import DraftProgressiveClaimService
    from "../../../../../services/DraftProgressiveClaimService/DraftProgressiveClaimService";
import {
    convertToLocalTime,
    formatDateString,
    sortArrayByName
} from "../../../../../helper/utilities";
import UOMDataService from "../../../../../services/UOMService";
import UserService from "../../../../../services/UserService";
import CUSTOM_CONSTANTS, {
    RESPONSE_STATUS
} from "../../../../../helper/constantsDefined";
import EntitiesService from "../../../../../services/EntitiesService";
import GroupButtonByStatus from "./components/GroupButtonByStatus";

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
export default function ConvertDftPCtoActualDVPC() {
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

    const itemSchema = Yup.object().shape({
        claimDate: Yup.string()
            .required(i18next.t("PleaseSelectValidClaimDate")),
        paymentClaimReferenceNo: Yup.string()
            .required(i18next.t("PleaseEnterValidPaymentClaimReferenceNo")),
        paymentClaimReferenceMonth: Yup.string()
            .required(i18next.t("PleaseSelectValidPaymentClaimReferenceMonth"))
    });

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
        } catch (error) {
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
                rowDataExternalAttachment
            }));

            const workSpace = draftClaimDetail.pcWorkSpace || {};
            const personalInformation = permissionReducer.isBuyer ? draftClaimDetail.supplierInformation : draftClaimDetail.buyerInformation;
            const initValues = {
                ...initialValues,
                approvalSequence: draftClaimDetail.approvalSequence,
                approvalRouteUuid: draftClaimDetail.approvalRouteUuid,
                dpcNumber: draftClaimDetail.dpcNumber,
                dwoNumber: draftClaimDetail.dwoNumber,
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
                paymentClaimReferenceMonth: draftClaimDetail.paymentClaimReferenceMonth ? convertToLocalTime(draftClaimDetail.paymentClaimReferenceMonth, CUSTOM_CONSTANTS.YYYYMM) : "",
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
                    UserService.getCompanyUsers(companyUuid),
                    ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                        companyUuid, "DPC"
                    )
                ]);

                const [
                    responseUOMs,
                    responseCompanyUsers,
                    responseApprovalRoutes
                ] = responses;
                let approvalRoutes = getDataResponse(responseApprovalRoutes) || [];
                approvalRoutes = approvalRoutes.filter((item) => item.active);

                setDraftClaim((prevState) => ({
                    ...prevState,
                    uoms: getDataResponse(responseUOMs),
                    users: getDataResponse(responseCompanyUsers),
                    approvalRoutes
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
        } catch (error) {
            showToast("error", error?.response?.data?.message);
        }
    };

    const onExpandOriginalOrder = async (parentNode, rowData) => {
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
                dpcStatus: draftClaimDetail?.dpcStatus
            };
            gridAPI?.items?.applyTransaction({
                add: [item],
                addIndex: null
            });
        } catch (error) {
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

    const onConvertPressHandler = async () => {
        setPristine();
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
                                        <div className="d-flex align-items-center">
                                            <Button
                                                className="mr-3"
                                                color="secondary"
                                                onClick={() => {
                                                }}
                                                style={{
                                                    height: 40
                                                }}
                                            >
                                                {t("VIEW DRAFT PAYMENT CLAIM")}
                                            </Button>
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                }}
                                                style={{
                                                    height: 40
                                                }}
                                            >
                                                {t("VIEW DRAFT PAYMENT VALUATION")}
                                            </Button>
                                        </div>
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
                                                true && (
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
                                                subTitle={t("Contact")}
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
                                                true && (
                                                    <CertificationDetails
                                                        forceRender
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
                                                true && (
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
                                                true && (
                                                    <OriginalOrder
                                                        subHeader={t("Main Quantity Surveyor & Architect")}
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
                                                        rowData={draftClaim?.rowDataOriginalOrder || []}
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
                                        true && (
                                            <>
                                                <HeaderSecondary
                                                    title={t("Unfixed Goods and Materials on Site")}
                                                    className="mb-2"
                                                />
                                                <Row className="mb-4">
                                                    <Col xs={12}>
                                                        <UnfixedGoodsAndMaterials
                                                            onlyShowDownload
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
                                                        />
                                                    </Col>
                                                </Row>
                                            </>
                                        )
                                    }
                                    <Row className="mb-4">
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
                                    </Row>
                                    <HeaderSecondary
                                        title={t("Retention")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {
                                                true && (
                                                    <Retention
                                                        defaultExpanded
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
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
                                        color="danger"
                                        /* eslint-disable-next-line max-len */
                                        onClick={() => history.push(URL_CONFIG.PROGRESSIVE_ROUTES.DRAFT_PROGRESS_CLAIM_LIST)}
                                    >
                                        {t("Back")}
                                    </Button>
                                    <GroupButtonByStatus
                                        t={t}
                                        values={values}
                                        errors={errors}
                                        dirty={dirty}
                                        isBuyer={permissionReducer.isBuyer}
                                        onConvertPressHandler={
                                            (valueForm, status) => {
                                                if (!dirty
                                                    || (dirty && Object.keys(errors).length)) {
                                                    showToast("error", "Validation error, please check your input.");
                                                    return;
                                                }
                                                // console.log("validate");
                                                onConvertPressHandler(valueForm, status);
                                            }
                                        }
                                        detailDataState={draftClaimDetail}
                                        draftClaim={draftClaim}
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
