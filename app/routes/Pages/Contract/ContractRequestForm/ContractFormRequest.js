import {
    // Button,
    Container,
    Row,
    Col,
    Input
} from "components";
import React, {
    useState, useEffect, useRef, useMemo
} from "react";
import { useTranslation } from "react-i18next";
import {
    Formik, Form
} from "formik";
import * as Yup from "yup";
import {
    formatDateString,
    sortArrayByName,
    formatBudget,
    convertToLocalTime,
    formatDisplayDecimal
} from "helper/utilities";
import { HeaderMain } from "routes/components/HeaderMain";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, PROJECT_TYPES, FEATURE } from "helper/constantsDefined";
import _ from "lodash";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import ManageProjectService from "services/ManageProjectService";
import ProjectService from "services/ProjectService/ProjectService";
import useToast from "routes/hooks/useToast";
import CurrenciesService from "services/CurrenciesService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import {
    AuditTrail, BudgetDetails, CommonConfirmDialog
} from "routes/components";
import UOMDataService from "services/UOMService";
// import GLDataService from "services/GLService";
import TaxRecordDataService from "services/TaxRecordService";
import ContractModuleService from "services/ContractModuleService/ContractModuleService";
import CONTRACT_REQUEST_FORM_ROUTE from "services/ContractModuleService/urls";
import { CONTRACT_REQUEST_LIST_STATUS } from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import ConversationService from "services/ConversationService/ConversationService";
import useBudgetDetails from "routes/hooks/useBudgetDetails";
import GeneralInformation from "./GeneralInformation";
import ContractItems from "../components/ContractItems/ContractItems";
import ContractingConversion from "../components/Conversations/Conversations";
import StickyFooterSubmit from "./StickyFooterSubmit";
import itemRequestSchema from "../components/ContractItems/ConlumnDefs/validation/itemRequestSchema";

