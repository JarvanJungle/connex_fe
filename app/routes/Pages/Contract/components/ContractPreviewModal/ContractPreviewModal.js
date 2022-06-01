import React, {
    forwardRef, useEffect, useImperativeHandle, useState
} from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import { Col, Row, Table } from "reactstrap";
import { formatDisplayDecimal, convertToLocalTime } from "helper/utilities";
import CUSTOM_CONSTANT from "helper/constantsDefined";
import CompaniesService from "services/CompaniesService";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import AddressService from "services/AddressService";
import doxaLogo from "images/logos/Square Green.png";
import bg from "./bg.svg";

const tableRowStyles = { height: "auto" };

const ContractPreviewModal = forwardRef(({ data }, ref) => {
    const { t } = useTranslation();
    const [isShow, setIsShow] = useState(false);
    const [company, setCompany] = useState(null);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const authReducer = useSelector((state) => state.authReducer);
    const { currentCompany } = permissionReducer;
    const { userDetails } = authReducer;
    const [companyLogo, setCompanyLogo] = useState();

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
        if (currentCompany) {
            setCompanyLogo(currentCompany.logoUrl);
            getCurrentCompany(currentCompany.companyUuid).catch(console.error);
        }
    }, [currentCompany]);

    const formatAddress = (address) => {
        if (!address) return "";
        let result = "";
        if (address?.addressFirstLine) result += address?.addressFirstLine;
        if (address?.addressSecondLine) result += `, ${address?.addressSecondLine}`;
        if (address?.state) result += `, ${address?.state}`;
        if (address?.city) result += `, ${address?.city}`;
        if (address?.country) result += `, ${address?.country}`;
        if (address?.postalCode) result += ` ${address?.postalCode}`;
        return result;
    };

    return (
        <Modal show={isShow} onHide={toggle} size="lg" scrollable>
            <Modal.Header closeButton>{t("Preview Contract")}</Modal.Header>
            <Modal.Body>
                <div className="px-4 py-5" style={{ backgroundImage: `url(${bg})` }}>
                    <Row>
                        <Col xs={6}>
                            <img style={{ height: 100 }} src={companyLogo ?? doxaLogo} alt="" />
                        </Col>
                        <Col xs={6} className="text-right">
                            <span className="h3 font-weight-bold">Goods & Services Pricing Agreement</span>
                            <Row>
                                <Col xs={8} className="small">Company Reg. No.</Col>
                                <Col xs={4} className="small">{company?.companyRegistrationNumber}</Col>
                            </Row>
                            <Row>
                                <Col xs={8} className="small">Tax Reg. No.</Col>
                                <Col xs={4} className="small">{company?.gstNo}</Col>
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
                            {data?.contractNumber && (
                                <div className="d-flex justify-content-between">
                                    <div>Contract No.</div>
                                    <div>{data?.contractNumber}</div>
                                </div>
                            )}
                            {data?.contractStartDate && (
                                <div className="d-flex justify-content-between">
                                    <div>Issue Date</div>
                                    <div>
                                        {convertToLocalTime(
                                            new Date(),
                                            CUSTOM_CONSTANT.DDMMYYYY
                                        )}
                                    </div>
                                </div>
                            )}
                            {data?.createdByName && (
                                <div className="d-flex justify-content-between">
                                    <div>Requestor</div>
                                    <div>{userDetails?.name}</div>
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
                            <div>{data?.supplierInformation?.companyName}</div>
                            <div>{data?.supplierInformation?.companyAddress?.addressFirstLine}</div>
                            <div>{data?.supplierInformation?.companyAddress?.addressSecondLine}</div>
                            <div>{data?.supplierInformation?.companyAddress?.state}</div>
                            <div>{data?.supplierInformation?.companyAddress?.city}</div>
                            <div>{data?.supplierInformation?.companyAddress?.postalCode}</div>
                            <div>{data?.supplierInformation?.companyAddress?.country}</div>
                            {data?.natureOfContract && (
                                <div className="mt-3">
                                    Project Title
                                    <span className="ml-4">{data?.projectName}</span>
                                </div>
                            )}
                        </Col>
                        <Col xs={6}>
                            {data?.supplierInformation?.contactInformation?.contactName && (
                                <div className="d-flex justify-content-between">
                                    <div>Person In-Charge</div>
                                    <div>{data?.supplierInformation?.contactInformation?.contactName}</div>
                                </div>
                            )}
                            {data?.supplierInformation?.contactInformation?.contactNumber && (
                                <div className="d-flex justify-content-between">
                                    <div>Contact Number</div>
                                    <div>{data?.supplierInformation?.contactInformation?.contactNumber}</div>
                                </div>
                            )}
                            {data?.supplierInformation?.contactInformation?.contactEmail && (
                                <div className="d-flex justify-content-between">
                                    <div>Email Address</div>
                                    <div>{data?.supplierInformation?.contactInformation?.contactEmail}</div>
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="py-5">
                        {data?.natureOfContract && (
                            <Table className="invoice-table">
                                <thead>
                                    <tr style={tableRowStyles}>
                                        <th className="font-weight-bold">ITEM</th>
                                        <th className="font-weight-bold">REMARK</th>
                                        <th className="font-weight-bold text-right">UOM</th>
                                        <th className="font-weight-bold text-right">QTY</th>
                                        <th className="font-weight-bold text-right">
                                            PRICE (
                                            {data.currencyCode}
                                            )
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.items?.map((item) => (
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
                                                        {data?.deliveryAddress && (
                                                            <div className="wrapTextPreview">
                                                                <div>Delivery Address:</div>
                                                                <div>
                                                                    {formatAddress(
                                                                        data?.deliveryAddress
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item?.note}</td>
                                            <td className="text-right">{item?.uom}</td>
                                            <td className="text-right">{formatDisplayDecimal(item.qty, 2)}</td>
                                            <td className="text-right">{formatDisplayDecimal(item.unitPrice, 2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        <Col xs={12} style={{ borderTop: "1px solid #E9ECEF" }}>
                            *The above rates are effective from
                            {" "}
                            {convertToLocalTime(data?.contractStartDate, CUSTOM_CONSTANT.DDMMYYYY)}
                            {" "}
                            to
                            {" "}
                            {convertToLocalTime(data?.contractEndDate, CUSTOM_CONSTANT.DDMMYYYY)}
                            .
                        </Col>
                        <Col xs={12} className="mt-3">
                            <b>
                                NOTES:
                                <br />
                            </b>
                            {data?.remarks ? data.remarks : "N/A"}
                        </Col>
                    </Row>
                </div>
            </Modal.Body>
        </Modal>
    );
});
ContractPreviewModal.displayName = "ContractPreviewModal";

export default ContractPreviewModal;
