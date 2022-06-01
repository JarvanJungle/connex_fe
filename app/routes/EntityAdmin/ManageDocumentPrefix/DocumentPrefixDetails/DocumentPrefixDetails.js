import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useToast from "routes/hooks/useToast";
import {
    Container,
    Col,
    Row,
    Button,
    ButtonToolbar
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import StickyFooter from "components/StickyFooter";
import { useHistory } from "react-router";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { Formik, Form } from "formik";
import _ from "lodash";
import * as Yup from "yup";
import { useCurrentCompany, usePermission } from "routes/hooks";
import PrefixForm from "./PrefixForm";

const DocumentPrefixDetails = (props) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const [isEdit, setIsEdit] = useState(false);
    const [detailsStates, setDetailsStates] = useState({
        companyUuid: "",
        uuid: ""
    });
    const [prefixForm, setPrefixForm] = useState({});
    const [backupForm, setBackupForm] = useState({});

    const currentCompany = useCurrentCompany();
    const handleRolePermission = usePermission(FEATURE.DOCUMENT_PREFIX);

    const initialValues = {
        functionName: "",
        type: "",
        prefix: "",
        dateDynamicPrefix: "",
        numberOfDigits: "",
        startingNumber: "",
        defaultCurrentNumber: "",
        startingNumberFormat: "",
        prefixUuid: "",
        prefixSampleOutput: "",
        prefixSampleFormat: "",
        projectCode: false,
        dateDynamic: false,
        editStartingNumber: true
    };

    useEffect(() => {
        // Retrieve uuid of payment term if is edit
        const query = new URLSearchParams(props.location.search);
        const uuid = query.get("uuid");

        // Retrieve company uuid
        if (!_.isEmpty(currentCompany)) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompany.companyUuid,
                uuid
            }));
        }
    }, [currentCompany]);

    const retrievePrefixDetails = async () => {
        try {
            const response = await DocumentPrefixService.getPrefixDetails(detailsStates.companyUuid, detailsStates.uuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const prefixDetails = response.data.data;
                if (prefixDetails.defaultCurrentNumber) {
                    prefixDetails.startingNumberFormat = prefixDetails.defaultCurrentNumber.toString().padStart(prefixDetails.numberOfDigits, "0");
                }
                if (prefixDetails.changeLog) {
                    delete prefixDetails.changeLog;
                }
                prefixDetails.editStartingNumber = prefixDetails.defaultCurrentNumber === prefixDetails.startingNumber;
                setPrefixForm(() => ({
                    ...initialValues,
                    ...prefixDetails
                }));
                setBackupForm(() => ({
                    ...initialValues,
                    ...prefixDetails
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        if (detailsStates.uuid && detailsStates.companyUuid) {
            retrievePrefixDetails();
        }
    }, [detailsStates]);

    const onSavePrefixHandler = async (values) => {
        const data = _.cloneDeep(values);
        try {
            const response = await DocumentPrefixService
                .updatePrefix(detailsStates.companyUuid, data);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                retrievePrefixDetails();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onBackButtonPressHandler = () => {
        if (isEdit) {
            setPrefixForm((prevStates) => ({
                ...backupForm,
                hasChanged: prevStates.hasChanged ? !prevStates.hasChanged : true
            }));
            setIsEdit(!isEdit);
        } else {
            history.goBack();
        }
    };

    useEffect(() => {
    }, [prefixForm]);

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    };

    const validationSchema = Yup.object().shape({
        type: Yup.string().required(t("PleaseSelectPrefixStatus")),
        prefix: Yup.string()
            .when("type", {
                is: (val) => val === "Configure",
                then: Yup.string().max(3, t("PrefixCanOnlyContains3Characters")).required(t("PleaseFillInPrefix"))
            }),
        numberOfDigits: Yup.number()
            .when("type", {
                is: (val) => val === "Configure",
                then: Yup.number().transform((value) => (Number.isNaN(value) || value === -1 ? undefined : value)).required(t("PleaseSelectNumberOfDigits"))
            })
        // startingNumberFormat: Yup.string()
        //     .test({
        //         name: "startingNumberFormatLength",
        //         message: t("LengthOfRunningNumberMustMatchNumberOfDigits"),
        //         test: (val, schema) => (val && val.length === schema.parent.numberOfDigits)
        //     })
    });

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={(t("DocumentPrefixDetails"))}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col lg={12}>
                        <Formik
                            enableReinitialize
                            initialValues={_.isEmpty(prefixForm) ? initialValues : prefixForm}
                            validationSchema={validationSchema}
                            onSubmit={(data) => {
                                onSavePrefixHandler(data);
                            }}
                        >
                            {({
                                errors, values, touched, handleChange, dirty, setFieldValue, handleSubmit
                            }) => (
                                <Form>
                                    <PrefixForm
                                        errors={errors}
                                        values={values}
                                        touched={touched}
                                        handleChange={handleChange}
                                        dirty={dirty}
                                        setFieldValue={setFieldValue}
                                        isEdit={isEdit}
                                    />
                                    <StickyFooter>
                                        <Row className="mx-0 px-3 justify-content-between">
                                            <Button
                                                className="mb-2 btn btn-secondary"
                                                onClick={onBackButtonPressHandler}
                                            >
                                                {t("Back")}
                                            </Button>
                                            {
                                                isEdit ? (
                                                    <ButtonToolbar>
                                                        <Button
                                                            className="mb-2"
                                                            color="primary"
                                                            type="button"
                                                            onClick={
                                                                () => {
                                                                    handleSubmit();
                                                                    if (!_.isEmpty(errors)) {
                                                                        showToast("error", "Validation error, please check your input.");
                                                                    }
                                                                }
                                                            }
                                                        >
                                                            {t("Save")}
                                                        </Button>
                                                    </ButtonToolbar>
                                                ) : (handleRolePermission?.write && (
                                                    <Button className="mb-2 btn-facebook btn-secondary" onClick={toggleEdit}>
                                                        {`${t("Edit")} `}
                                                        <i className="fa fa-pencil ml-1" />
                                                    </Button>
                                                )
                                                )
                                            }

                                        </Row>
                                    </StickyFooter>
                                </Form>
                            )}
                        </Formik>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DocumentPrefixDetails;
