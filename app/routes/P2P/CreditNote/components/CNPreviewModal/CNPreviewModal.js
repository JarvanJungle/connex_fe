/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
    forwardRef, useEffect, useImperativeHandle, useState
} from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import { Col, Row, Table } from "reactstrap";
import { formatDateTime, formatDisplayDecimal, roundNumberWithUpAndDown } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import CompaniesService from "services/CompaniesService";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import logo from "./doxa.png";
import bg from "./bg.svg";
import AddressService from "../../../../../services/AddressService";

const tableRowStyles = { height: "auto" };
const tableRowNoteStyles = { height: "auto", paddingBottom: 0 };
const rowNoteStyles = { paddingTop: 0, borderTop: 0 };

const CNPreviewModal = forwardRef((props, ref) => {
    const {
        data, companyUuid, isBuyer
    } = props;
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);
    const [company, setCompany] = useState(null);
    const [itemList, setItemList] = useState([]);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { currentCompany } = permissionReducer;
    const [companyLogo, setCompanyLogo] = useState();

    const [cnAmountTotal, setCNAmountTotal] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });

    const toggle = () => setIsShow(!isShow);

    useImperativeHandle(ref, () => ({ toggle }));

    const getCurrentCompany = async (uuid) => {
        const companyDetails = (await CompaniesService
            .getCompany(uuid))?.data?.data;
        const addresses = (await AddressService
            .getCompanyAddresses(uuid))?.data?.data;
        companyDetails.address = addresses?.find((address) => address.default);
        setCompany(companyDetails);
    };

    useEffect(() => {
        if (companyUuid) {
            getCurrentCompany(companyUuid).catch(console.error);
        }
    }, [companyUuid]);
    useEffect(() => {
        getCurrentCompany().catch(console.error);
        if (currentCompany) {
            setCompanyLogo(currentCompany.logoUrl);
        }
    }, [currentCompany]);

    useEffect(() => {
        if (data?.itemList?.length > 0) {
            setItemList(data?.itemList);
        }
        const subTotal = roundNumberWithUpAndDown(data?.itemList?.reduce((sum, item) => sum
            + roundNumberWithUpAndDown(item?.itemQuantity * item?.unitPrice), 0));

        const diffTax = itemList?.some((item) => item.taxPercent !== itemList[0]?.taxPercent);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(data?.itemList?.reduce((sum, item) => {
                const result = roundNumberWithUpAndDown(
                    (roundNumberWithUpAndDown(item?.itemQuantity * item?.unitPrice)
                        * (item.taxPercent)) / 100
                );
                return sum + result;
            }, 0));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * data?.itemList[0]?.taxPercent) / 100);
        }
        const total = roundNumberWithUpAndDown(subTotal + tax);
        setCNAmountTotal({
            subTotal, tax, total
        });
    }, [data?.itemList]);

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
    //             sum += Number(item?.netPrice);
    //         });
    //         setPreviousAmount(sum);
    //     }
    //     const listItem = itemList
    //         .filter((item, index) => ((page - 1) * 2 <= index && index < (page - 1) * 2 + 2));
    //     let sum = 0;
    //     listItem.forEach((item) => {
    //         sum += Number(item?.netPrice);
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
    //             sum += Number(item?.netPrice);
    //         });
    //         setPreviousAmount(sum);
    //     }
    //     const listItem = itemList
    //         .filter((item, index) => ((page - 1) * 2 <= index && index < (page - 1) * 2 + 2));
    //     let sum = 0;
    //     listItem.forEach((item) => {
    //         sum += Number(item?.netPrice);
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
            <Modal.Header closeButton>{t("PreviewCreditNote")}</Modal.Header>
            <Modal.Body>
                <div className="px-4 py-5" style={{ backgroundImage: `url(${bg})` }}>
                    <Row>
                        <Col xs={6}>
                            <img style={{ height: 100 }} src={companyLogo || logo} alt="" />
                        </Col>
                        <Col xs={6} className="text-right">
                            <span className="h3 font-weight-bold">
                                CREDIT NOTE
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
                                {
                                    data?.creditNoteNumber
                                    && (
                                        <>
                                            <div>Credit Note No.</div>
                                            <div>{data?.creditNoteNumber}</div>
                                        </>
                                    )
                                }
                            </div>
                            <div className="d-flex justify-content-between">
                                {
                                    data?.creditNoteDate
                                    && (
                                        <>
                                            <div>Credit Note Date</div>
                                            <div>
                                                {formatDateTime(data?.creditNoteDate,
                                                    CUSTOM_CONSTANTS.DDMMYYYY)}
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                            <div className="d-flex justify-content-between">
                                {
                                    data?.invoiceNumber
                                    && (
                                        <>
                                            <div>Reference Invoice</div>
                                            <div>{data?.invoiceNumber}</div>
                                        </>
                                    )
                                }
                            </div>
                            <div className="d-flex justify-content-between">
                                {
                                    data?.invoiceDate
                                    && (
                                        <>
                                            <div>Invoice Date</div>
                                            <div>
                                                {formatDateTime(data?.invoiceDate,
                                                    CUSTOM_CONSTANTS.DDMMYYYY)}
                                            </div>
                                        </>
                                    )
                                }
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
                            {data?.project && (
                                <div className="mt-3">
                                    Project Title
                                    <span className="ml-4">{data?.projectTitle}</span>
                                </div>
                            )}
                        </Col>
                        <Col xs={6} />
                    </Row>
                    <Row>
                        <Col>
                            {data?.projectTitle && (
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
                                    <>
                                        <tr
                                            key={uuidv4()}
                                            style={tableRowStyles}
                                        >
                                            <th>{index + 1}</th>
                                            <td style={tableRowNoteStyles}>
                                                {
                                                    item?.invItemCode && (
                                                        <div>
                                                            <div className="wrapTextPreview">
                                                                {`${item?.invItemCode} ${item?.itemDescription}`}
                                                            </div>
                                                            <div className="mt-3">
                                                                {item?.invItemDescription && (
                                                                    <div className="wrapTextPreview">
                                                                        {"Description: "}
                                                                        {item?.invItemDescription}
                                                                    </div>
                                                                )}
                                                                {item?.invItemModel && (
                                                                    <div className="wrapTextPreview">
                                                                        {"Model: "}
                                                                        {item?.invItemModel}
                                                                    </div>
                                                                )}
                                                                {item?.invItemSize && (
                                                                    <div className="wrapTextPreview">
                                                                        {"Size: "}
                                                                        {item?.invItemSize}
                                                                    </div>
                                                                )}
                                                                {item?.invItemBrand && (
                                                                    <div className="wrapTextPreview">
                                                                        {"Brand: "}
                                                                        {item?.invItemBrand}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={tableRowNoteStyles}>
                                                {item?.uomCode?.uomCode || item?.uomCode}
                                            </td>
                                            <td style={tableRowNoteStyles} className="text-right">{item?.itemQuantity}</td>
                                            <td style={tableRowNoteStyles} className="text-right">{item?.unitPrice}</td>
                                            <td style={tableRowNoteStyles} className="text-right">{formatDisplayDecimal(item?.taxPercent, 2)}</td>
                                            <td style={tableRowNoteStyles} className="text-right">{formatDisplayDecimal(roundNumberWithUpAndDown(Number(item?.itemQuantity || 0) * Number(item?.unitPrice || 0)), 2)}</td>
                                        </tr>
                                        {item.notes && (
                                            <tr style={tableRowStyles}>
                                                <th className="align-middle" style={rowNoteStyles} />
                                                <td
                                                    colSpan={6}
                                                    style={rowNoteStyles}
                                                >
                                                    <i>{`Notes: ${item?.notes}`}</i>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </Table>
                        <Row className="w-100 mb-3">
                            <Col xs={7}>
                                <b>
                                    NOTES:
                                    {" "}
                                    {data?.remarks ? data.remarks : "N/A"}
                                </b>
                            </Col>
                            <Col xs={2}>
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
                                {formatDisplayDecimal(cnAmountTotal?.subTotal, 2)}
                                <br />
                                {formatDisplayDecimal(cnAmountTotal?.tax, 2)}
                                <br />
                                {formatDisplayDecimal(cnAmountTotal?.total, 2)}
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
CNPreviewModal.displayName = "CNPreviewModal";

export default CNPreviewModal;
