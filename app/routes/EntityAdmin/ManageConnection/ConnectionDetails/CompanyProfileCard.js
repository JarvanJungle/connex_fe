/* eslint-disable max-len */
import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { Checkbox } from "primereact/checkbox";
import classNames from "classnames";
import classes from "./ConnectionDetails.scss";

function CompanyProfileCard(props) {
    const { t, detailsStates } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("CompanyProfile")}
            </CardHeader>
            <CardBody>
                <Row className="form-group justify-content-between">
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <Label className={classes.inputText1}>
                                    {t("ResponseStatus")}
                                </Label>
                            </Col>
                            <Col xs={8}>
                                <span className={classes.inputText2}>
                                    {`${detailsStates.companyDetails.status?.toUpperCase()}`}
                                </span>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6} />
                </Row>
                <Row className="form-group label-required justify-content-between">
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <Label className={classes.inputText1}>
                                    {t("CompanyRegNo")}
                                </Label>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {detailsStates.companyDetails.companyRegistrationNumber?.toUpperCase()}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <Label className={classes.inputText1}>
                                    {t("CompanyNameNoAsterisk")}
                                </Label>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {`${detailsStates.companyDetails.entityName}`}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row
                    className={classNames("form-group label-required justify-content-between", {
                        "mb-0": !detailsStates.companyDetails.gstApplicable
                    })}
                >
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <Label className={classes.inputText1}>
                                    {t("PaymentTerm")}
                                </Label>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {detailsStates.companyDetails?.paymentTerm?.ptName}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <Label className={classes.inputText1}>
                                    {t("CountryOfOrigin")}
                                </Label>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {`${detailsStates.companyDetails.country}`}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {
                    detailsStates.companyDetails.gstApplicable
                    && (
                        <Row className="justify-content-between">
                            <Col xs={6}>
                                <Row>
                                    <Col xs={4} />
                                    <Col xs={8}>
                                        <Checkbox
                                            name="gstApplicable"
                                            inputId="gstApplicable"
                                            checked={detailsStates.companyDetails.gstApplicable}
                                        />
                                        <label htmlFor="buyer" className={`mb-0 ml-2 ${classes.inputText2}`}>{t("TaxRegisteredBusiness")}</label>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={6}>
                                <Row>
                                    <Col xs={4}>
                                        <span className={classes.inputText1}>
                                            {t("GSTRegNo")}
                                        </span>
                                    </Col>
                                    <Col xs={8}>
                                        <span className={classes.inputText2}>
                                            {detailsStates.companyDetails.gstNo?.toUpperCase()}
                                        </span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
}

export default CompanyProfileCard;
