import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { v4 as uuidv4 } from "uuid";
import classes from "./ConnectionDetails.scss";

function CompanyAddressCard(props) {
    const { t, companyDetails } = props;
    const { addressDtoList } = companyDetails;
    return (
        <>
            {
                addressDtoList && (
                    addressDtoList.map((address) => (
                        <Card className="mb-4" key={uuidv4()}>
                            <CardHeader tag="h6">
                                {t("CompanyAddress")}
                            </CardHeader>
                            <CardBody>
                                <Row className="form-group justify-content-between label-required">
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4}>
                                                <span className={classes.inputText1}>
                                                    {t("AddressLabel")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <div className={classes.inputText2}>
                                                    {address.addressLabel}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="form-group justify-content-between">
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4} className="label-required">
                                                <span className={classes.inputText1}>
                                                    {t("AddressLine1")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <div className={classes.inputText2}>
                                                    {address.addressFirstLine}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4}>
                                                <span className={classes.inputText1}>
                                                    {t("AddressLine2")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <div className={classes.inputText2}>
                                                    {address.addressSecondLine}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="form-group justify-content-between">
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4}>
                                                <span className={classes.inputText1}>
                                                    {t("City")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <div className={classes.inputText2}>
                                                    {address.city}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4} className="label-required">
                                                <span className={classes.inputText1}>
                                                    {t("PostalCode")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <div className={classes.inputText2}>
                                                    {address.postalCode}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="form-group justify-content-between">
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4} className="label-required">
                                                <span className={classes.inputText1}>
                                                    {t("StateProvince")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <span className={classes.inputText2}>
                                                    {address.state}
                                                </span>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={6}>
                                        <Row>
                                            <Col xs={4} className="label-required">
                                                <span className={classes.inputText1}>
                                                    {t("Country")}
                                                </span>
                                            </Col>
                                            <Col xs={8}>
                                                <span className={classes.inputText2}>
                                                    {address.country}
                                                </span>
                                            </Col>
                                        </Row>
                                    </Col>

                                </Row>
                            </CardBody>
                        </Card>
                    ))
                )
            }
        </>
    );
}

export default CompanyAddressCard;
