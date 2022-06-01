/* eslint-disable no-restricted-properties */
/* eslint-disable no-bitwise */
import { Col, Row, Table } from "reactstrap";
import logo from "routes/P2P/PurchaseOrder/components/POPreviewModal/doxa.png";
import { v4 as uuidv4 } from "uuid";
import { convertToLocalTime, formatDisplayDecimal, clearNumber } from "helper/utilities";
import React, { useEffect } from "react";

const POTemplate1 = (props) => {
    const {
        data, poAmountTotal, companyLogo, company,
        itemList,
        getStyle,
        formatAddress,
        tableRowStyles,
        userDetails
    } = props;

    useEffect(() => {
        console.log(data);
    }, [data]);

    const dollarsInWords = (number) => {
        const first = ["", "one ", "two ", "three ", "four ", "five ", "six ", "seven ", "eight ", "nine ", "ten ", "eleven ", "twelve ", "thirteen ", "fourteen ", "fifteen ", "sixteen ", "seventeen ", "eighteen ", "nineteen "];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        const mad = ["", "thousand", "million", "billion", "trillion"];
        let word = "";
        for (let i = 0; i < mad.length; i++) {
            let tempNumber = number % (100 * Math.pow(1000, i));
            if (Math.floor(tempNumber / Math.pow(1000, i)) !== 0) {
                if (Math.floor(tempNumber / Math.pow(1000, i)) < 20) {
                    word = `${first[Math.floor(tempNumber / Math.pow(1000, i))] + mad[i]} ${word}`;
                } else {
                    word = `${tens[Math.floor(tempNumber / (10 * Math.pow(1000, i)))]} ${first[Math.floor(tempNumber / Math.pow(1000, i)) % 10]}${mad[i]} ${word}`;
                }
            }
            tempNumber = number % (Math.pow(1000, i + 1));
            if (Math.floor(tempNumber / (100 * Math.pow(1000, i))) !== 0) word = `${first[Math.floor(tempNumber / (100 * Math.pow(1000, i)))]}hundred ${word}`;
        }
        return word;
    };

    const numInWords = (number, currencyName) => {
        console.log("numInWords ~ number", number);
        const newNum = Number(clearNumber(number));
        console.log("numInWords ~ newNum", newNum);
        if (newNum > 1) {
            const text = `${newNum}`.split(".");
            if (text.length === 1) {
                const dollars = dollarsInWords(Number(text[0])).trim().split(" ");
                const dollarsWord = dollars.map((word) => word[0]?.toUpperCase() + word.substring(1)).join(" ");
                return `${currencyName} ${dollarsWord} Only`;
            }
            const dollars = dollarsInWords(Number(text[0]))?.trim().split(" ");
            const dollarsWord = dollars.map((word) => word[0]?.toUpperCase() + word.substring(1)).join(" ");
            let cents;
            if ((text[1].length) < 2) {
                cents = dollarsInWords(`${Number(text[1])}0`)?.trim().split(" ");
            } else {
                cents = dollarsInWords(`${Number(text[1])}`)?.trim().split(" ");
            }
            const centsWord = cents.map((word) => word[0]?.toUpperCase() + word.substring(1)).join(" ");
            return `${currencyName} ${dollarsWord} And Cents ${centsWord} Only`;
        }
        if (newNum > 0) {
            const text = `${newNum}`.split(".");
            let cents;
            if ((text[1].length) < 2) {
                cents = dollarsInWords(`${Number(text[1])}0`)?.trim().split(" ");
            } else {
                cents = dollarsInWords(`${Number(text[1])}`)?.trim().split(" ");
            }
            const centsWord = cents.map((word) => word[0]?.toUpperCase() + word.substring(1)).join(" ");
            return `${currencyName} Cents ${centsWord} Only`;
        }
        return "";
    };

    return (
        <>
            <Row>
                <Col xs={6}>
                    <img style={{ height: 100 }} src={companyLogo || logo} alt="" />
                </Col>
                <Col xs={6}>
                    <span className="h4 font-weight-bold">{company?.entityName}</span>
                    <Row>
                        <Col xs={7}>
                            <div>{company?.address?.addressFirstLine}</div>
                            <div>{company?.address?.addressSecondLine}</div>
                            <div>
                                {company?.address?.country}
                                {" "}
                                {company?.address?.postalCode}
                            </div>
                            <div>
                                {"Business Reg. No.: "}
                                {company?.companyRegistrationNumber}
                            </div>
                        </Col>
                        <Col xs={5}>
                            <div>{company?.phoneNumber}</div>
                            <div>{company?.faxNumber}</div>
                            <div>{company?.emailAddress}</div>
                            <div>{company?.siteAddress}</div>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="mt-5 mb-3">
                <Col xs={12} className="h4 font-weight-bold">
                    Purchase Order
                </Col>
                <Col xs={6}>
                    <Row>
                        <Col xs={3}>PO No</Col>
                        <Col xs={9}>{data?.poNumber}</Col>
                    </Row>
                    <Row>
                        <Col xs={3}>Date</Col>
                        <Col xs={9}>{`${convertToLocalTime(new Date(), "DD/MM/YYYY")} UTC`}</Col>
                    </Row>
                    <Row>
                        <Col xs={3}>To M/s</Col>
                        <Col xs={9}>
                            <div>{data?.supplier?.companyName}</div>
                            <div>{data?.addressFirstLine}</div>
                            <div>{data?.addressSecondLine}</div>
                            <div>{data?.state}</div>
                            <div>
                                {data?.city}
                                {" "}
                                {data?.postalCode}
                            </div>
                            <div>{data?.country}</div>
                        </Col>
                    </Row>
                </Col>
                <Col xs={6}>
                    <div><u>Supplier&apos;s Particulars</u></div>
                    {/* <Row>
                        <Col xs={5}>Telephone No</Col>
                        <Col xs={7}>{data?.supplier?.phoneNumber}</Col>
                    </Row>
                    <Row>
                        <Col xs={5}>Fax No</Col>
                        <Col xs={7}>{data?.supplier?.faxNumber}</Col>
                    </Row> */}
                    <Row>
                        <Col xs={5}>Person to Contact</Col>
                        <Col xs={7}>{data?.supplier?.contactPersonName}</Col>
                    </Row>
                    <Row>
                        <Col xs={5}>Mobile No</Col>
                        <Col xs={7}>{`${data?.supplier?.countryCode}-${data?.supplier?.contactPersonWorkNumber}`}</Col>
                    </Row>
                    <Row>
                        <Col xs={5}>Email</Col>
                        <Col xs={7}>{data?.supplier?.contactPersonEmail}</Col>
                    </Row>
                </Col>
            </Row>
            {data?.projectTitle && (
                <Row>
                    <Col xs={3}>Name of Project</Col>
                    <Col xs={9}>{data?.projectTitle}</Col>
                </Row>
            )}
            <Row>
                <Col xs={3}>Delivery Address</Col>
                <Col xs={9}>{formatAddress(data)}</Col>
            </Row>

            <Row className="py-5">
                <Table className="invoice-table" borderless>
                    <thead>
                        <tr style={tableRowStyles}>
                            <th className="font-weight-bold"><u>Description</u></th>
                            <th className="font-weight-bold text-center"><u>Provisional Quantity</u></th>
                            <th className="font-weight-bold text-center"><u>Unit</u></th>
                            {data?.isPR && (
                                <>
                                    <th className="font-weight-bold text-center"><u>{`Unit Rate (${data?.sourceCurrencyCode})`}</u></th>
                                    <th className="font-weight-bold text-center"><u>{`Amount (${data?.sourceCurrencyCode})`}</u></th>
                                </>
                            )}

                        </tr>
                    </thead>
                    <tbody>
                        <tr style={tableRowStyles}>
                            <td colSpan="100%"><div>Supply and deliver the following:</div></td>
                        </tr>
                        {data?.itemList?.map((item, index) => (
                            <tr key={uuidv4()} style={tableRowStyles}>
                                <td>
                                    <Row>
                                        <Col xs={2}>
                                            {`${index + 1}.`}
                                        </Col>
                                        <Col xs={10}>
                                            <div className="wrapTextPreview">
                                                {`${item?.itemCode} ${item?.itemName}`}
                                            </div>
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
                                        </Col>
                                    </Row>
                                </td>
                                <td style={getStyle(itemList, index)} className="text-center">
                                    {item?.itemQuantity}
                                </td>
                                <td style={getStyle(itemList, index)} className="text-center">{item?.uom?.uomCode || item?.uom}</td>
                                {data?.isPR && (
                                    <>
                                        <td style={getStyle(itemList, index)} className="text-center">
                                            {!item?.priceType ? item?.itemUnitPrice : ""}
                                        </td>
                                        <td style={getStyle(itemList, index)} className="text-center">
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
                {data?.isPR && (
                    <Row className="w-100 mb-3">
                        <Col xs={7} />
                        {data?.isPR && (
                            <Col xs={3}>
                                <b>
                                    Sub-Total
                                    <br />
                                    Total before GST
                                    <br />
                                    Add GST
                                    <br />
                                    Total
                                </b>
                            </Col>
                        )}
                        <Col xs={2} className="text-right">
                            {formatDisplayDecimal(poAmountTotal?.subTotal, 2)}
                            <br />
                            {formatDisplayDecimal(poAmountTotal?.subTotal, 2)}
                            <br />
                            {formatDisplayDecimal(poAmountTotal?.tax, 2)}
                            <br />
                            {formatDisplayDecimal(poAmountTotal?.total, 2)}
                        </Col>
                    </Row>
                )}
            </Row>
            {data?.isPR && (
                <Row>
                    <Col>{numInWords(formatDisplayDecimal(poAmountTotal?.total, 2), data?.currencyName)}</Col>
                </Row>
            )}
            <Row className="py-4">
                <Col xs={8}>
                    <div>
                        NOTES:
                        {" "}
                        {data?.remarks ? data.remarks : "N/A"}
                    </div>
                    <div>
                        This Purchase Order is subject to the terms and conditions stated overleaf.
                    </div>
                </Col>
                <Col xs={10}>
                    <Row>
                        <Col xs={3}>
                            Delivery Schedule
                        </Col>
                        <Col xs={9}>
                            Please liaise with site.
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={3}>
                            Payment Terms
                        </Col>
                        <Col xs={9}>
                            {data?.paymentTerms}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={3}>
                            Person to Contact
                        </Col>
                        <Col xs={3}>
                            {data?.requestorName}
                        </Col>
                        {userDetails?.workNumber && (
                            <>
                                <Col xs={2}>
                                    Telephone
                                </Col>
                                <Col xs={4}>
                                    {`${userDetails?.countryCode}-${userDetails?.workNumber}`}
                                </Col>
                            </>
                        )}
                    </Row>

                </Col>
            </Row>
            <Row className="py-3">
                I/We agree to accept this Purchase Order.
            </Row>
            <Row className="pt-3 border-top d-none">
                <Col xs={12}><h5 className="text-center">CONDITIONS OF PURCHASE AND SUPPLY CONTRACT</h5></Col>
                <Col xs={1}>
                    1.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        GENERAL
                    </div>
                    Unless otherwise agreed by the Purchaser, these conditions shall supersede and/or override any other terms and conditions stipulated,
                    incorporated or referred to by the Supplier in their quotations, catalogues, and negotiations and qualifications. These conditions are deemed to
                    form part and parcel of the contract between the Supplier and Purchaser.
                </Col>
                <Col xs={1}>
                    2.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        QUALITY
                    </div>
                    The quality of all materials/goods supplied shall be in accordance to the attached specifications and/or drawings and/or Purchaser&apos;s
                    requirements. Where this is not stated, then it shall be the best quality or standard available in the market.
                </Col>
                <Col xs={1}>
                    3.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        TEST CERTIFICATES/ REPORT
                    </div>
                    The Supplier shall submit Test Certificates and Material Test Reports to substantiate the quality of the material/goods supplied in compliance
                    with the Specifications and Building Control Act. Testing of the materials/goods shall be to the account of the Supplier.
                </Col>
                <Col xs={1}>
                    4.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        PRICE AND VALIDITY
                    </div>
                    The price stated in the Purchase Order shall be firm and not be subject to any changes for whatsoever reasons. Unless otherwise stated,
                    price shall be held firm for the whole contract period for the job on which the materials/goods are to be used.
                    Prices stated are all inclusive prices, prices of any items stated shall be completed including all accessories or connected parts, etc. which
                    may be necessary for the completeness of the item, whether it may be mentioned or not.
                </Col>
                <Col xs={1}>
                    5.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        VARIATIONS
                    </div>
                    Unless otherwise agreed, in the event of any variations ordered in writing by the purchaser, such variations shall be valued at the rates/prices
                    of items inserted in the Purchase Order.
                </Col>
                <Col xs={1}>
                    6.
                </Col>
                <Col xs={11}>
                    The Supplier shall indemnify the Purchaser against any liability incurred by him to any person, whether the Employer under the Main Contract
                    or third parties, and against all claims damages costs and expenses made against or incurred by him by reason of any negligence default or
                    breach by the Supplier of this Purchase Order.
                </Col>
                <Col xs={1}>
                    7.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        TERMS OF PAYMENT
                    </div>
                    Unless otherwise specified or agreed, when deliveries are spread over a period, each delivery shall be invoiced when despatched, delivered
                    and acknowledged on site by the Purchaser’s representative and each invoice shall be treated as a separate account and payable according
                    to the terms stated in the Purchase Order.
                </Col>
                <Col xs={1}>
                    8.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        DELIVERY
                    </div>
                    The Supplier shall supply and deliver the materials/goods in accordance to the Purchaser&apos;s delivery schedule and/or requirements, failing
                    which the Purchaser reserves the right to purchase the same or equivalent materials/goods from other suppliers and all costs incurred
                    (including the difference in price) will be charged to the Supplier&apos;s account.
                    All materials/goods delivered to the designated site shall be deemed to be the absolute property of the Purchaser and shall not be removed
                    without the prior permission of the Purchaser.
                </Col>
                <Col xs={1}>
                    9.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        PACKAGING
                    </div>
                    Unless otherwise stated, the prices quoted by the Supplier shall be deemed to include all packaging cases and packing materials.
                </Col>
                <Col xs={1}>
                    10.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        STORAGE OF MATERIALS/GOODS
                    </div>
                    Unless otherwise stated, the prices quoted by the Supplier shall be deemed to include all storage and warehousing costs. The Purchaser
                    reserves the right not to receive any materials/goods delivered before the actual requirement date.
                </Col>
                <Col xs={1}>
                    11.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        WARRANTIES AND GUARANTEES
                    </div>
                    Where warranties or guarantees are required in the specifications and/or drawings or is issued in the normal course of materials/goods
                    transaction, all such warranties or guarantees are to be submitted promptly to the Purchaser as instructed.
                </Col>
                <Col xs={1}>
                    12.
                </Col>
                <Col xs={11}>
                    <div className="font-weight-bold">
                        GOVERNING LAW
                    </div>
                    These conditions and the Purchase and Supply Contract shall for all purpose be subjected to and construed in accordance with the Law of the
                    Republic of Singapore and the parties hereto submit themselves to the non-exclusive jurisdiction of the Court of Singapore accordingly.
                </Col>

                <Col xs={1}>
                    13.
                </Col>
                <Col xs={11}>
                    Without prejudice to his rights under the contract, the Purchaser may reject or order replacement of any goods or materials, which are found
                    not in accordance with the Contract. Provided that the Purchaser may, but shall not be bound to accept any goods or materials that do not
                    fully comply with the Contract, in which event the Price of the Supplied item or contract sum, whichever the cost may be, shall be reduced by
                    any loss of value or otherwise cost suffered by the Purchaser in remedying the situation, whichever is the greatest.
                </Col>
                <Col xs={1}>
                    14.
                </Col>
                <Col xs={11}>
                    The Purchaser reserves the right to carry out verification of goods and services at Supplier&apos;s plant/facilities. Such verification shall not absolve
                    the Supplier&apos;s responsibility to provide acceptable product nor shall it preclude subsequent rejection.
                </Col>
                <Col xs={1}>
                    15.
                </Col>
                <Col xs={11}>
                    By the acceptance of this Purchase Order, the Supplier will deemed expressly to contract and undertake with us, and to comply, observe and
                    perform all obligations and conditions which may be imposed on us by the Employer, Architect, Local Authority or other person(s) hereinafter
                    referred to as the Principal) with whom, a contract has been entered into by the Purchaser.
                </Col>
            </Row>
        </>
    );
};

export default POTemplate1;