function ContractFormRequest() {
    const { t } = useTranslation();
    const ONE_DATE_MS = 86400000;
    const validationSchema = Yup.object().shape({
        contractType: Yup.string()
            .required(t("Please select Contract Type")),
        procurementType: Yup.string()
            .required(t("Please select Procurement Type")),
        contractTitle: Yup.string()
            .required(t("PleaseEnterContractTitle")),
        contractStartDate: Yup.date()
            .min(new Date(Date.now() - ONE_DATE_MS), t("PleaseSelectValidStartDateThanToday"))
            .required(t("PleaseSelectValidStartDate")),
        contractEndDate: Yup.date().min(
            Yup.ref("contractStartDate"), t("EndDateShouldBeGreaterThanStartDate")
        ).required(t("PleaseSelectValidEndDate")),
        approvalRoute: Yup.string()
            .required(t("PleaseSelectApprovalRoute")),
        deliveryAddress: Yup.string()
            .required(t("PleaseSelectDeliveryAddress")),
        currency: Yup.string()
            .required(t("PleaseSelectCurrency")),
        project: Yup.string()
            .test("projectRequired",
                t("PleaseSelectValidProject"),
                (value, testContext) => {
                    const { parent } = testContext;
                    const myCondition = parent.natureOfContract === "true" || parent.natureOfContract === true;
                    // return ((value && myCondition) || (!value && !myCondition));
                    return ((value && myCondition) || (!myCondition));
                }),
        // productServiceDescription: Yup.string()
        //     .required(t("PleaseEnterProduct/ServiceDescription")),
        supplierCode: Yup.string()
            .required(t("PleaseSelectValidSupplier"))
    });

    const requestFormRef = useRef(null);
    const history = useHistory();
    const params = useParams();
    const showToast = useToast();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const contractingType = useMemo(() => {
        const permissionUser = userPermission[permissionReducer.featureBasedOn];
        const listTypeOfRequisition = [];
        if (permissionUser) {
            permissionUser.features.forEach((item) => {
                if ([
                    FEATURE.PR,
                    FEATURE.WR,
                    FEATURE.VR,
                    FEATURE.BC,
                    FEATURE.DWR
                ].includes(item.featureCode)
                    && !listTypeOfRequisition.find(({ value }) => value === item.featureCode)
                ) {
                    listTypeOfRequisition.push({
                        label: item.feature.featureName,
                        value: item.featureCode
                    });
                }
            });
        }
        return listTypeOfRequisition;
    }, [permissionReducer]);

    const [contractRequestFormState, setContractRequestFormState] = useState({
        loading: false,
        companyUuid: "",
        contractRequestUuid: "",
        renewalOptions: [
            { label: "None", value: "None" },
            { label: "Yes", value: "Yes" }
        ],
        natureOfContract: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        modeView: {
            isEditMode: true,
            isViewDetailsMode: false,
            isApprovalMode: false
        }
    });

    // API response states
    const [rejectObj, setRejectObj] = useState({
        showErrorReasonReject: false,
        reasonReject: ""
    });

    const [sendBackObj, setSendBackObj] = useState({
        showErrorReasonSendBack: false,
        reasonSendBack: ""
    });

    const [isInit, setIsInit] = useState(false);
    const [
        rowDataProject, rowDataTrade, ,
        getBudgetDetailsByProjectCode
    ] = useBudgetDetails();
    // check unsave + warning
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [contractData, setContractData] = useState(null);
    const [loadButton, setLoadButton] = useState(false);
    const [contractStatus, setContractStatus] = useState("");
    const [refreshSummaryItems, setRefreshSummaryItems] = useState(false);
    const [projects, setProjects] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [approvalRoutes, setApprovalRoutes] = useState([]);
    // const [stateForecastItems, setStateForecastItems] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);
    // const [glAccounts, setGlAccounts] = useState([]);
    const [subTotal, setSubTotal] = useState(0);

    const [catalogueItems, setCatalogueItems] = useState([]);
    const [rowContractItems, setRowContractItems] = useState([]);
    const [rowDataAuditTrail, setRowDataAuditTrail] = useState([]);
    const [displayCancelReasonDialog, setDisplayCancelReasonDialog] = useState(false);
    const [displayRecallReasonDialog, setDisplayRecallReasonDialog] = useState(false);
    const [displaySendBackReasonDialog, setDisplaySendBackReasonDialog] = useState(false);
    const [displayRejectReasonDialog, setDisplayRejectReasonDialog] = useState(false);
    const [isContractCreator, setIsContractCreator] = useState(false);
    const [conversation, setConversation] = useState({
        activeInternalTab: 1, // set default tab
        activeExternalTab: 1, // set default tab
        internalConversationLines: [],
        externalConversationLines: [],
        rowDataInternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalConversation: [],
        rowDataExternalAttachment: []
    });

    const initialValues = {
        isEdit: true,
        contractRequestNo: "",
        contractTitle: "",
        contractType: "",
        contractingEntity: "",
        contractingOwner: "",
        outsourcingContract: true,
        currency: "",
        contractValue: 0,
        contractStartDate: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
        contractEndDate: "",
        paymentTermName: "",
        paymentTermUuid: "",
        renewalOption: "None",
        createdBy: authReducer.userDetails.name,
        createdDate: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
        natureOfContract: false,
        project: "",
        projectName: "",
        projectRFQNo: "",
        costCenter: 0,
        totalUsedCurrencyCode: "",
        totalUsed: "0.00",
        // deliveryDate: "",
        deliveryAddress: "",
        supplier: "",
        supplierCode: "",
        supplierName: "",
        supplierDetails: {},
        deliveryAddressObject: {},
        productServiceDescription: "",
        approvalRoute: "", // approvalMatrixName on API
        approvalRouteSequence: "",
        status: "Draft Contract Request"
    };

    const procurementTypes = [
        { label: "Goods", value: "Goods" },
        { label: "Service", value: "Service" }
    ];

    // return a array
    const checkFulFilled = (obj) => {
        if (obj.status === RESPONSE_STATUS.FULFILLED) {
            return obj.value.data.data;
        }
        showToast("error", obj.value.response ? obj.value.response.data.message : obj.value.message);
        return [];
    };

    const getBudgetDetails = async (code) => {
        try {
            await getBudgetDetailsByProjectCode(contractRequestFormState.companyUuid, code);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const initData = (currentCompanyUUID, contractDataRes = null, isPending = false) => {
        const responseSuppliers = ExtVendorService.getExternalVendors(
            currentCompanyUUID
        );

        // need to consider this place
        const responseProjects = ManageProjectService.getCompanyProjectList(
            currentCompanyUUID
        );

        const responseCurrencies = CurrenciesService.getCurrencies(
            currentCompanyUUID
        );

        // const responseApprovalRoutes = ApprovalMatrixManagementService.getAllApprovalMatrixList(
        //     currentCompanyUUID
        // );

        const responseApprovalRoutes = ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
            currentCompanyUUID,
            "contract"
        );

        const responseUOMs = UOMDataService.getUOMRecords(
            currentCompanyUUID
        );

        const responseAddresses = AddressDataService.getCompanyAddresses(
            currentCompanyUUID
        );

        // const responseGLAccounts = GLDataService.getGLs(
        //     currentCompanyUUID
        // );

        const responseTaxRecords = TaxRecordDataService.getTaxRecords(
            currentCompanyUUID
        );

        Promise.allSettled([
            responseProjects,
            responseSuppliers,
            responseCurrencies,
            responseApprovalRoutes,
            responseUOMs,
            responseAddresses,
            // responseGLAccounts,
            responseTaxRecords
        ])
            .then(([resProject,
                resSuppliers,
                resCurrencies,
                resApprovalRoutes,
                resUOM,
                resAddresses,
                // resGlAccounts,
                resTaxRecords
            ]) => {
            // set the result to states
                setProjects(sortArrayByName(checkFulFilled(resProject).filter((x) => x.projectStatus === PROJECT_TYPES.FORECASTED), "projectTitle"));
                // filter to get the supplier only
                setSuppliers(sortArrayByName(checkFulFilled(resSuppliers).filter((x) => x.seller), "companyName", true));
                setCurrencies(sortArrayByName(checkFulFilled(resCurrencies).filter((x) => x.active), "currencyCode"));
                setApprovalRoutes(sortArrayByName(checkFulFilled(resApprovalRoutes).filter((x) => x.active), "approvalName"));
                setUoms(checkFulFilled(resUOM).filter((uom) => uom.active));
                setAddresses(sortArrayByName(checkFulFilled(resAddresses).filter((x) => x.active), "addressLabel"));
                // setGlAccounts(checkFulFilled(resGlAccounts));
                setTaxRecords(checkFulFilled(resTaxRecords).filter((tax) => tax.active));

                if (!isPending) {
                    if (contractDataRes) {
                        setContractData(contractDataRes);
                    }
                } else {
                    setContractData(contractDataRes);
                }

                setLoadButton(true);
            });

        setConversation((prev) => ({
            ...prev,
            activeInternalTab: 2,
            activeExternalTab: 2
        }));
    };

    const formatConversationText = (responseData, isInternal = true, isSupplier = false) => {
        const result = [];
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const { data, status, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                if (data) {
                    data.conversations.forEach((item) => {
                        result.push({
                            userName: item.sender,
                            userRole: item.designation || (isSupplier && "Supplier"),
                            userUuid: item.userUuid,
                            dateTime: convertToLocalTime(
                                new Date(isInternal ? item.date : item.createdAt),
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss
                            ),
                            comment: item.text,
                            externalConversation: true
                        });
                    });
                }
            } else {
                showToast("error", message);
            }
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return result;
    };

    const getConversationText = (currentCompanyUUID, contractReqUUID) => {
        let rowDataInternalConversation = [];
        let rowDataExternalConversation = [];

        // get conversation
        Promise.allSettled(
            [
                ConversationService.getDetailInternalConversation(
                    currentCompanyUUID, contractReqUUID
                ),
                ConversationService.getDetailExternalConversation(
                    currentCompanyUUID, contractReqUUID
                )
            ]
        ).then((response) => {
            const [resInternalConversation, resExternalConversation] = response;
            rowDataInternalConversation = formatConversationText(resInternalConversation);
            rowDataExternalConversation = rowDataExternalConversation.concat(
                formatConversationText(resExternalConversation, false)
            );

            setConversation((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation,
                rowDataExternalConversation
            }));
        });
    };

    const getContractRequestDetail = async (currentCompanyUUID, contractReqUUID) => {
        try {
            const contractReqDetailResult = await ContractModuleService
                .getContractRequestDetail(currentCompanyUUID, contractReqUUID);
            const contractDataRes = contractReqDetailResult.data.data;
            setIsContractCreator(contractDataRes?.contractCreator);
            setContractStatus(contractDataRes.status);
            switch (contractDataRes.status) {
            case CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT:
                initData(currentCompanyUUID, contractDataRes);
                break;
            case CONTRACT_REQUEST_LIST_STATUS.RECALLED:
                initData(currentCompanyUUID, contractDataRes);
                break;
            case CONTRACT_REQUEST_LIST_STATUS.PENDING_APPROVAL:
                initData(currentCompanyUUID, contractDataRes, true);
                break;
            case CONTRACT_REQUEST_LIST_STATUS.SEND_BACK:
                if (contractDataRes?.contractCreator) {
                    initData(currentCompanyUUID, contractDataRes);
                } else {
                    initData(currentCompanyUUID, contractDataRes, true);
                }
                break;
            default:
                initData(currentCompanyUUID, contractDataRes, true);
                break;
            }
        } catch (error) {
            console.log(error);
            showToast("error", error.message ? error.message : error.response.data.message);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID && !_.isEmpty(userDetails)) {
            setContractRequestFormState((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID
            }));

            // check mode create new / detail / so on ...
            const contractReqUUID = params.uuid;
            if (contractReqUUID) {
                setContractRequestFormState((prevStates) => ({
                    ...prevStates,
                    contractRequestUuid: contractReqUUID
                }));

                getContractRequestDetail(currentCompanyUUID, contractReqUUID);
                // get conversation text portion
                getConversationText(currentCompanyUUID, contractReqUUID);
            } else { // if not have uuid, create mode => call APIs
                initData(currentCompanyUUID);
            }
        }
    }, [permissionReducer, userDetails]);

    useEffect(() => {
        switch (contractStatus) {
        case CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT:
            requestFormRef?.current?.setFieldValue("isEdit", true);
            break;
        case CONTRACT_REQUEST_LIST_STATUS.RECALLED:
            if (contractData && contractData.contractCreator) {
                requestFormRef?.current?.setFieldValue("isEdit", true);
            }
            break;
        case CONTRACT_REQUEST_LIST_STATUS.SEND_BACK:
            if (isContractCreator) {
                requestFormRef?.current?.setFieldValue("isEdit", true);
            } else {
                requestFormRef?.current?.setFieldValue("isEdit", false);
            }
            break;
        case "":
            requestFormRef?.current?.setFieldValue("isEdit", true);
            break;
        default:
            requestFormRef?.current?.setFieldValue("isEdit", false);
        }
    }, [contractStatus]);

    const onChangeOutsourcingContract = (setFieldValue, value) => {
        // setDirty();
        setFieldValue("outsourcingContract", !value.outsourcingContract);
    };

    // const onChangeSubTotal = async (e, setFieldValue) => {

    // };

    const onChangeProject = async (e, setFieldValue, changeRequestTerms = true) => {
        // setDirty();
        // get project code
        const projectCode = e.target ? e.target.value : e;
        setFieldValue("project", projectCode);
        try {
            const response = await ProjectService.getProjectDetails(projectCode);
            const { data } = response.data;
            // const budget = `${data.currency} ${formatBudget(data.issuedPoBudget)}`;
            const issuedPoBudget = `${data.currency} ${formatBudget(data.issuedPoBudget ?? 0)}`;
            setFieldValue("currency", data.currency);
            setFieldValue("projectTitle", data.projectTitle);
            setFieldValue("projectName", data.projectTitle);
            setFieldValue("projectRFQNo", projectCode);
            setFieldValue("projectUuid", data.uuid);
            setFieldValue("projectCode", projectCode);
            // setFieldValue("costCenter", issuedPoBudget);
            setFieldValue("totalUsedCurrencyCode", data.currency);
            setFieldValue("totalUsed", issuedPoBudget);
            if (changeRequestTerms) {
                setFieldValue("deliveryDate", data.endDate);
                setFieldValue("deliveryAddress", data.projectAddressDto.addressLabel);
                setFieldValue("deliveryAddressObject", data.projectAddressDto);
            }
            getBudgetDetails(projectCode);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const prepareBody = async (values) => {
        const {
            rowDataInternalAttachment,
            rowDataExternalAttachment
        } = conversation;

        const approvalMatrix = approvalRoutes.find((x) => x.uuid === values.approvalRoute);
        const isProject = values.natureOfContract === "true" || values.natureOfContract === true;

        const objectAddress = addresses.find(
            (x) => x.addressLabel === values.deliveryAddress
        );
        // preparing the body
        const body = {
            contractRequestUuid: contractRequestFormState.contractRequestUuid,
            contractTitle: values.contractTitle,
            contractType: values.contractType,
            currencyCode: values.currency,
            // contractValue: values.contractValue,
            contractStartDate: convertToLocalTime(
                values.contractStartDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            ),
            contractEndDate: convertToLocalTime(
                values.contractEndDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            ),
            paymentTermName: values.paymentTermName,
            paymentTermUuid: values.paymentTermUuid,
            renewalOption: values.renewalOption,
            project: isProject,
            projectName: isProject ? values.projectName : "",
            projectCode: isProject ? values.projectCode : "",
            procurementType: values.procurementType,
            projectUuid: isProject ? values.projectUuid : "",
            projectRfqNo: isProject ? values.projectRFQNo : "",
            // projectDeliveryDate: isProject ? values.deliveryDate : "",
            // connectedVendor: true, // need to confirm
            // projectDeliveryAddress: values.deliveryAddressObject.addressLabel
            //     || values.deliveryAddress,
            deliveryAddress: {
                ...objectAddress
            },
            totalUsedCurrencyCode: (values.totalUsed && values.totalUsed !== 0 && isProject)
                ? values.totalUsed.toString()
                    .split(" ")[0] : "",
            totalUsed: (values.totalUsed && values.totalUsed !== 0 && isProject)
                ? values.totalUsed.toString()
                    .split(" ")[1]
                    .replace(/,/g, "")
                    .replace(".00", "") : 0,
            productServiceDescription: values.productServiceDescription,
            approvalRouteUuid: approvalMatrix.uuid,
            // approvalRouteName: approvalMatrix.approvalName,
            supplierInformation: {
                supplierCode: values.supplierCode,
                supplierVendorConnectionUuid: values.supplierDetails.uuid,
                supplierCompanyUuid: values.supplierDetails.vendorCompanyUuid,
                companyName: values.supplierDetails.companyName,
                taxRegNo: values.supplierDetails.gstRegNo,
                companyAddress: {
                    ...values.supplierDetails.addressesDto[0]
                },
                contactInformation: {
                    contactName: values.supplierDetails.supplierUserList[0].fullName,
                    contactEmail: values.supplierDetails.supplierUserList[0].emailAddress,
                    contactNumber: values.supplierDetails.supplierUserList[0].workNumber
                }
            },
            // supplierName: values.supplierDetails.companyName,
            // supplierUuid: values.supplierDetails.uuid,
            connected: values.supplierDetails.connected,
            contractItemList: [],
            documentList: [],
            note: values.note,
            converted: false
        };

        delete body.deliveryAddress.uuid;
        delete body.supplierInformation.uuid;

        const itemRequests = rowContractItems.map(
            ({
                itemCode,
                itemName,
                itemDescription,
                itemModel,
                itemSize,
                itemBrand,
                trade,
                manualItem,
                uomCode,
                itemQuantity,
                currencyCode,
                itemUnitPrice,
                taxCode,
                exchangeRate,
                // address,
                // requestedDeliveryDate,
                // glAccount,
                note
            }) => {
                const item = ({
                    itemCode,
                    itemName,
                    itemDescription: (itemDescription || ""),
                    itemModel,
                    itemSize,
                    itemBrand,
                    trade,
                    uomCode: uomCode?.uomCode || uomCode,
                    itemQuantity: Number(itemQuantity || 0),
                    currencyCode: _.isString(currencyCode) ? currencyCode
                        : currencyCode.currencyCode,
                    itemUnitPrice: Number(itemUnitPrice),
                    taxCode: taxCode?.taxCode,
                    taxCodeUuid: taxCode?.uuid,
                    taxPercentage: Number(taxCode?.taxRate),
                    exchangeRate: exchangeRate || 0,
                    // deliveryAddress: address?.addressLabel,
                    // requestedDeliveryDate: convertToLocalTime(
                    //     requestedDeliveryDate, CUSTOM_CONSTANTS.DDMMYYYY
                    // ),
                    // glAccountNumber: glAccount?.accountNumber,
                    // glAccountUuid: glAccount?.uuid,
                    note,
                    manualItem
                });
                // if (!item.deliveryAddress) delete item.deliveryAddress;
                // if (!item.requestedDeliveryDate) delete item.requestedDeliveryDate;
                if (!item.currencyCode) delete item.currencyCode;
                if (!item.taxCode) delete item.taxCode;
                if (!item.uomCode) delete item.uomCode;
                // if (!item.glAccountUuid) delete item.glAccountUuid;
                // if (!item.glAccountNumber) delete item.glAccountNumber;

                return item;
            }
        );

        await itemRequestSchema.validate(itemRequests);
        body.contractItemList = itemRequests;

        const addedDocument = rowDataInternalAttachment.concat(rowDataExternalAttachment);
        const addedDocumentFormatted = addedDocument.map((
            {
                fileDescription,
                fileLabel,
                guid,
                externalDocument
            }
        ) => ({
            fileDescription, fileLabel, guid, externalDocument
        }));
        body.documentList.push(...addedDocumentFormatted);

        if (body.contractRequestUuid === "") delete body.contractRequestUuid;
        return body;
    };

    const onCreatePressHandler = async (values, isDraft = false) => {
        try {
            const {
                companyUuid
            } = contractRequestFormState;

            const body = await prepareBody(values);
            const res = isDraft
                ? await ContractModuleService.submitContractDraftRequest(companyUuid, body)
                : await ContractModuleService.submitContractRequest(companyUuid, body);

            if (res.data.status === RESPONSE_STATUS.OK) {
                const { data } = res.data;
                if (conversation.externalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: data.contractRequestUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversation.externalConversationLines
                    };
                    await ConversationService
                        .createExternalConversation(companyUuid, conversationBody);
                }
                if (conversation.internalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: data.contractRequestUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversation.internalConversationLines
                    };
                    await ConversationService
                        .createInternalConversation(companyUuid, conversationBody);
                }
                setPristine();
                showToast("success", isDraft ? t("The contract request has been saved successfully") : res.data.message);
                setTimeout(() => {
                    history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_REQUEST_LIST);
                }, 1000);
            } else {
                showToast("error", res.data.message);
            }
        } catch (error) {
            console.log(error);
            showToast("error", error.message ? error.message : error.response.data.message);
        }
    };

    const convertDate = (date) => {
        if (date && date !== "") {
            const partsOfDate = date.split("/");
            return `${partsOfDate[2]}/${partsOfDate[1]}/${partsOfDate[0]}`;
        }
        return "";
    };

    const convertToContract = async () => {
        try {
            const response = await ContractModuleService
                .convertCRToContract(contractRequestFormState.companyUuid,
                    contractRequestFormState.contractRequestUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                setPristine();
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const approveContractRequest = async () => {
        try {
            const response = await ContractModuleService
                .approveContractRequest(contractRequestFormState.companyUuid,
                    contractRequestFormState.contractRequestUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                showToast("success", "Approval successfully!");
                setPristine();
                setTimeout(() => {
                    history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_REQUEST_LIST);
                }, 1000);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const rejectContractRequest = async (reason) => {
        if (rejectObj.reasonReject) {
            setRejectObj((prevStates) => ({
                ...prevStates,
                showErrorReasonReject: false
            }));
            try {
                const response = await ContractModuleService
                    .rejectContractRequest(contractRequestFormState.companyUuid,
                        contractRequestFormState.contractRequestUuid);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    const conversationLines = [];
                    conversationLines.push({ text: reason });
                    const conversationBody = {
                        referenceId: contractRequestFormState.contractRequestUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversationLines
                    };
                    await ConversationService
                        .createInternalConversation(contractRequestFormState.companyUuid,
                            conversationBody);

                    setPristine();
                    history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_REQUEST_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };

    const sendBackContractRequest = async (reason) => {
        if (sendBackObj.reasonSendBack) {
            setRejectObj((prevStates) => ({
                ...prevStates,
                showErrorReasonSendBack: false
            }));
            try {
                const response = await ContractModuleService
                    .sendBackContractRequest(contractRequestFormState.companyUuid,
                        contractRequestFormState.contractRequestUuid);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    const conversationLines = [];
                    conversationLines.push({ text: reason });
                    const conversationBody = {
                        referenceId: contractRequestFormState.contractRequestUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversationLines
                    };
                    await ConversationService
                        .createInternalConversation(contractRequestFormState.companyUuid,
                            conversationBody);

                    setPristine();
                    history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_REQUEST_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };

    const recallContractRequest = async () => {
        try {
            const response = await ContractModuleService
                .recallContractRequest(contractRequestFormState.companyUuid,
                    contractRequestFormState.contractRequestUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                setPristine();
                const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
                const contractReqUUID = params.uuid;
                getContractRequestDetail(currentCompanyUUID, contractReqUUID);
                setDisplayRecallReasonDialog(false);
                // history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_REQUEST_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const cancelContractRequest = async () => {
        try {
            const response = await ContractModuleService
                .cancelContractRequest(contractRequestFormState.companyUuid,
                    contractRequestFormState.contractRequestUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                setPristine();
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_REQUEST_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
                validateOnChange
                onValidationError={(errorValues) => {
                    console.log(errorValues);
                }}
            >
                {({
                    errors, values, touched, dirty, handleChange, setFieldValue, handleSubmit
                }) => {
                    useEffect(() => {
                        const displaySubTotal = formatDisplayDecimal(Number(subTotal), 2);
                        setFieldValue("contractValue", displaySubTotal === "" ? "0.00" : displaySubTotal);
                    }, [subTotal]);

                    useEffect(() => {
                        if (!values.createdBy) setFieldValue("createdBy", authReducer?.userDetails?.name);
                    }, [authReducer]);

                    useEffect(() => {
                        async function getExternalVendorDetails() {
                            await ExtVendorService.getExternalVendorDetails(
                                contractRequestFormState.companyUuid,
                                contractData.supplierInformation.supplierVendorConnectionUuid
                            ).then((dataRes) => {
                                const { data } = dataRes.data;
                                const supplier = suppliers.find((item) => item.uuid
                                    === contractData.supplierInformation.supplierVendorConnectionUuid);
                                // const { defaultSupplierUser } = supplier ?? { };
                                setFieldValue("supplierCode", data.companyCode);
                                setFieldValue("supplier", data.companyCode);
                                setFieldValue("supplierUuid", supplier?.uuid || "");
                                setFieldValue("supplierName", data.companyName);
                                // setFieldValue("contactName", defaultSupplierUser.fullName);
                                // setFieldValue("contactEmail", defaultSupplierUser.emailAddress);
                                // setFieldValue("contactNumber", defaultSupplierUser.workNumber);
                                setFieldValue("country", data.countryOfOrigin);
                                setFieldValue("companyRegNo", data.uen);
                                // setFieldValue("countryCode", defaultSupplierUser.countryCode);
                                setFieldValue("supplierDetails", data);
                            });
                        }
                        if (contractData) {
                            setFieldValue("contractRequestNo", contractData?.contractRequestNumber || "");
                            setFieldValue("contractTitle", contractData.contractTitle);
                            setFieldValue("contractingEntity", contractData.contractingEntity);
                            setFieldValue("contractingOwner", contractData.contractingOwner);
                            setFieldValue("contractType", contractData.contractType);
                            setFieldValue("outsourcingContract", contractData.outSourcingContract);
                            setFieldValue("currency", contractData.currencyCode);
                            setFieldValue("contractValue", formatDisplayDecimal(contractData.contractValue));
                            setFieldValue("contractStartDate", contractData.contractStartDate
                                ? convertToLocalTime(
                                    contractData.contractStartDate,
                                    CUSTOM_CONSTANTS.YYYYMMDD
                                )
                                : formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD));
                            setFieldValue("contractEndDate", contractData.contractEndDate
                                ? convertToLocalTime(
                                    contractData.contractEndDate,
                                    CUSTOM_CONSTANTS.YYYYMMDD
                                )
                                : "");
                            setFieldValue("paymentTermUuid", contractData.paymentTermUuid);
                            setFieldValue("paymentTermName", contractData.paymentTermName);
                            setFieldValue("renewalOption", contractData.renewalOption);
                            setFieldValue("createdBy", contractData.createdBy ? contractData.createdBy : "");
                            setFieldValue("natureOfContract", contractData.project);
                            if (contractData.project === true || contractData.project === "true") {
                                setFieldValue("projectName", contractData.projectName);
                                setFieldValue("projectTitle", contractData.projectName);
                                setFieldValue("project", contractData.projectCode);
                                setFieldValue("projectCode", contractData.projectCode);
                                setFieldValue("projectUuid", contractData.projectUuid);
                                setFieldValue("projectRFQNo", contractData.projectRfqNo);
                                setFieldValue("totalUsed", formatDisplayDecimal(contractData.totalUsed, 2, contractData.totalUsedCurrencyCode));
                                // setFieldValue("deliveryDate", convertToLocalTime(
                                //     contractData.projectDeliveryDate,
                                //     CUSTOM_CONSTANTS.YYYYMMDD
                                // ));

                                // Budget Details
                                onChangeProject(contractData.projectCode, setFieldValue, false);
                            }
                            // address will not along with project event project === false
                            setFieldValue("deliveryAddress", contractData.deliveryAddress?.addressLabel || "");
                            setFieldValue("deliveryAddressObject", contractData.deliveryAddress);

                            setFieldValue("productServiceDescription", contractData.productServiceDescription);
                            setFieldValue("approvalRoute", contractData.approvalRouteUuid);
                            setFieldValue("approvalRouteName", contractData.approvalRouteName);
                            setFieldValue("approvalRouteSequence", contractData.approvalRouteSequence);
                            setFieldValue("status", contractData.status);
                            setFieldValue("procurementType", contractData.procurementType);
                            setFieldValue("note", contractData.note);
                            setFieldValue("createdBy", contractData.createdByName);
                            setFieldValue("createdDate", convertToLocalTime(
                                contractData.createdDate,
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss
                            ));

                            // Supplier Information
                            getExternalVendorDetails();

                            // Contract Items
                            const rowContractItemsFormat = contractData.contractItemList
                                .map((item) => ({
                                    uuid: uuidv4(),
                                    ...item,
                                    requestedDeliveryDate: convertDate(item.requestedDeliveryDate),
                                    taxCode: taxRecords.length > 0 ? taxRecords.find(
                                        (x) => x.taxCode.toLowerCase()
                                        === item.taxCode?.toLowerCase()
                                    ) : item.taxCode,
                                    // glAccount: glAccounts.find(
                                    //     (x) => x.uuid === item.glAccountUuid
                                    // ),
                                    address: addresses.find(
                                        (x) => x.addressLabel === item.deliveryAddress
                                    )
                                }));
                            setRowContractItems(rowContractItemsFormat);
                            const newCatalogueItems = [...catalogueItems];
                            newCatalogueItems.forEach(
                                (item, index) => {
                                    for (let i = 0; i < contractData.contractItemList.length; i++) {
                                        if (item.catalogueItemCode === contractData
                                            .contractItemList[i].catalogueItemCode) {
                                            newCatalogueItems[index].isSelected = true;
                                        }
                                    }
                                }
                            );

                            setCatalogueItems(newCatalogueItems);

                            // re-calculator for Contract Items
                            setRefreshSummaryItems(true);

                            // conversations
                            const newRowExternalConversationData = [];
                            const newRowInternalConversationData = [];
                            for (let i = 0; i < contractData.documentList.length; i++) {
                                const docData = contractData.documentList[i];
                                const formatData = {
                                    guid: docData.guid,
                                    fileLabel: docData.fileLabel,
                                    fileDescription: docData.fileDescription,
                                    uploadedOn: convertToLocalTime(new Date(docData.upLoadedOn),
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    uploadedBy: docData.uploadedByName,
                                    uploaderUuid: docData.uploadedByUuid,
                                    externalDocument: docData.externalDocument,
                                    uuid: uuidv4(),
                                    isNew: false
                                };

                                if (docData.externalDocument) {
                                    newRowExternalConversationData.push(formatData);
                                } else {
                                    newRowInternalConversationData.push(formatData);
                                }
                            }

                            setConversation((prevStates) => ({
                                ...prevStates,
                                rowDataExternalAttachment: newRowExternalConversationData,
                                rowDataInternalAttachment: newRowInternalConversationData
                            }));

                            // audit trail
                            const rowsAuditTrailFormat = contractData.auditTrailList
                                .map((item) => ({
                                    ...item,
                                    userRole: item.role,
                                    dateTime: convertToLocalTime(
                                        item.createdDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    )
                                }));
                            setRowDataAuditTrail(rowsAuditTrailFormat);
                        }
                        setTimeout(() => {
                            setIsInit(true);
                        });
                    }, [contractData]);

                    useEffect(() => {
                        if (isInit && values.isEdit) {
                            setDirty();
                        }
                    }, [values]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col
                                    md={12}
                                    lg={12}
                                >

                                    <Row>
                                        <Col
                                            md={6}
                                            lg={6}
                                        >
                                            <HeaderMain
                                                title={t("Contract Request Form")}
                                                className="mb-4"
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <GeneralInformation
                                t={t}
                                disabled={!values.isEdit}
                                values={values}
                                touched={touched}
                                errors={errors}
                                setFieldValue={setFieldValue}
                                contractingType={contractingType}
                                renewalOptions={contractRequestFormState.renewalOptions}
                                natureOfContract={contractRequestFormState.natureOfContract}
                                addresses={addresses}
                                currencies={currencies}
                                projects={projects}
                                approvalRoutes={approvalRoutes}
                                handleChange={handleChange}
                                onChangeOutsourcingContract={onChangeOutsourcingContract}
                                onChangeProject={onChangeProject}
                                contractStatus={contractStatus}
                                isContractCreator={isContractCreator}
                                suppliers={suppliers}
                                companyUuid={contractRequestFormState.companyUuid}
                                procurementTypes={procurementTypes}
                            />
                            {
                                values.project !== ""
                                && (
                                    <>
                                        <HeaderSecondary
                                            title={t("BudgetDetails")}
                                            className="mb-2"
                                        />
                                        <Row className="mb-4">
                                            <Col xs={12}>
                                                {/* Budget Details */}
                                                <BudgetDetails
                                                    rowDataProject={rowDataProject}
                                                    rowDataTrade={rowDataTrade}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )
                            }
                            <ContractItems
                                t={t}
                                values={values}
                                addresses={addresses}
                                uoms={uoms}
                                taxRecords={taxRecords}
                                // glAccounts={glAccounts}
                                currencies={currencies}
                                catalogueItems={catalogueItems}
                                setCatalogueItems={setCatalogueItems}
                                rowContractItems={rowContractItems}
                                setRowContractItems={setRowContractItems}
                                setSubTotal={setSubTotal}
                                refreshSummaryItems={refreshSummaryItems}
                                // onChangeSubTotal={onChangeSubTotal}
                                modeView={contractRequestFormState.modeView}
                                setDirty={setDirty}
                            />
                            {/* Conversations */}
                            <ContractingConversion
                                t={t}
                                conversation={conversation}
                                userDetails={userDetails}
                                setConversation={setConversation}
                                showToast={showToast}
                                disabled={!values.isEdit}
                                setDirty={setDirty}
                            />
                            {/* Audit Trail */}
                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <AuditTrail
                                        rowData={rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                        fullSize
                                    />
                                </Col>
                            </Row>

                            {/* Recall */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displayRecallReasonDialog}
                                onHide={() => setDisplayRecallReasonDialog(false)}
                                title={t("Recall Request")}
                                content="Do you wish to recall this request?"
                                titleColor="primary"
                                positiveProps={
                                    {
                                        onPositiveAction:
                                            () => setDisplayRecallReasonDialog(false),
                                        contentPositive: t("No"),
                                        colorPositive: "danger"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            recallContractRequest();
                                        },
                                        contentNegative: t("Yes"),
                                        colorNegative: "primary"
                                    }
                                }
                                size="xs"
                                titleCenter
                            />

                            {/* Cancel */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displayCancelReasonDialog}
                                onHide={() => setDisplayCancelReasonDialog(false)}
                                title={t("Cancel Request")}
                                content="Do you wish to cancel this request?"
                                positiveProps={
                                    {
                                        onPositiveAction:
                                            () => setDisplayCancelReasonDialog(false),
                                        contentPositive: t("No"),
                                        colorPositive: "danger"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            cancelContractRequest();
                                        },
                                        contentNegative: t("Yes"),
                                        colorNegative: "primary"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleColor="primary"
                            />

                            {/* SendBack */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displaySendBackReasonDialog}
                                onHide={() => setDisplaySendBackReasonDialog(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction:
                                            () => setDisplaySendBackReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            sendBackContractRequest(sendBackObj.reasonSendBack);
                                        },
                                        contentNegative: t("SendBack"),
                                        colorNegative: "warning"
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
                                            "is-invalid": sendBackObj.showErrorReasonSendBack && !sendBackObj.reasonSendBack
                                        })
                                    }
                                    placeholder={t("Please enter reason...")}
                                    value={sendBackObj.reasonSendBack}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setSendBackObj((prevStates) => ({
                                            ...prevStates,
                                            reasonSendBack: value
                                        }));
                                    }}
                                />
                                {
                                    sendBackObj.showErrorReasonSendBack
                                    && !sendBackObj.reasonSendBack
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            {/* Reject */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displayRejectReasonDialog}
                                onHide={() => setDisplayRejectReasonDialog(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => setDisplayRejectReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            rejectContractRequest(rejectObj.reasonReject);
                                        },
                                        contentNegative: t("Reject"),
                                        colorNegative: "danger"
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
                                            "is-invalid": rejectObj.showErrorReasonReject && !rejectObj.reasonReject
                                        })
                                    }
                                    placeholder={t("Please enter reason..")}
                                    value={rejectObj.reasonReject}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setRejectObj((prevStates) => ({
                                            ...prevStates,
                                            reasonReject: value
                                        }));
                                    }}
                                />
                                {
                                    rejectObj.showErrorReasonReject
                                    && !rejectObj.reasonReject
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            {/* Action Buttons */}
                            {loadButton && (
                                <StickyFooterSubmit
                                    t={t}
                                    errors={errors}
                                    history={history}
                                    dirty={dirty}
                                    values={values}
                                    handleSubmit={handleSubmit}
                                    onSaveAsDraftPressHandler={() => onCreatePressHandler(values,
                                        true)}
                                    onCreatePressHandler={() => onCreatePressHandler(values, false)}
                                    showToast={showToast}
                                    setDisplayRejectReasonDialog={setDisplayRejectReasonDialog}
                                    setDisplaySendBackReasonDialog={setDisplaySendBackReasonDialog}
                                    setDisplayRecallReasonDialog={setDisplayRecallReasonDialog}
                                    setDisplayCancelReasonDialog={setDisplayCancelReasonDialog}
                                    contractStatus={contractStatus}
                                    approveContractRequest={approveContractRequest}
                                    convertToContract={convertToContract}
                                    contractData={contractData}
                                />
                            )}

                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
}

export default ContractFormRequest;
