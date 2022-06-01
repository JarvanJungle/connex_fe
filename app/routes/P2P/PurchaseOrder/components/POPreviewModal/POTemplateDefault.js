import { Col, Row, Table } from "reactstrap";
import logo from "routes/P2P/PurchaseOrder/components/POPreviewModal/doxa.png";
import { v4 as uuidv4 } from "uuid";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANT from "helper/constantsDefined";
import React from "react";

const POTemplateDefault = (props) => {
    const {
        data, poAmountTotal, companyLogo, company,
        itemList,
        userDetails,
        getStyle,
        formatAddress,
        tableRowStyles
    } = props;

    return (
        <>
            <Row>
                <Col xs={6}>
                    <img style={{ height: 100 }} src={companyLogo || logo} alt="" />
                </Col>
                <Col xs={6} className="text-right">
                    <span className="h3 font-weight-bold">PURCHASE ORDER</span>
                    <Row>
                        <Col xs={8}>Company Reg. No.</Col>
                        <Col xs={4}>{company?.companyRegistrationNumber}</Col>
                    </Row>
                    <Row>
                        <Col xs={8}>Tax Reg. No.</Col>
                        <Col xs={4}>{company?.gstNo}</Col>
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
                    {data?.poNumber && (
                        <div className="d-flex justify-content-between">
                            <div>Purchase Order No.</div>
                            <div>{data?.poNumber}</div>
                        </div>
                    )}
                    {data?.contractReferenceNumber && (
                        <div className="d-flex justify-content-between">
                            <div>Contract Reference No.</div>
                            <div>{data?.contractReferenceNumber}</div>
                        </div>
                    )}
                    <div className="d-flex justify-content-between">
                        <div>Issue Date</div>
                        <div>{`${convertToLocalTime(new Date(), "DD/MM/YYYY")} UTC`}</div>
                    </div>
                    {data?.requestorName && (
                        <div className="d-flex justify-content-between">
                            <div>Requestor</div>
                            <div>{data?.requestorName}</div>
                        </div>
                    )}
                    {userDetails?.workNumber && (
                        <div className="d-flex justify-content-between">
                            <div>Contact Number</div>
                            <div>{`${userDetails?.countryCode}-${userDetails?.workNumber}`}</div>
                        </div>
                    )}
                    {userDetails?.email && (
                        <div className="d-flex justify-content-between">
                            <div>Email Address</div>
                            <div>{userDetails?.email}</div>
                        </div>
                    )}
                </Col>
            </Row>
            <Row className="mt-4">
                <Col xs={12} className="h4 font-weight-bold">VENDOR</Col>
                <Col xs={6}>
                    <div>{data?.supplier?.companyName}</div>
                    <div>{data?.address?.addressFirstLine ?? data?.addressFirstLine}</div>
                    <div>{data?.address?.addressSecondLine ?? data?.addressSecondLine}</div>
                    <div>{data?.address?.state ?? data?.state}</div>
                    <div>{data?.address?.city ?? data?.city}</div>
                    <div>{data?.address?.postalCode ?? data?.postalCode}</div>
                    <div>{data?.address?.country ?? data?.country}</div>
                    {data?.project && (
                        <div className="mt-3">
                            Project Title
                            <span className="ml-4">{data?.projectTitle}</span>
                        </div>
                    )}
                </Col>
                <Col xs={3}>
                    {data?.supplier?.contactPersonName && (<div>Person In-Charge</div>)}
                    {data?.supplier?.contactPersonWorkNumber && (<div>Contact Number</div>)}
                    {data?.supplier?.contactPersonEmail && (<div>Email Address</div>)}
                    {data?.paymentTerms && (<div>Payment Terms</div>)}
                </Col>
                <Col xs={3} className="text-right">
                    {data?.supplier?.contactPersonName && (
                        <div>{data?.supplier?.contactPersonName}</div>
                    )}
                    {data?.supplier?.contactPersonWorkNumber && (
                        <div>{`${data?.supplier?.countryCode}-${data?.supplier?.contactPersonWorkNumber}`}</div>
                    )}
                    {data?.supplier?.contactPersonEmail && (
                        <div>{data?.supplier?.contactPersonEmail}</div>
                    )}
                    {data?.paymentTerms && (<div>{data?.paymentTerms}</div>)}
                </Col>
            </Row>
            <Row className="py-5">
                <Table className="invoice-table">
                    <thead>
                        <tr style={tableRowStyles}>
                            <th className="font-weight-bold">ITEM</th>
                            <th className="font-weight-bold">UOM</th>
                            <th className="font-weight-bold text-right">QTY</th>
                            {data?.isPR && (
                                <>
                                    <th className="font-weight-bold text-right">UNIT PRICE</th>
                                    <th className="font-weight-bold text-right">TAX %</th>
                                    <th className="font-weight-bold text-right">NET AMOUNT</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data?.itemList?.map((item, index) => (
                            <tr key={uuidv4()} style={tableRowStyles}>
                                <td>
                                    <div>
                                        <div className="wrapTextPreview">
                                            {`${item?.itemCode} ${item?.itemName}`}
                                        </div>
                                        <div className="mt-3">
                                            {item?.itemDescription && (
                                                <div className="wrapTextPreview">
                                                    {"Description: "}
                                                    {item?.itemDescription}
                                                </div>
                                            )}
                                            {item?.itemModel && (
                                                <div className="wrapTextPreview">
                                                    {"Model: "}
                                                    {item?.itemModel}
                                                </div>
                                            )}
                                            {item?.itemSize && (
                                                <div className="wrapTextPreview">
                                                    {"Size: "}
                                                    {item?.itemSize}
                                                </div>
                                            )}
                                            {item?.itemBrand && (
                                                <div className="wrapTextPreview">
                                                    {"Brand: "}
                                                    {item?.itemBrand}
                                                </div>
                                            )}
                                            {item?.requestedDeliveryDate && (
                                                <div className="wrapTextPreview">
                                                    {"Delivery Date: "}
                                                    {convertToLocalTime(
                                                        item?.requestedDeliveryDate,
                                                        CUSTOM_CONSTANT.DDMMYYYY
                                                    )}
                                                </div>
                                            )}
                                            {item?.address && (
                                                <div className="wrapTextPreview">
                                                    <div>Delivery Address:</div>
                                                    <div>
                                                        {formatAddress(
                                                            item?.address
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {item?.note && (
                                                <div className="wrapTextPreview">
                                                    {"Note: "}
                                                    {item?.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={getStyle(itemList, index)}>
                                    {item?.uom?.uomCode || item?.uom}
                                </td>
                                <td style={getStyle(itemList, index)} className="text-right">{item?.itemQuantity}</td>
                                {data?.isPR && (
                                    <>
                                        <td style={getStyle(itemList, index)} className="text-right">
                                            {!item?.priceType ? item?.itemUnitPrice : ""}
                                        </td>
                                        <td style={getStyle(itemList, index)} className="text-right">
                                            {!item?.priceType
                                                ? formatDisplayDecimal(item?.taxRate, 2)
                                                : ""}
                                        </td>
                                        <td style={getStyle(itemList, index)} className="text-right">
                                            {!item?.priceType
                                                ? formatDisplayDecimal(
                                                    item?.inSourceCurrencyBeforeTax, 2
                                                )
                                                : item?.priceType}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Row className="w-100 mb-3">
                    <Col xs={7}>
                        <b>
                            NOTES:
                            <br />
                        </b>
                        {data?.remarks ? data.remarks : "N/A"}
                    </Col>
                    {data?.isPR && (
                        <>
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
                                <b>{data?.sourceCurrencyCode}</b>
                                <br />
                                {formatDisplayDecimal(poAmountTotal?.subTotal, 2)}
                                <br />
                                {formatDisplayDecimal(poAmountTotal?.tax, 2)}
                                <br />
                                {formatDisplayDecimal(poAmountTotal?.total, 2)}
                            </Col>

                        </>
                    )}
                </Row>
            </Row>
        </>
    );
};

export default POTemplateDefault;
