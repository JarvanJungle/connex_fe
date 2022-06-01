import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import classes from "./ConnectionDetails.scss";

function ContactInformationCard(props) {
    const { t, detailsStates } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("MainContactInformation")}
            </CardHeader>
            <CardBody>
                <Row className="form-group justify-content-between label-required">
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <Label className={classes.inputText1}>
                                    {t("FullName")}
                                </Label>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {detailsStates.companyDetails
                                        .contactInformation.name}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <span className={classes.inputText1}>
                                    {t("ContactNumber")}
                                </span>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {`+${detailsStates.companyDetails.contactInformation.countryCode || "65"} ${detailsStates.companyDetails.contactInformation.workNumber}`}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="justify-content-between label-required">
                    <Col xs={6}>
                        <Row>
                            <Col xs={4}>
                                <span className={classes.inputText1}>
                                    {t("EmailAddress")}
                                </span>
                            </Col>
                            <Col xs={8}>
                                <div className={classes.inputText2}>
                                    {detailsStates.companyDetails
                                        .contactInformation.email}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={6} />
                </Row>
            </CardBody>
        </Card>
    );
}

export default ContactInformationCard;
