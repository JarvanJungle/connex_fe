import { Formik } from "formik";
import { Container } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import PaymentCycleService from "services/PaymentCycleService";
import useToast from "routes/hooks/useToast";
import { useSelector } from "react-redux";
import PaymentCycleForm from "../components/PaymentCycleForm";
import PAYMENT_CYCLE_FORM_INITIAL_VALUES from "../components/PaymentCycleFormInitialValues";
import PAYMENT_CYCLE_ROUTE from "../routes";
import PAYMENT_CYCLE_FORM_VALIDATION_SCHEMA from "../components/PaymentCycleFormValidation";

const CreatePaymentCycle = () => {
    const history = useHistory();
    const showToast = useToast();
    const permissionReducer = useSelector((s) => s.permissionReducer);
    const [loading, setLoading] = useState(false);
    const [companyUuid, setCompanyUuid] = useState(null);

    useEffect(() => {
        setCompanyUuid(permissionReducer?.currentCompany?.companyUuid);
    }, [permissionReducer]);

    const onCreate = async (data) => {
        setLoading(true);
        try {
            await PaymentCycleService.createPaymentCycle(companyUuid, {
                paymentCycleCode: data.paymentCycleCode,
                paymentCycleDate: Number(data.paymentCycleDate),
                description: data.description,
                active: data.active,
                supplierUuids: data?.paymentCycleSupplierList?.map((v) => v.uuid) || []
            });
            showToast("success", "Payment cycle successfully created");
            history.push(PAYMENT_CYCLE_ROUTE.PAYMENT_CYCLES_LIST);
        } catch (e) {
            showToast("error", e?.response?.data?.message || e?.message);
        }
        setLoading(false);
    };

    return (
        <Container fluid>
            <Formik
                initialValues={PAYMENT_CYCLE_FORM_INITIAL_VALUES}
                validationSchema={PAYMENT_CYCLE_FORM_VALIDATION_SCHEMA}
                enableReinitialize
                onSubmit={onCreate}
            >
                {(props) => (
                    <PaymentCycleForm
                        loading={loading}
                        formik={props}
                        companyUuid={companyUuid}
                        history={history}
                    />
                )}
            </Formik>
        </Container>
    );
};

export default CreatePaymentCycle;
