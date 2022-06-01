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

const ProjectForecastInformationCard = (props) => {
    const { t, detailsStates } = props;
    const value = "abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc";
    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("ProjectForecastInformation")}
            </CardHeader>
            <CardBody>
                <Col lg={12}>
                    <Row className="d-lg-flex justify-content-between mb-4">
                        <Col lg={6}>
                            <HorizontalField id="label" label={t("ProjectForecastCode")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastERP")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastStartDate")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastCreatedOn")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                        </Col>
                        <Col lg={6}>
                            <HorizontalField id="label" label={t("ProjectForecastTitle")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastStatus")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastEndDate")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastCreatedBy")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                        </Col>
                    </Row>

                    <Row className="d-lg-flex justify-content-between mb-4">
                        <Col lg={6}>
                            <HorizontalField id="label" label={t("ProjectForecastCurrency")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastApprovedPRBudget")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                        </Col>
                        <Col lg={6}>
                            <HorizontalField id="label" label={t("ProjectForecastOverallBudget")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastIssuedPOBudget")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                        </Col>
                    </Row>

                    <Row className="d-lg-flex justify-content-between">
                        <Col lg={6}>
                            <HorizontalField id="label" label={t("ProjectForecastAddress")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("ProjectForecastAddressFirstLine")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("PostalCode")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("StateProvince")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                        </Col>
                        <Col lg={6} className="align-self-end">
                            <HorizontalField id="label" label={t("ProjectForecastAddressSecondLine")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("Country")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                            <HorizontalField id="label" label={t("City")} inputType="text" placeholder="placeholder" disabled asterisk content={value} />
                        </Col>
                    </Row>
                    <div className="mb-4 justify-content-around d-flex flex-row">
                        <Label xs={2} className={`${classes.label} p-0 mr-1`}>{t("ProjectForecastDescription")}</Label>
                        <Input xs={10} type="textarea" value="asdasdasasdassadasdsdadsdasdasdsadasdsdasdsdasdasdasasdassadasdsdadsdasdasdsadasdsdasdsdasdasdasasdassadasdsdadsdasdasdsadasdsdasdsdasdasdasasdassadasdsdadsdasdasdsadasdsdasdsdasdasdasasdassadasdsdadsdasdasdsadasdsdasdsdasdasdasasdassad" disabled />
                    </div>
                </Col>
            </CardBody>
        </Card>
    );
};

export default ProjectForecastInformationCard;
