import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
    Container,
    Row,
    Button,
    Col,
    ButtonToolbar
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { contentInfo, contentError } from "helper/utilities";
import ConnectionService from "services/ConnectionService";
import { CommonConfirmDialog } from "routes/components";
import SupplierService from "services/SupplierService";
import StickyFooter from "components/StickyFooter";
import _ from "lodash";
import { useCurrentCompany, usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import CompanyProfileCard from "./CompanyProfileCard";
import CompanyAddressCard from "./CompanyAddressCard";
import AcceptDialog from "./AcceptDialog/AcceptDialog";
import ContactInformationCard from "./ContactInformationCard";

const ConnectionDetails = () => {
    let message = "Opp! Something went wrong.";
    const showToast = (type, messageContent) => {
        switch (type) {
        case "success":
            toast.success(contentInfo({ message: messageContent || message }));
            break;
        case "error":
            toast.error(contentError({ message: messageContent || message }));
            break;
        }
    };

    const currentCompany = useCurrentCompany();
    const connectionPermission = usePermission(FEATURE.CONNECTION);
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const [detailsStates, setDetailsStates] = useState({
        rejectShow: false,
        acceptShow: false,
        cancelShow: false,
        isLoading: false,
        companyUuid: "",
        companyDetails: {
            uuid: "",
            entityName: "",
            gstNo: "",
            companyRegistrationNumber: "",
            entityType: "",
            isGstApplicable: true,
            country: "",
            addressDtoList: [
                {
                    addressspan: "",
                    addressFirstLine: "",
                    addressSecondLine: "",
                    city: "",
                    state: "",
                    country: "",
                    postalCode: "",
                    uuid: "",
                    default: true,
                    active: true
                }
            ],
            connectionUuid: "",
            gstApplicable: true,
            contactInformation: {
                name: "",
                email: "",
                workNumber: ""
            }
        },
        address: {
            addressspan: "",
            addressFirstLine: "",
            addressSecondLine: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            uuid: "",
            default: true,
            active: true
        },
        connection: {
            createdOn: "",
            updatedOn: "",
            reason: "",
            status: "",
            requestedTo: {
                createdOn: "",
                updatedOn: "",
                companyCode: "",
                companyName: "",
                contactPersonEmail: "",
                contactPersonName: "",
                contactPersonWorkNumber: "",
                paymentTerm: "",
                systemStatus: true,
                uen: "",
                gstRegBusiness: "",
                gstRegNo: "",
                uuid: "",
                addressesDto: [
                    {
                        addressLabel: "",
                        addressFirstLine: "",
                        addressSecondLine: "",
                        city: "",
                        state: "",
                        country: "",
                        postalCode: "",
                        uuid: "",
                        default: false,
                        active: false
                    }
                ],
                companyUuid: "",
                connected: false,
                buyer: false,
                seller: false,
                deleted: false
            },
            uuid: "",
            deleted: false
        },
        suppliers: []
    });

    const [dialogProps, setDialogProps] = useState({
        dialogVisibility: false,
        onHide: () => {},
        title: "",
        content: "",
        positiveProps: {
            onPositiveAction: () => {},
            contentPositive: "abc",
            colorPositive: "warning"
        },
        negativeProps: {
            onNegativeAction: () => {}
        }
    });

    const getCompanyDetails = (uuid) => {
        ConnectionService.getConnectionRequestCompanyDetails(uuid).then((response) => {
            if (response.data.status === "OK") {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    companyDetails: response.data.data,
                    params: response.data.data
                }));
            } else {
                message = response.data.message;
                showToast("error");
            }
        }).catch((error) => {
            message = error.response?.data?.message;
            showToast("error");
        });
    };

    const getSupplier = async (companyUuid) => {
        try {
            const responseSupplier = await SupplierService
                .retrieveAllSuppliersUnderCompany(companyUuid);
            if (responseSupplier.data.status === "OK") {
                let suppliers = responseSupplier.data.data;
                suppliers = suppliers.filter((sup) => !sup.connected);
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    suppliers
                }));
            } else {
                throw new Error(responseSupplier.data.data);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const uuid = query.get("uuid");
        getCompanyDetails(uuid);

        if (!_.isEmpty(currentCompany)) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompany.companyUuid
            }));
        }
    }, [currentCompany]);

    const handleHideDialog = () => setDialogProps((prevStates) => ({
        ...prevStates,
        dialogVisibility: false
    }));

    const handleReject = () => {
        handleHideDialog();
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        ConnectionService
            .postRejectConnection(detailsStates.companyDetails.connectionUuid)
            .then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    showToast("success", response.data.message);
                    getCompanyDetails(detailsStates.companyDetails.connectionUuid);
                } else {
                    showToast("error", response.data.message);
                }
            }).catch((error) => {
                message = error.response?.data?.message;
                showToast("error", message);
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
    };

    const handleAccept = (event, values) => {
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: true,
            acceptShow: false
        }));
        ConnectionService
            .postAcceptConnection(
                detailsStates.suppliers[Number(values.supplier)],
                detailsStates.companyDetails.connectionUuid
            )
            .then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    showToast("success", response.data.message);
                    getCompanyDetails(detailsStates.companyDetails.connectionUuid);
                } else {
                    throw new Error(response.data.message);
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error", message);
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
    };

    const handleCancel = () => {
        handleHideDialog();
        setDetailsStates((prevStates) => ({
            ...prevStates,
            isLoading: true
        }));
        ConnectionService
            .postCancelConnection(detailsStates.companyDetails.connectionUuid)
            .then((response) => {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                if (response.data.status === "OK") {
                    showToast("success", "Cancel Connection Succesfully");
                    getCompanyDetails(detailsStates.companyDetails.connectionUuid);
                } else {
                    throw new Error(response.data.message);
                }
            }).catch((error) => {
                message = error.response.data.message;
                showToast("error", message);
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
            });
    };

    useEffect(() => {
        const addresses = detailsStates.companyDetails.addressDtoList
            .filter((address) => address.default && address.active);
        if (addresses.length === 0) {
            return;
        }
        setDetailsStates((prevStates) => ({
            ...prevStates,
            address: addresses[0],
            params: {
                ...prevStates.params,
                addressDtoList: undefined,
                ...addresses[0]
            }
        }));
    }, [detailsStates.companyDetails]);

    useEffect(() => {
        if (detailsStates.companyDetails.status === "IN REQUESTING" && detailsStates.companyUuid !== "") {
            getSupplier(detailsStates.companyUuid);
        }
    }, [detailsStates.companyDetails, detailsStates.companyUuid]);

    const onAcceptPress = (isShowing) => setDetailsStates((prevStates) => ({
        ...prevStates,
        acceptShow: isShowing
    }));

    const onRejectPress = () => setDialogProps((prevStates) => ({
        ...prevStates,
        dialogVisibility: true,
        content: `${t("Are you sure you want to reject")} ?`,
        title: `${t("Reject")}`,
        positiveProps: {
            colorPositive: "danger",
            onPositiveAction: handleReject,
            contentPositive: `${t("Confirm")}`
        },
        negativeProps: {
            onNegativeAction: handleHideDialog
        }
    }));

    const onCancelPress = () => setDialogProps((prevStates) => ({
        ...prevStates,
        dialogVisibility: true,
        content: `${t("Are you sure you want to cancel")} ?`,
        title: `${t("Cancel")}`,
        positiveProps: {
            colorPositive: "danger",
            onPositiveAction: handleCancel,
            contentPositive: `${t("Confirm")}`
        },
        negativeProps: {
            onNegativeAction: handleHideDialog
        }
    }));

    const renderFooterButtons = (status) => {
        switch (status) {
        case "IN REQUESTING":
            return (
                <div>
                    <Button color="danger" className="mb-2 mr-2" onClick={() => onRejectPress(true)}>
                        {t("Reject")}
                    </Button>
                    <Button color="primary" className="mb-2" onClick={() => onAcceptPress(true)}>
                        {t("Accept")}
                    </Button>
                </div>
            );
        case "APPROVAL":
            return (
                <>
                    <Button color="danger" className="mb-2" onClick={() => onCancelPress(true)}>
                        {t("Cancel Connection")}
                    </Button>
                </>
            );
        case "REJECTED":
            return null;
        case "ASSOCIATED":
            return (
                <>
                    <Button color="danger" className="mb-2" onClick={() => onCancelPress(true)}>
                        {t("Cancel Connection")}
                    </Button>
                </>
            );
        default:
            return null;
        }
    };

    return (
        <>
            <Container fluid>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            <HeaderMain
                                title={(t("ConnectionDetails"))}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col lg={12}>
                            <CompanyProfileCard
                                t={t}
                                detailsStates={detailsStates}
                            />
                            <ContactInformationCard
                                t={t}
                                detailsStates={detailsStates}
                            />
                            <CompanyAddressCard
                                t={t}
                                companyDetails={detailsStates.companyDetails}
                            />
                        </Col>
                    </Row>
                </Container>
                <StickyFooter>
                    <ButtonToolbar className="justify-content-between px-3">
                        <Button color="secondary" className="mb-2" onClick={() => history.goBack()}>
                            {t("Back")}
                        </Button>
                        {connectionPermission.write && renderFooterButtons(detailsStates.companyDetails.status)}
                    </ButtonToolbar>
                </StickyFooter>
            </Container>
            <CommonConfirmDialog
                isShow={dialogProps.dialogVisibility}
                onHide={dialogProps.negativeProps.onNegativeAction}
                title={dialogProps.title}
                content={dialogProps.content}
                positiveProps={
                    {
                        onPositiveAction: dialogProps.positiveProps.onPositiveAction,
                        contentPositive: dialogProps.positiveProps.contentPositive,
                        colorPositive: dialogProps.positiveProps.colorPositive
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: dialogProps.negativeProps.onNegativeAction
                    }
                }
            />
            <AcceptDialog
                t={t}
                detailsStates={detailsStates}
                handleHideDialog={() => onAcceptPress(false)}
                handleAccept={handleAccept}
                history={history}
            />
        </>
    );
};

export default ConnectionDetails;
