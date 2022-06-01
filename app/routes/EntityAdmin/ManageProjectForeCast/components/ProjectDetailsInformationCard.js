import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label,
    Input
} from "components";
import classes from "./ProjectForecast.module.scss";
import HorizontalField from "./HorizontalField";

const ProjectDetailsInformationCard = (props) => {
    const { t, detailsStates } = props;

    const formatBudget = (number) => Number(number).toLocaleString("en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("ProjectForecastInformation")}
            </CardHeader>
            <CardBody>
                <Col lg={12}>
                    <Row className="d-lg-flex justify-content-between">
                        <Col lg={6}>
                            <HorizontalField className="label-required" id="project-code" label={t("ProjectForecastCode")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectCode} />
                        </Col>
                        <Col lg={6}>
                            <HorizontalField className="label-required" id="title" label={t("ProjectForecastTitle")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectTitle} />
                        </Col>
                    </Row>
                    <Row className="d-lg-flex justify-content-between">
                        <Col lg={6}>
                            <HorizontalField id="erp" label={t("ERP Project Code")} inputType="text" placeholder="ERP Project Code" disabled asterisk content={detailsStates?.erpProjectCode} />
                        </Col>
                        <Col lg={6} />
                    </Row>
                    <Row className="d-lg-flex justify-content-between">
                        <Col lg={6}>
                            <HorizontalField className="label-required" id="start-date" label={t("ProjectForecastStartDate")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.startDate} />
                            <HorizontalField className="label-required" id="currency" label={t("Currency")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.currency} />
                            <HorizontalField id="approved-budget" label={t("ProjectForecastApprovedPRBudget")} inputType="text" placeholder="placeholder" disabled asterisk content={`${detailsStates.currency} ${formatBudget(detailsStates.approvedPrBudget || 0)}`} />
                        </Col>
                        <Col lg={6}>
                            <HorizontalField className="label-required" id="end-date" label={t("ProjectForecastEndDate")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.endDate} />
                            <HorizontalField className="label-required" id="overall-budget" label={t("ProjectForecastOverallBudget")} inputType="text" placeholder="placeholder" disabled asterisk content={`${detailsStates.currency} ${formatBudget(detailsStates.overallBudget || 0)}`} />
                            <HorizontalField id="issued-budget" label={t("ProjectForecastIssuedPOBudget")} inputType="text" placeholder="placeholder" disabled asterisk content={`${detailsStates.currency} ${formatBudget(detailsStates.issuedPoBudget || 0)}`} />
                        </Col>
                    </Row>
                    <Row className="d-lg-flex justify-content-between">
                        <Col lg={6}>
                            <HorizontalField className="label-required" id="address" label={t("ProjectForecastAddress")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.addressLabel} />
                            <HorizontalField id="address-first-line" label={t("ProjectForecastAddressFirstLine")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.addressFirstLine} />
                            <HorizontalField id="postal-cde" label={t("PostalCode")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.postalCode} />
                            <HorizontalField id="state" label={t("StateProvince")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.state} />
                        </Col>
                        <Col lg={6} className="align-self-end">
                            <HorizontalField id="address-second-line" label={t("ProjectForecastAddressSecondLine")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.addressSecondLine} />
                            <HorizontalField id="country" label={t("Country")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.country} />
                            <HorizontalField id="city" label={t("City")} inputType="text" placeholder="placeholder" disabled asterisk content={detailsStates.projectAddressDto?.city} />
                        </Col>
                    </Row>
                    <div className="mb-4 justify-content-around d-flex flex-row label-required">
                        <Label xs={2} className={`${classes.label} p-0 mr-1`}>{t("ProjectForecastDescription")}</Label>
                        <Input xs={10} type="textarea" rows={5} value={detailsStates.projectDescription} disabled />
                    </div>
                </Col>
            </CardBody>
        </Card>
    );
};

export default ProjectDetailsInformationCard;
