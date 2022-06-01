/* eslint-disable max-len */
import React from "react";
import { useHistory } from "react-router-dom";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Label
} from "components";
import { ErrorMessage, Field } from "formik";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { RadioButton } from "primereact/radiobutton";
import { Link } from "react-router-dom";
import URL_CONFIG from "services/urlConfig";
import { RFQ_ROUTES } from "routes/P2P/RequestForQuotation";
import { HorizontalInput, SelectInput } from "../../components";

const InitialSettingsComponent = (props) => {
    const history = useHistory();
    const {
        t,
        values,
        errors,
        touched,
        handleChange,
        projects,
        currencies,
        disabled,
        onChangeProject,
        isConvertPPR,
        disabledPRNo,
        setFieldValue
    } = props;

    const handleChangeRFQProcess = (event) => {
        const { value } = event;
        if (Boolean(value) === true) {
            setFieldValue("rfqProcess", Boolean(value));
            history.push({
                pathname: RFQ_ROUTES.RAISE_RFQ,
                search: `?prUuid=${values.purchaseUuid}`
            });
        }
        if (Boolean(value) === false) {
            setFieldValue("rfqProcess", Boolean(value));
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                {
                    values.pprNumber
                    && (
                        <Row>
                            <Col xs={12}>
                                <Row className="form-group">
                                    <Col md={4} lg={4}>
                                        <Label className="p-0">{t("PrePurchaseRequestNo")}</Label>
                                    </Col>
                                    <Col md={8} lg={8}>
                                        <div
                                            className="form-control"
                                            style={{
                                                backgroundColor: "#F9FAFC"
                                            }}
                                        >
                                            <Link to={{
                                                pathname: URL_CONFIG.PPR_ROUTING.DETAIL_PRE_REQUISITIONS,
                                                search: `?uuid=${values.pprUuid}`
                                            }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#4472C4",
                                                        textDecoration: "underline"
                                                    }}
                                                >
                                                    {values.pprNumber}
                                                </span>
                                            </Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    )
                }
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prNumber"
                            label={t("PurchaseRequestNo")}
                            type="text"
                            disabled={disabled || disabledPRNo}
                            className="label-required"
                            value={values.prNumber}
                            errors={errors.projectCode}
                            touched={touched.projectCode}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Row className=" label-required form-group">
                            <Col md={4} lg={4}>
                                <Label className="p-0">{t("Currency")}</Label>
                            </Col>
                            <Col md={8} lg={8}>
                                <Field name="currencyCode">
                                    {({ field }) => (
                                        <select
                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                            {...field}
                                            className={
                                                classNames(
                                                    "form-control",
                                                    { "is-invalid": errors.currencyCode && touched.currencyCode }
                                                )
                                            }
                                            onChange={handleChange}
                                            disabled
                                            value={values.currencyCode}
                                        >
                                            <option value="" hidden defaultValue>{t("PleaseSelectACurrency")}</option>
                                            {currencies
                                                .map((option) => (
                                                    <option
                                                        key={uuidv4()}
                                                        value={option.currencyCode}
                                                    >
                                                        {`${option.currencyName} (+${option.currencyCode})`}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name="currencyCode" component="div" className="invalid-feedback" />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {values.project && (
                    <>
                        {projects?.length > 0 && (
                            <Row>
                                <Col xs={12}>
                                    <SelectInput
                                        name="projectCode"
                                        label={t("Project")}
                                        className="label-required mb-0"
                                        placeholder={t("PleaseSelectProject")}
                                        errors={errors.projectCode}
                                        touched={touched.projectCode}
                                        options={projects}
                                        optionLabel="projectCode"
                                        optionValue="projectCode"
                                        onChange={(e) => onChangeProject(e)}
                                        value={values.projectCode}
                                        disabled={!!values.pprNumber || disabled}
                                    />
                                </Col>
                            </Row>
                        )}
                        {projects?.length === 0 && (
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="projectCode"
                                        label={t("Project")}
                                        type="text"
                                        disabled={!!values.pprNumber || disabled}
                                        className="label-required"
                                        value={values.projectCode}
                                        errors={errors.projectCode}
                                        touched={touched.projectCode}
                                    />
                                </Col>
                            </Row>
                        )}
                    </>
                )}
                {
                    isConvertPPR && (
                        <Row className="pt-3">
                            <Col xs={4}>
                                <Label className="p-0">{t("Do you want to go for RFQ Process?")}</Label>
                            </Col>
                            <Col xs={4}>
                                <Field name="rfqProcess">
                                    {({ field }) => (
                                        <Row className="align-items-center mx-0">
                                            <RadioButton
                                                {...field}
                                                inputId="rfqProcess"
                                                checked={values.rfqProcess}
                                                onChange={handleChangeRFQProcess}
                                                value
                                            />
                                            <Label htmlFor="rfqProcess" className="mb-0 ml-2">
                                                {t("Yes")}
                                            </Label>
                                        </Row>
                                    )}
                                </Field>
                            </Col>
                            <Col xs={4}>
                                <Field name="rfqProcess">
                                    {({ field }) => (
                                        <Row className="align-items-center mx-0">
                                            <RadioButton
                                                {...field}
                                                inputId="rfqProcess"
                                                checked={!values.rfqProcess}
                                                onChange={handleChangeRFQProcess}
                                                value={false}
                                            />
                                            <Label htmlFor="rfqProcess" className="mb-0 ml-2">
                                                {t("No")}
                                            </Label>
                                        </Row>
                                    )}
                                </Field>
                            </Col>
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default InitialSettingsComponent;
