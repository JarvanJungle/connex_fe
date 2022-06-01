import React, {
    useState, useEffect, useRef, useCallback
} from "react";
import { useSelector } from "react-redux";
import { AvForm, AvField } from "availity-reactstrap-validation";

import {
    Container,
    Row,
    Nav,
    NavItem,
    NavLink,
    UncontrolledModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FloatGrid as Grid,
    Button,
    CustomInput,
    Card,
    CardBody,
    CardHeader,
    Media,
    Col,
    FormGroup,
    Input
} from "components";
import { HeaderMain } from "routes/components";
import { useTranslation } from "react-i18next";
import StickyFooter from "components/StickyFooter";
import CompanyService from "services/CompaniesService";
import UserDataService from "services/UserService";
import { useToast } from "routes/hooks";
import URL_CONFIG from "services/urlConfig";
import { useHistory } from "react-router";
import CompanyLogo from "./components/CompanyLogo";
import classes from "./CompanyDetails.scss";

const CompanyDetailsCurrent = () => {
    const permissionReducer = useSelector((state) => state?.permissionReducer);
    const { currentCompany, userPermission } = permissionReducer;
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const [details, setDetails] = useState();
    const [showSave, setShowSave] = useState(false);

    const [state, setState] = useState({
        company: "",
        companyRegistrationNumber: "",
        country: "",
        entityType: "",
        industryType: "",
        gstApplicable: "",
        gstNo: "",
        logoUrl: "",
        isEdit: "",
        userDetails: null
    });
    const changeUrl = (url) => {
        setState((prevState) => ({ ...prevState, logoUrl: url }));
    };

    const retrieveCompanyDetails = async (uuid) => {
        try {
            const response = await CompanyService.getCompany(uuid);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                setDetails(responseData);
                setState((prevState) => ({
                    ...prevState,
                    uuid: responseData.uuid,
                    companyName: responseData.entityName,
                    companyRegistrationNumber: responseData.companyRegistrationNumber,
                    country: responseData.country,
                    entityType: responseData.entityType,
                    industryType: responseData.industryType,
                    gstApplicable: responseData.gstApplicable,
                    gstNo: responseData.gstNo,
                    documentList: responseData.documentsMetaDataList,
                    isCompanyActive: responseData.active,
                    buyer: responseData.buyer,
                    supplier: responseData.supplier,
                    remarks: responseData.remarks,
                    logoUrl: responseData.logoUrl
                }));
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.log("message", error.message);
            const errorMessage = error.message || "Error loading entity";
            showToast("error", errorMessage);
            history.push(URL_CONFIG.LIST_COMPANIES);
        }
    };

    useEffect(() => {
        console.log(currentCompany);
        if (currentCompany?.companyUuid) {
            retrieveCompanyDetails(currentCompany.companyUuid);
            if (currentCompany.role.find((item) => item === "ENTITY_ADMIN")) {
                setShowSave(true);
            } else {
                setShowSave(false);
            }
        }
    }, [currentCompany]);

    const onBackButtonPressHandler = () => {
        history.goBack();
    };

    const getUsers = () => {
        UserDataService.getOwnUserDetails().then((response) => {
            if (response.data.status === "OK") {
                setState((prevState) => ({
                    ...prevState,
                    userDetails: response.data.data
                }));
            } else {
                return null;
            }
        }).catch((error) => {
            console.log("error", error);
        });
    };

    const onSavePressHandler = async () => {
        const updateRequest = {
            ...details,
            logoUrl: state.logoUrl
        };
        console.log({ updateRequest });
        const response = await CompanyService.updateCompany(updateRequest);
        const responseData = response.data.data;
        if (response.data.status === "OK") {
            getUsers();
            showToast("success", responseData);
        } else {
            throw new Error(response.data.message);
        }
    };

    return (
        <AvForm>
            <Container fluid className={classes["custom-container"]}>
                <HeaderMain
                    title={t("Organization Profile")}
                    className="mb-3"
                />
                <Card>
                    <CardHeader tag="h6">
                        {t("CompanyInformation")}
                    </CardHeader>
                    <CardBody>
                        <Row className={`${classes.rowClass}`}>
                            <Col>
                                <Row>
                                    <Col md={12} className="label-required">
                                        {" "}
                                        {t("CompanyNameDetails")}
                                        {" "}
                                    </Col>
                                    <Col md={12}>
                                        <span inline="true" className={`${classes.inputText2}`}>
                                            {" "}
                                            {state?.companyName}
                                            {" "}
                                        </span>
                                    </Col>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <Col md={12} className="label-required">
                                        {" "}
                                        {t("CompanyRegistrationNumberDetails")}
                                        {" "}
                                    </Col>
                                    <Col md={12}>
                                        <span inline="true" className={`${classes.inputText2}`} style={{ textTransform: "uppercase" }}>
                                            {" "}
                                            {state?.companyRegistrationNumber}
                                            {" "}
                                        </span>
                                    </Col>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <Col md={12} className="label-required">
                                        {" "}
                                        {t("OriginCountryDetails")}
                                        {" "}
                                    </Col>
                                    <Col md={12}>
                                        <span inline="true" className={`${classes.inputText2}`}>
                                            {" "}
                                            {state?.country}
                                            {" "}
                                        </span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className={`${classes.rowClass2}`}>
                            <Col>
                                <Row>
                                    <Col md={12} className="label-required">
                                        {" "}
                                        {t("EntityTypeDetails")}
                                        {" "}
                                    </Col>
                                    <Col md={12}>
                                        <span inline="true" className={`${classes.inputText2}`}>
                                            {" "}
                                            {state?.entityType}
                                            {" "}
                                        </span>
                                    </Col>
                                </Row>
                            </Col>

                            <Col>
                                <Row>
                                    <Col md={12} className="label-required">
                                        {" "}
                                        {t("IndustryTypeDetails")}
                                        {" "}
                                    </Col>
                                    <Col md={12}>
                                        <span inline="true" className={`${classes.inputText2}`}>
                                            {" "}
                                            {state?.industryType}
                                            {" "}
                                        </span>
                                    </Col>
                                </Row>
                            </Col>

                            <Col>
                                <Row>
                                    <Col md={12} className="label-required">
                                        {" "}
                                        {t("GSTApplicableDetails")}
                                        {" "}
                                    </Col>
                                    <Col md={12}>
                                        <CustomInput
                                            inline
                                            value={state?.gstApplicable}
                                            type="radio"
                                            id="yesGST"
                                            name="gstApplicable"
                                            checked={state?.gstApplicable}
                                            disabled
                                            className={classes["custom-control"]}
                                            label="Yes"
                                        />
                                        <CustomInput
                                            inline
                                            value={!state?.gstApplicable}
                                            type="radio"
                                            className={classes["custom-control"]}
                                            id="noGST"
                                            name="gstApplicable"
                                            checked={!state?.gstApplicable}
                                            disabled
                                            label="No"
                                            defaultChecked
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        {state?.gstApplicable === true
                            && (
                                <Row className={`${classes.rowClass3}`}>
                                    <Col>
                                        <Row>
                                            <Col md={12} className="label-required">
                                                {" "}
                                                {t("GstRegistrationNumberDetails")}
                                                {" "}
                                            </Col>
                                            <Col md={12}>
                                                <span inline="true" className={`${classes.inputText2}`}>
                                                    {" "}
                                                    {state?.gstNo}
                                                    {" "}
                                                </span>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row />
                                    </Col>
                                    <Col>
                                        <Row />
                                    </Col>
                                </Row>
                            )}
                    </CardBody>
                </Card>
                <br />
                <Card>
                    <CardHeader tag="h6">
                        {t("Company Logo")}
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col lg>
                                <CompanyLogo
                                    sendUrl={(url) => changeUrl(url)}
                                    logoUrl={state.logoUrl}
                                    isEdit={showSave}
                                    userDetails={state.userDetails}
                                />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
            <StickyFooter>
                <Row className="justify-content-between mx-0 px-3">
                    <Col className="d-flex justify-content-start">
                        <Button
                            type="button"
                            color="secondary"
                            className="mb-2 mr-2 px-3"
                            onClick={onBackButtonPressHandler}
                        >
                            {t("Back")}
                        </Button>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        {showSave && (
                            <Button
                                color="primary"
                                className="mb-2 mr-2 px-3"
                                type="button"
                                onClick={onSavePressHandler}
                            >
                                {t("Save")}
                            </Button>
                        )}
                    </Col>
                </Row>
            </StickyFooter>
        </AvForm>
    );
};

export default CompanyDetailsCurrent;
