/* eslint-disable max-len */
import React, { useEffect, useMemo, useState } from "react";

import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";

import uuid from "uuid/v4";
import PreRequisitionService from "services/PreRequisitionService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import CreditNoteService from "services/CreditNoteService/CreditNoteService";
import PaymentService from "services/PaymentService/PaymentService";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import InvoiceService from "services/InvoiceService/InvoiceService";
import { useSelector } from "react-redux";
import {
    PPR_ROUTING
} from "services/urlConfig/UrlFeatureConfigurations/PurchasePreRequision/PurchasePreRequisitionUrlConfig";
import { GOODS_RECEIPT_ROUTES } from "routes/P2P/GoodReceipts";
import { PR_ROUTES } from "routes/P2P/PurchaseRequest";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { INVOICE_ROUTES } from "routes/P2P/Invoice";
import { CREDIT_NOTE_ROUTES } from "routes/P2P/CreditNote";
import PAYMENT_ROUTE from "routes/P2P/Payment/route";
import RequestForQuotationService from "services/RequestForQuotationService";
import { RFQ_ROUTES } from "routes/P2P/RequestForQuotation";
import { CONTRACT_MODULE_ROUTE, ContractModuleService } from "services/ContractModuleService";
import classes from "./DashboardMain.scss";

const DashboardMain1 = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const [cards, setCards] = useState([]);

    const navigate = (url) => {
        const domain = `${window.location.protocol}//${window.location.host}`;
        if (url.indexOf(domain) === 0 || url[0] === "/") {
            history.push(url.replace(domain, ""));
        } else {
            window.location.href = url;
        }
    };

    const permissionReducer = useSelector((state) => state.permissionReducer);
    const currentCompanyUuid = useMemo(
        () => permissionReducer?.currentCompany?.companyUuid,
        [permissionReducer]
    );
    const isBuyer = useMemo(() => permissionReducer?.isBuyer, [permissionReducer]);

    const cardSummary = (rows) => rows
        ?.map((row) => row?.count || 0)
        ?.reduce((prev, cur) => prev + cur, 0);

    const permissions = {
        ppr: usePermission(FEATURE.PPR),
        pr: usePermission(FEATURE.PR),
        po: usePermission(FEATURE.PO),
        do: usePermission(FEATURE.DO),
        gr: usePermission(FEATURE.GR),
        inv: usePermission(FEATURE.INV),
        cn: usePermission(FEATURE.CREDIT_NOTE),
        payment: usePermission(FEATURE.MPAYM),
        rfq: usePermission(FEATURE.RFQF),
        contract: usePermission(FEATURE.CONTRACT)
    };

    const initData = async () => {
        if (currentCompanyUuid && typeof isBuyer === "boolean") {
            // Dashboard for buyer
            if (isBuyer === true) {
                const [
                    PPR,
                    PRToConverted,
                    RFQ,
                    DOForCreateGR,
                    PR,
                    PO,
                    GR,
                    InvPendingApproval,
                    CN,
                    Payment,
                    PendingPayment,
                    ContractRequest,
                    Contract
                ] = await Promise.all([
                    permissions.ppr.read && PreRequisitionService
                        .getPPRList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.pr.read && PrePurchaseOrderService
                        .getPRToBeConvertedList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.rfq.read && RequestForQuotationService
                        .getRFQsList(currentCompanyUuid, isBuyer)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.gr.read && GoodsReceiptService
                        .getListDOForCreatingGR(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.pr.read && PurchaseRequestService
                        .getListPurchaseRequisition(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.po.read && PurchaseOrderService
                        .getPOList(isBuyer, currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.gr.read && GoodsReceiptService
                        .getGRList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.inv.read && InvoiceService
                        .getInvoicePendingApprovalList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.cn.read && CreditNoteService
                        .getCNList(currentCompanyUuid, isBuyer)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.payment.read && PaymentService
                        .getPaymentList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.payment.read && PaymentService
                        .getPendingPaymentList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.contract.read && ContractModuleService
                        .getContractRequestList(currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {}),
                    permissions.contract.read && ContractModuleService
                        .getContractListByType(isBuyer, currentCompanyUuid)
                        .then((res) => res?.data?.data).catch(() => {})
                ]);
                let countCN = 0;
                let statusCN = "";
                if (permissions.cn.read && permissions.cn.write && permissions.cn.approve) {
                    countCN = CN?.filter?.(({ status }) => ["PENDING_APPROVAL", "PENDING_CN_APPROVAL"].includes(status))?.length;
                    statusCN = "ALL_PENDING";
                } else if (permissions.cn.read && permissions.cn.write) {
                    countCN = CN?.filter?.(({ status }) => status === "PENDING_APPROVAL")?.length;
                    statusCN = "PENDING_APPROVAL";
                } else if (permissions.cn.read && permissions.cn.approve) {
                    countCN = CN?.filter?.(({ status }) => status === "PENDING_CN_APPROVAL")?.length;
                    statusCN = "PENDING_CN_APPROVAL";
                }
                setCards([
                    {
                        name: "To Convert",
                        rows: [
                            {
                                name: "Pre-Purchase Requisition to Purchase Requisition",
                                url: `${PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST}?status=SUBMITTED_TO_PURCHASER_FOR_REVIEW`,
                                hasPermission: permissions.pr.read && permissions.pr.write,
                                count: PPR?.filter?.(({ status }) => status === "SUBMITTED_TO_PURCHASER_FOR_REVIEW")?.length
                            },
                            {
                                name: "Purchase Requisition to Purchase Order",
                                url: PURCHASE_ORDER_ROUTES.PR_TO_BE_CONVERTED_LIST,
                                hasPermission: permissions.po.read && permissions.po.write,
                                count: PRToConverted?.length
                            },
                            {
                                name: "RFQ Shortlisted to Purchase Order",
                                url: `${RFQ_ROUTES.RFQ_LIST}?status=SHORTLISTED`,
                                hasPermission: permissions.po.read && permissions.po.write
                                    && permissions.rfq.read && permissions.rfq.write,
                                count: RFQ?.filter?.(({ rfqStatus }) => rfqStatus === "SHORTLISTED")?.length
                            },
                            {
                                name: "Contract Request to Contract",
                                url: `${CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_LIST}?status=Contract Pending Conversion`,
                                hasPermission: permissions.contract.read && permissions.contract.write,
                                count: ContractRequest?.filter?.(({ status }) => status === "Contract Pending Conversion")?.length
                            }
                        ]
                    },
                    {
                        name: "To Receive",
                        rows: [
                            {
                                name: "DO Pending Receipt",
                                url: GOODS_RECEIPT_ROUTES.GR_FROM_DO_LIST,
                                hasPermission: permissions.gr.read && permissions.gr.write,
                                count: DOForCreateGR?.filter?.(({ status }) => status === "PENDING_RECEIPT")?.length
                            },
                            {
                                name: "RFQ Pending Quotation",
                                url: `${RFQ_ROUTES.RFQ_LIST}?status=PENDING_QUOTATION,QUOTATION_IN_PROGRESS`,
                                hasPermission: permissions.rfq.read && permissions.rfq.write,
                                count: RFQ?.filter?.(({ rfqStatus }) => ["PENDING_QUOTATION", "QUOTATION_IN_PROGRESS"].includes(rfqStatus))?.length
                            }
                        ]
                    },
                    {
                        name: "Pending Approval For",
                        rows: [
                            {
                                name: "Pre-Purchase Requisition",
                                url: `${PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST}?status=PENDING_APPROVAL`,
                                hasPermission: permissions.ppr.read && permissions.ppr.approve,
                                count: PPR?.filter?.(({ status }) => status === "PENDING_APPROVAL")?.length
                            },
                            {
                                name: "Purchase Requisition",
                                url: `${PR_ROUTES.PURCHASE_REQUISITION_LIST}?status=PENDING_APPROVAL`,
                                hasPermission: permissions.pr.read && permissions.pr.approve,
                                count: PR?.filter?.(({ prStatus }) => prStatus === "PENDING_APPROVAL")?.length
                            },
                            {
                                name: "Purchase Order",
                                url: `${PURCHASE_ORDER_ROUTES.PO_LIST}?status=PENDING_APPROVAL`,
                                hasPermission: permissions.po.read && permissions.po.approve,
                                count: PO?.filter?.(({ status }) => status === "PENDING_APPROVAL")?.length
                            },
                            {
                                name: "Goods Receipt",
                                url: `${GOODS_RECEIPT_ROUTES.GR_LIST}?status=PENDING_APPROVAL`,
                                hasPermission: permissions.gr.read && permissions.gr.approve,
                                count: GR?.filter?.(({ grStatus }) => grStatus === "PENDING_APPROVAL")?.length
                            },
                            {
                                name: "Invoice",
                                url: `${INVOICE_ROUTES.INVOICE_PENDING_APPROVAL}?status=${["PENDING_APPROVAL", "PENDING_TWO_WAY", "PENDING_THREE_WAY"].join(",")}`,
                                hasPermission: permissions.inv.read && permissions.inv.approve,
                                count: InvPendingApproval?.filter?.(({ invoiceStatus }) => invoiceStatus.includes("PENDING"))?.length
                            },
                            {
                                name: "Credit Note",
                                url: `${CREDIT_NOTE_ROUTES.CN_LIST}?status=${statusCN}`,
                                hasPermission: (permissions.cn.read && permissions.cn.approve) || (permissions.cn.read && permissions.cn.write),
                                count: countCN
                            },
                            {
                                name: "Payment",
                                url: `${PAYMENT_ROUTE.PAYMENT_LIST}?status=PENDING_APPROVAL`,
                                hasPermission: permissions.payment.read && permissions.payment.approve,
                                count: Payment?.filter?.(({ status }) => status === "PENDING_APPROVAL")?.length
                            },
                            {
                                name: "RFQ Shortlisted",
                                url: `${RFQ_ROUTES.RFQ_LIST}?status=PENDING_APPROVAL`,
                                hasPermission: permissions.rfq.read && permissions.rfq.approve,
                                count: RFQ?.filter?.(({ rfqStatus }) => ["PENDING_APPROVAL"].includes(rfqStatus))?.length
                            },
                            {
                                name: "Contract Request",
                                url: `${CONTRACT_MODULE_ROUTE.CONTRACT_REQUEST_LIST}?status=Request Pending Approval`,
                                hasPermission: permissions.contract.read
                                    && permissions.contract.approve,
                                count: ContractRequest?.filter?.(({ status }) => status === "Request Pending Approval")?.length
                            },
                            {
                                name: "Contract",
                                url: `${CONTRACT_MODULE_ROUTE.CONTRACT_LIST}?status=Pending approval`,
                                hasPermission: permissions.contract.read
                                    && permissions.contract.approve,
                                count: Contract?.filter?.(({ contractStatus }) => contractStatus === "Pending approval")?.length
                            }
                        ]
                    },
                    {
                        name: "Overdue",
                        rows: [
                            {
                                name: "Invoice Pending Payment",
                                url: `${PAYMENT_ROUTE.PENDING_PAYMENT_LIST}?overdue=true`,
                                hasPermission: permissions.payment.read && permissions.payment.write,
                                count: PendingPayment?.filter?.(({ overdueDays }) => !!overdueDays)?.length
                            }
                        ],
                        color: "light-pink"
                    }
                ]);
            }
            // Dashboard for supplier
            if (isBuyer === false) {
                const [
                    PO,
                    Contract
                ] = await Promise.all([
                    permissions.po.read && PurchaseOrderService
                        .getPOList(isBuyer, currentCompanyUuid)
                        .then((res) => res?.data?.data),
                    permissions.contract.read && ContractModuleService
                        .getContractListByType(isBuyer, currentCompanyUuid)
                        .then((res) => res?.data?.data)
                ]);
                setCards([
                    {
                        name: "Pending Acknowledgement",
                        rows: [
                            {
                                name: "Purchase Order",
                                url: `${PURCHASE_ORDER_ROUTES.PO_LIST}?status=ISSUED&supplierAck=NOT_VIEWED`,
                                hasPermission: permissions.po.read,
                                count: PO?.filter?.(({ status, supplierAck }) => status === "ISSUED" && supplierAck === "NOT_VIEWED")?.length
                            },
                            {
                                name: "Contract",
                                url: `${CONTRACT_MODULE_ROUTE.CONTRACT_LIST}?status=Pending acknowledgment`,
                                hasPermission: permissions.contract.read
                                    && permissions.contract.approve,
                                count: Contract?.filter?.(({ contractStatus }) => contractStatus === "Pending acknowledgment")?.length
                            }
                        ]
                    }
                ]);
            }
        }
    };

    useEffect(() => {
        initData().catch(console.error);
    },
    [currentCompanyUuid, isBuyer]);

    return (
        <>
            <Container fluid={false}>
                <HeaderMain
                    title={t("Dashboard")}
                    className="mb-3"
                />
                <div className="row">
                    {cards?.map(({ name, rows, color = "secondary" }) => (
                        <div className="col-md-6" key={uuid()}>
                            <Card className={`card-doxa card-doxa--${color} mb-3`}>
                                <CardHeader tag="h6" className="pb-4">
                                    {name}
                                    <span className="card-doxa-header-number">
                                        {cardSummary(rows)}
                                    </span>
                                </CardHeader>
                                <CardBody>
                                    {
                                        rows.map((row) => row?.hasPermission && (
                                            <Row onClick={() => navigate(row.url)} key={uuid()} className={`d-flex justify-content-between align-items-end position-relative ${classes["link-item"]}`}>
                                                <div className="d-flex">
                                                    <div className="d-flex align-items-center mr-2">
                                                        <FontAwesomeIcon icon={faFile} className={classes["icon-inside-circle"]} size="3x" transform="shrink-10.5" />
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        {row.name}
                                                    </div>
                                                </div>
                                                <div className={`${classes.action}`}>
                                                    {`${row.count ?? 0} Record${row.count > 1 ? "s" : ""}`}
                                                </div>
                                            </Row>
                                        ))
                                    }
                                </CardBody>
                            </Card>
                        </div>

                    ))}
                </div>
            </Container>
        </>
    );
};
export default DashboardMain1;
