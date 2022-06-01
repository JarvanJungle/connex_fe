import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useHistory, useLocation } from "react-router";
import {
    Container,
    Col,
    Row,
    Button
} from "components";
import { AvForm } from "availity-reactstrap-validation";
import useToast from "routes/hooks/useToast";
import { HeaderMain } from "routes/components/HeaderMain";
import StickyFooter from "components/StickyFooter";
import ButtonSpinner from "components/ButtonSpinner";
import PaymentTermService from "services/PaymentTermService";
import { useCurrentCompany, usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import { debounce } from "helper/utilities";
import PaymentForm from "./PaymentForm";

const PaymentTermDetails = (props) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const [isCreate, setIsCreate] = useState(true);
    const [isEdit, setIsEdit] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [detailsStates, setDetailsStates] = useState({
        companyUuid: "",
        uuid: ""
    });
    const paymentTermPermission = usePermission(FEATURE.PAYMENT_TERM);
    const [form, setForm] = useState({
        isActive: false
    });
    const [backupForm, setBackupForm] = useState({});
    const currentCompany = useCurrentCompany();

    const updateForm = (name, value) => {
        setForm({
            ...form,
            [name]: value
        });
    };

    useEffect(() => {
        // Retrieve uuid of payment term if is edit
        const query = new URLSearchParams(props.location.search);
        const uuid = query.get("uuid");
        if (uuid) {
            setIsCreate(false);
            setIsEdit(false);
        }

        // Retrieve company uuid
        if (!_.isEmpty(currentCompany)) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompany.companyUuid,
                uuid
            }));
        }
    }, [currentCompany]);

    // Get details of payment terms
    const getPaymentTermsDetail = async () => {
        try {
            if (detailsStates.companyUuid && detailsStates.uuid) {
                const response = await PaymentTermService.getPaymentTermByUuid(detailsStates.companyUuid, detailsStates.uuid);
                if (response.data.status === "OK") {
                    const {
                        ptRemarks,
                        ptName,
                        ptDays,
                        createdByName,
                        createdOn
                    } = response.data.data;
                    setForm((prevStates) => ({
                        ...prevStates,
                        ptRemarks,
                        ptUuid: detailsStates.uuid,
                        ptName,
                        ptDays,
                        createdByName,
                        createdOn
                    }));
                    setBackupForm((prevStates) => ({
                        ...prevStates,
                        ptRemarks,
                        ptUuid: detailsStates.uuid,
                        ptName,
                        ptDays,
                        createdByName,
                        createdOn
                    }));
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    useEffect(() => {
        getPaymentTermsDetail();
    }, [detailsStates]);

    const handleCreateOrUpdate = async () => {
        try {
            console.log("form", form);
            setIsLoading(true);
            if (isCreate) {
                const data = {
                    ptName: form.ptName,
                    ptDays: form.ptDays,
                    ptRemarks: form.ptRemarks
                };
                const response = await PaymentTermService.createPaymentTerm(detailsStates.companyUuid, data);
                if (response.data.status === "OK") {
                    showToast("success", "Create Succesfully");
                    setTimeout(() => {
                        setIsLoading(false);
                        history.goBack();
                    }, 1000);
                } else {
                    throw new Error(response.data.message);
                }
            } else {
                const data = {
                    ptRemarks: form.ptRemarks,
                    ptUuid: form.ptUuid
                };
                const response = await PaymentTermService.updatePaymentTerm(detailsStates.companyUuid, data);
                if (response.data.status === "OK") {
                    showToast("success", "Update Succesfully");
                    setIsLoading(false);
                    setIsEdit(false);
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error?.response?.data?.message || error.message);
            setIsLoading(false);
        }
    };

    const handleValidSubmit = handleCreateOrUpdate;

    const handleInvalidSubmit = () => {
        showToast("error", "Validation error, please check your input");
    };

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    };

    const onBackButtonPressHandler = () => {
        if (isEdit) {
            setIsEdit(!isEdit);
            setForm(backupForm);
        }
    };

    return (
        <>
            <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            {
                                location.pathname === "/create-payment-terms"
                                    ? (
                                        <HeaderMain
                                            title={(t("CreateNewPaymentTerm"))}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                                    : (
                                        <HeaderMain
                                            title={(t("PaymentTermDetails"))}
                                            className="mb-3 mb-lg-3"
                                        />
                                    )
                            }
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col lg={12}>
                            <PaymentForm
                                isCreate={isCreate}
                                isEdit={isEdit}
                                form={form}
                                updateForm={updateForm}
                                headerName={isCreate ? t("NewPaymentTermItem") : t("PaymentTermDetails")}
                            />
                        </Col>
                    </Row>
                </Container>
                <StickyFooter>
                    <Row className="justify-content-between mx-0 px-3">
                        <Button
                            className="mb-2 btn btn-secondary"
                            onClick={() => (isEdit ? onBackButtonPressHandler() : history.goBack())}
                        >
                            {t("Back")}
                        </Button>
                        {paymentTermPermission.write && (

                            isCreate ? (
                                <ButtonSpinner text={t("Create")} className="mb-2" isLoading={isLoading} type="submit" />
                            ) : (
                                <>
                                    {
                                        isEdit ? (
                                            <ButtonSpinner className="mb-2" isLoading={isLoading} type="submit" text={t("Save")} />
                                        ) : (
                                            <Button className="mb-2 btn-facebook btn-secondary" onClick={toggleEdit}>
                                                {`${t("Edit")} `}
                                                <i className="fa fa-pencil ml-1" />
                                            </Button>
                                        )
                                    }
                                </>
                            )
                        )}
                    </Row>
                </StickyFooter>
            </AvForm>
        </>
    );
};

export default PaymentTermDetails;
