import React, {
    forwardRef, useEffect, useImperativeHandle, useState
} from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import { Col, Row, Table } from "reactstrap";
import { formatDateTime, formatDisplayDecimal, isNullOrUndefinedOrEmpty, roundNumberWithUpAndDown, sumArray } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import CompaniesService from "services/CompaniesService";
import { v4 as uuidv4 } from "uuid";
import logo from "./doxa.png";
import bg from "./bg.svg";
import AddressService from "../../../../../services/AddressService";

const tableRowStyles = { height: "auto" };

const InvoicePreviewModal = forwardRef((props, ref) => {
    const {
        data, itemList, currentCompany, isBuyer
    } = props;
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);
    const [company, setCompany] = useState(null);
    const [summary, setSummary] = useState(null);
    const [companyLogo, setCompanyLogo] = useState();

    const toggle = () => setIsShow(!isShow);

    useImperativeHandle(ref, () => ({ toggle }));

    const getCurrentCompany = async () => {
        if (currentCompany) {
            const companyDetails = (await CompaniesService
                .getCompany(currentCompany?.companyUuid))?.data?.data;
            const addresses = (await AddressService
                .getCompanyAddresses(currentCompany?.companyUuid))?.data?.data;
            companyDetails.address = addresses?.find((address) => address.default);
            setCompany(companyDetails);
        }
    };

    useEffect(() => {
        getCurrentCompany().catch(console.error);
        if (currentCompany) {
            setCompanyLogo(currentCompany.logoUrl);
        }
    }, [currentCompany]);

    useEffect(() => {
        const subTotal = roundNumberWithUpAndDown(sumArray(
            itemList?.map(
                (item) => roundNumberWithUpAndDown(item?.invoiceQty
                    * item?.invoiceUnitPrice)
            )
        ));
        const diffTax = itemList.some((item) => item?.invoiceTaxCodeValue !== itemList[0]?.invoiceTaxCodeValue);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(sumArray(
                itemList?.map(
                    (item) => roundNumberWithUpAndDown(((item?.invoiceQty)
                        * (item?.invoiceUnitPrice)
                        * item?.invoiceTaxCodeValue) / 100)
                )
            ));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * itemList[0]?.invoiceTaxCodeValue) / 100);
        }
        setSummary({
            subTotal,
            tax
        });
    }, [itemList]);
    // const [page, setPage] = useState(1);
    // const [totalPage, setTotalPage] = useState(3);
    // const [listItemPerPage, setListItemPerPage] = useState([]);
    // const [previousAmount, setPreviousAmount] = useState(0);
    // const [totalAmountPage, setTotalAmountPage] = useState(0);

    // useEffect(() => {
    //     const totalPageNumber = Math.ceil(itemList.length / 2);
    //     setTotalPage(totalPageNumber);
    //     setPage(1);
    //     if (page > 1) {
    //         const newPage = page - 1;
    //         const previousList = itemList.filter(
    //             (item, index) => ((newPage - 1) * 2 <= index && index < (newPage - 1) * 2 + 2)
    //         );
    //         let sum = 0;
    //         previousList.forEach((item) => {
    //             sum += Number(item?.invoiceQty) * Number(item?.invoiceUnitPrice);
    //         });
    //         setPreviousAmount(sum);
    //     }
    //     const listItem = itemList
    //         .filter((item, index) => ((page - 1) * 2 <= index && index < (page - 1) * 2 + 2));
    //     let sum = 0;
    //     listItem.forEach((item) => {
    //         sum += Number(item?.invoiceQty) * Number(item?.invoiceUnitPrice);
    //     });
    //     setTotalAmountPage(sum);
    //     setListItemPerPage(listItem);
    // }, [itemList]);

    // useEffect(() => {
    //     if (page > 1) {
    //         const newPage = page - 1;
    //         const previousList = itemList.filter(
    //             (item, index) => ((newPage - 1) * 2 <= index && index < (newPage - 1) * 2 + 2)
    //         );
    //         let sum = 0;
    //         previousList.forEach((item) => {
    //             sum += Number(item?.invoiceQty) * Number(item?.invoiceUnitPrice);
    //         });
    //         setPreviousAmount(sum);
    //     }
    //     const listItem = itemList
    //         .filter((item, index) => ((page - 1) * 2 <= index && index < (page - 1) * 2 + 2));
    //     let sum = 0;
    //     listItem.forEach((item) => {
    //         sum += Number(item?.invoiceQty) * Number(item?.invoiceUnitPrice);
    //     });
    //     setTotalAmountPage(sum);
    //     setListItemPerPage(listItem);
    // }, [page]);

    // const changePageLeft = () => {
    //     if (page > 1) {
    //         setPage(page - 1);
    //     }
    // };

    // const changePageRight = () => {
    //     if (page < totalPage) {
    //         setPage(page + 1);
    //     }
    // };

    return (
        <Modal show={isShow} onHide={toggle} size="lg" scrollable>
            <Modal.Header closeButton>{t("PreviewInvoice")}</Modal.Header>
            <Modal.Body>
                <div className="px-4 py-5" style={{ backgroundImage: `url(${bg})` }}>
                    <Row>
                        <Col xs={6}>
                            <img style={{ height: 100 }} src={companyLogo || logo} alt="" />
                        </Col>
                        <Col xs={6} className="text-right">
                            <span className="h3 font-weight-bold">
                                TAX INVOICE
                            </span>
                            <Row>
                                <Col xs={7}>Company Reg. No.</Col>
                                <Col xs={5}>{company?.companyRegistrationNumber}</Col>
                            </Row>
                            <Row>
                                <Col xs={7}>Tax Reg. No.</Col>
                                <Col xs={5}>{company?.gstNo}</Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col xs={12} className="h4 font-weight-bold">
                            {company?.entityName}
                        </Col>
                        <Col xs={6}>
                            <div>
                                <div>{company?.address?.addressFirstLine}</div>
                                <div>{company?.address?.addressSecondLine}</div>
                                <div>{company?.address?.state}</div>
                                <div>{company?.address?.city}</div>
                                <div>{company?.address?.postalCode}</div>
                                <div>{company?.address?.country}</div>
                            </div>
                        </Col>
                        <Col xs={6}>
                            <div className="d-flex justify-content-between">
                                <div>Invoice No.</div>
                                <div><b>{data?.invoiceNo}</b></div>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>Invoice Date</div>
                                <div>
                                    {formatDateTime(data?.invoiceDate,
                                        CUSTOM_CONSTANTS.DDMMYYYY)}
                                </div>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>Invoice Due Date</div>
                                <div>
                                    {formatDateTime(data?.invoiceDueDate,
                                        CUSTOM_CONSTANTS.DDMMYYYY)}
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col xs={6} className="h4 font-weight-bold mb-4">
                            {
                                isBuyer
                                    ? "BILLED ON BEHALF OF"
                                    : "BILL TO"
                            }
                        </Col>
                        <Col xs={6} className="h4 font-weight-bold mb-4">
                            TERMS
                        </Col>
                        <Col xs={12} className="h4 font-weight-bold">
                            {data?.companyName}
                        </Col>
                        <Col xs={6}>
                            <div>{data?.addressFirstLine}</div>
                            <div>{data?.addressSecondLine}</div>
                            <div>{data?.state}</div>
                            <div>{data?.city}</div>
                            <div>{data?.postalCode}</div>
                            <div>{data?.country}</div>
                        </Col>
                        <Col xs={3}>
                            Payment Terms
                            <br />
                            Currency
                        </Col>
                        <Col xs={3} className="text-right">
                            {`${data?.ptDays} Days`}
                            <br />
                            {data?.currencyCode}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {data?.project && data?.projectTitle && (
                                <div className="mt-3">
                                    Project Title
                                    <span className="ml-4">{data?.projectTitle}</span>
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="pb-5 pt-2">
                        <Table className="invoice-table">
                            <thead>
                                <tr style={tableRowStyles}>
                                    <th className="font-weight-bold">S/N</th>
                                    <th className="font-weight-bold">DESCRIPTION</th>
                                    <th className="font-weight-bold">UOM</th>
                                    <th className="font-weight-bold text-right">QTY</th>
                                    <th className="font-weight-bold text-right">UNIT PRICE</th>
                                    <th className="font-weight-bold text-right">TAX %</th>
                                    <th className="font-weight-bold text-right">NET AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemList?.map((item, index) => (
                                    <tr key={uuidv4()} style={tableRowStyles}>
                                        <th>{index + 1}</th>
                                        <td>
                                            <div>
                                                {(item?.itemCode || item?.itemName) && (
                                                    <div className="wrapTextPreview mb-3">
                                                        {`${item?.itemCode} ${item?.itemName}`}
                                                    </div>
                                                )}
                                                <div>
                                                    {item?.itemDescription && (
                                                        <div className="wrapTextPreview">
                                                            {"Description: "}
                                                            {item?.itemDescription}
                                                        </div>
                                                    )}
                                                    {item?.model && (
                                                        <div className="wrapTextPreview">
                                                            {"Model: "}
                                                            {item?.model}
                                                        </div>
                                                    )}
                                                    {item?.size && (
                                                        <div className="wrapTextPreview">
                                                            {"Size: "}
                                                            {item?.size}
                                                        </div>
                                                    )}
                                                    {item?.brand && (
                                                        <div className="wrapTextPreview">
                                                            {"Brand: "}
                                                            {item?.brand}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{typeof (item?.uom) === "object" ? item?.uom.uomName : item?.uom}</td>
                                        <td className="text-right">{item?.invoiceQty}</td>
                                        {Number(item?.invoiceUnitPrice) === 0 ? (
                                            <>
                                                <td className="text-right">{isNullOrUndefinedOrEmpty(item?.priceType) ? "0.00" : ""}</td>
                                                <td className="text-right">
                                                    {isNullOrUndefinedOrEmpty(item?.priceType) ? formatDisplayDecimal(item?.invoiceTaxCodeValue, 2) : ""}
                                                </td>
                                                <td className="text-right">
                                                    {isNullOrUndefinedOrEmpty(item?.priceType) ? "0.00" : item.priceType}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="text-right">{item?.invoiceUnitPrice}</td>
                                                <td className="text-right">{formatDisplayDecimal(item?.invoiceTaxCodeValue, 2)}</td>
                                                <td className="text-right">{formatDisplayDecimal(roundNumberWithUpAndDown(item?.invoiceQty * item?.invoiceUnitPrice), 2)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Row className="w-100 mb-3">
                            <Col xs={2} className="offset-7">
                                <b>
                                    Currency
                                    <br />
                                    Sub Total
                                    <br />
                                    Tax Total
                                    <br />
                                    Total
                                </b>
                            </Col>
                            <Col xs={3} className="text-right">
                                <b>{data?.currencyCode || "SGD"}</b>
                                <br />
                                {formatDisplayDecimal(summary?.subTotal, 2)}
                                <br />
                                {formatDisplayDecimal(summary?.tax, 2)}
                                <br />
                                {formatDisplayDecimal(summary?.subTotal + summary?.tax, 2)}
                            </Col>
                        </Row>
                        {/* <Row className="w-100">
                            <Col className="d-flex justify-content-between">
                                <div />
                                <div className="">
                                    {page === 1 ? (
                                        <i className="fa fa-chevron-left mr-2 button-paging" aria-hidden="true" onClick={() => { }} />
                                    ) : (
                                        <i className="fa fa-chevron-left mr-2 button-paging active-submit" aria-hidden="true" onClick={() => changePageLeft()} />
                                    )}
                                    <span>{"Page "}</span>
                                    <span>{page}</span>
                                    <span>{" of "}</span>
                                    <span>{totalPage}</span>
                                    {page === totalPage ? (
                                        <i className="fa fa-chevron-right ml-2 button-paging" aria-hidden="true" onClick={() => { }} />
                                    ) : (
                                        <i className="fa fa-chevron-right ml-2 button-paging active-submit" aria-hidden="true" onClick={() => changePageRight()} />
                                    )}
                                </div>
                            </Col>
                        </Row> */}
                    </Row>
                </div>
            </Modal.Body>
        </Modal>
    );
});
InvoicePreviewModal.displayName = "InvoicePreviewModal";

export default InvoicePreviewModal;
