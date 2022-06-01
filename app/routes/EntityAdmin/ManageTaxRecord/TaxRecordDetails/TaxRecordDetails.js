import React, { useState, useEffect, useRef } from "react";
import "./TaxRecordDetails.scss";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { HeaderMain } from "routes/components/HeaderMain";
import ButtonSpinner from "components/ButtonSpinner";
import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    FormGroup,
    Button,
    Col
} from "components";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import TaxRecordDataService from "services/TaxRecordService";
import useToast from "routes/hooks/useToast";
import { Checkbox } from "primereact/checkbox";
import { FEATURE } from "helper/constantsDefined";
import { usePermission } from "routes/hooks";
import { debounce } from "helper/utilities";

const TaxRecordDetails = () => {
    let message = "Opp! Something went wrong.";
    const toast = useToast();
    const showToast = (type) => toast(type, message);

    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [detailsStates, setDetailsStates] = useState({
        isEdit: false,
        isCreate: false,
        colWidth: 8,
        isLoading: false,
        taxRecord: {
            taxCode: "",
            taxRate: "",
            description: "",
            active: false,
            companyUuid: ""
        }
    });
    const formRef = useRef();
    const [isActive, setIsActive] = useState(true);
    const [isDefault, setIsDefault] = useState(false);
    const handleRolePermission = usePermission(FEATURE.TAX);

    const getDetails = () => {
        // get the uuid
        const query = new URLSearchParams(location.search);
        const token = query.get("uuid");
        const companyRole = JSON.parse(localStorage.getItem("companyRole"));
        if (token !== null) {
            TaxRecordDataService
                .getTaxRecord({ companyUuid: companyRole.companyUuid, taxCode: token })
                .then((response) => {
                    if (response.data.status === "OK") {
                        setDetailsStates((prevStates) => ({
                            ...prevStates,
                            taxRecord: {
                                ...response.data.data,
                                taxRate: response.data.data.taxRate.toFixed(2),
                                companyUuid: companyRole.companyUuid
                            },
                            isEdit: false
                        }));
                        setIsActive(response.data.data.active);
                        setIsDefault(response.data.data.default);
                    } else {
                        throw new Error(response.data.message);
                    }
                }).catch((error) => {
                    showToast("error", error.message);
                });
        }

        // for create path
        if (location.pathname.includes("create")) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                isCreate: true,
                taxRecord: {
                    ...prevStates.taxRecord,
                    companyUuid: companyRole.companyUuid
                }
            }));
        }
    };

    useEffect(() => {
        getDetails();
    }, []);

    const toggleEdit = () => {
        if (detailsStates.isEdit) getDetails();
        else {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                isEdit: true
            }));
        }
    };

    const handleInvalidSubmit = () => {
        message = "Validation error, please check your input";
        showToast("error");
    };

    const handleValidSubmit = (event, values) => {
        setIsLoading(true);
        const record = {
            taxCode: values.taxCode,
            taxRate: values.taxRate,
            description: values.description,
            companyUuid: detailsStates.taxRecord.companyUuid,
            active: isActive,
            isDefault
        };

        if (!detailsStates.isCreate) {
            TaxRecordDataService.postUpdateTaxRecord(record).then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    message = "Update Successfully";
                    showToast("success");
                    setIsLoading(false);
                    toggleEdit();
                } else {
                    message = response.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response?.data?.message;
                showToast("error");
                setIsLoading(false);
            });
        } else {
            TaxRecordDataService.postCreateTaxRecord(record).then((response) => {
                setIsLoading(false);
                if (response.data.status === "OK") {
                    message = "Tax has been created successfully";
                    showToast("success");
                    history.goBack();
                } else {
                    message = response.data.message;
                    showToast("error");
                }
            }).catch((error) => {
                message = error.response?.data?.message;
                showToast("error");
                setIsLoading(false);
            });
        }
    };

    const onBackButtonPressHandler = () => {
        if (detailsStates.isEdit) {
            toggleEdit();
        } else {
            history.goBack();
        }
    };

    return (
        <>
            <AvForm
                onValidSubmit={debounce(handleValidSubmit)}
                onInvalidSubmit={debounce(handleInvalidSubmit)}
                ref={formRef}
            >
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            <HeaderMain
                                title={!detailsStates.isCreate ? (t("Tax Record Details")) : (t("Create Tax Record"))}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <Card>
                                <CardHeader tag="h6">
                                    {t("Tax Record Details")}
                                </CardHeader>
                                <CardBody>
                                    <Col lg={4}>
                                        <FormGroup>
                                            <div className="label-required">
                                                <AvField
                                                    type="text"
                                                    name="taxCode"
                                                    label={t("TaxCode")}
                                                    placeholder={t("Enter Tax Code")}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("Please enter valid tax code") },
                                                        maxLength: { value: 20 },
                                                        pattern: { value: "^[a-zA-Z0-9_\\s]+$", errorMessage: "Please enter valid tax code" }
                                                    }}
                                                    value={detailsStates.taxRecord.taxCode}
                                                    disabled={!detailsStates.isCreate}
                                                />
                                            </div>
                                            <div className="label-required">
                                                <AvField
                                                    type="number"
                                                    name="taxRate"
                                                    label={t("TaxRate")}
                                                    className="number-input"
                                                    placeholder={t("Enter Tax Rate")}
                                                    validate={{
                                                        min: { value: 0, errorMessage: t("Please enter valid tax rate") },
                                                        required: { value: true, errorMessage: t("Tax tate is required") },
                                                        number: { value: true }
                                                    }}
                                                    value={detailsStates.taxRecord.taxRate}
                                                    disabled={
                                                        !detailsStates.isEdit && !detailsStates.isCreate
                                                    }
                                                    onChange={(e) => setDetailsStates({
                                                        ...detailsStates,
                                                        taxRecord: {
                                                            ...detailsStates.taxRecord,
                                                            taxRate: Number(e.target.value) || detailsStates.taxRecord.taxRate
                                                        }
                                                    })}
                                                    onBlur={() => setDetailsStates({
                                                        ...detailsStates,
                                                        taxRecord: {
                                                            ...detailsStates.taxRecord,
                                                            taxRate: detailsStates?.taxRecord?.taxRate?.toFixed?.(2)
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <AvField
                                                type="textarea"
                                                name="description"
                                                label={t("Description")}
                                                placeholder={t("Description")}
                                                validate={{
                                                    maxLength: { value: 200 }
                                                }}
                                                value={detailsStates.taxRecord.description}
                                                disabled={
                                                    !detailsStates.isEdit && !detailsStates.isCreate
                                                }
                                            />
                                        </FormGroup>
                                    </Col>
                                </CardBody>
                            </Card>
                            <Card className="mt-3">
                                <CardBody>
                                    <div className="p-field-checkbox">
                                        <Checkbox
                                            checked={isDefault}
                                            onChange={() => setIsDefault(!isDefault)}
                                            disabled={!detailsStates.isEdit && !detailsStates.isCreate}
                                            id="tax"
                                        />
                                        <label className="mb-0 ml-2" htmlFor="tax">{t("Set Default Tax")}</label>
                                    </div>

                                    <div className="p-field-checkbox">
                                        <Checkbox
                                            checked={isActive}
                                            onChange={() => setIsActive(!isActive)}
                                            disabled={!detailsStates.isEdit}
                                            id="active"
                                        />
                                        <label className="mb-0 ml-2" htmlFor="active">{t("Is Active")}</label>
                                    </div>

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <StickyFooter>
                    <Row className="justify-content-between mx-0 px-3">
                        <Button
                            color="secondary"
                            className="mb-2"
                            onClick={onBackButtonPressHandler}
                        >
                            {t("Back")}
                        </Button>
                        {
                            detailsStates.isCreate ? (
                                <ButtonSpinner text={t("Create")} className="mb-2" isLoading={isLoading} type="submit" />
                            ) : (
                                <>
                                    {
                                        detailsStates.isEdit ? (
                                            <ButtonSpinner className="mb-2" isLoading={isLoading} type="submit" text={t("Save")} />
                                        ) : (handleRolePermission?.write && (
                                            <Button className="mb-2 btn-facebook" onClick={toggleEdit}>
                                                {`${t("Edit")} `}
                                                <i className="fa fa-pencil ml-1" />
                                            </Button>
                                        )
                                        )
                                    }
                                </>
                            )
                        }
                    </Row>
                </StickyFooter>
            </AvForm>
        </>
    );
};

export default TaxRecordDetails;
