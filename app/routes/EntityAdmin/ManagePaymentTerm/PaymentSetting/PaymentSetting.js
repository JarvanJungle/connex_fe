import React, { useEffect, useState } from "react";
import {
    Col,
    Container, CustomInput, FormGroup, Row
} from "components";
import { useTranslation } from "react-i18next";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PaymentSettingService from "services/PaymentSettingService";
import { useSelector } from "react-redux";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";
import useToast from "routes/hooks/useToast";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { HeaderMain } from "routes/components/HeaderMain";
import { usePermission } from "routes/hooks";

const PaymentSetting = () => {
    const { t } = useTranslation();
    const [detailState, setDetailState] = useState({
        paymentSetting: [],
        companyUuid: "",
        entity: ""
    });
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const showToast = useToast();
    const paymentSettingPermission = usePermission(FEATURE.PAYMENT_SETTING);

    const getPaymentSetting = async (currentCompanyUUID) => {
        try {
            const res = await PaymentSettingService.getPaymentSettingList(currentCompanyUUID);
            const resEntity = await PaymentSettingService
                .getPaymentSettingEntity(currentCompanyUUID);
            setDetailState((prevState) => ({
                ...prevState,
                paymentSetting: res.data.data,
                companyUuid: currentCompanyUUID,
                entity: resEntity.data.data
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeSelect = async (code) => {
        const dataBody = {
            code
        };
        try {
            const res = await PaymentSettingService
                .setDefaultSettingList(detailState.companyUuid, dataBody);
            const { message, status } = res.data;
            if (status === RESPONSE_STATUS.OK) {
                showToast("success", message);
                getPaymentSetting(detailState.companyUuid);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID)) {
            getPaymentSetting(currentCompanyUUID);
        }
    }, [permissionReducer]);

    return (
        <Container fluid>
            <Row className="mb-2">
                <Col
                    md={6}
                    lg={6}
                >
                    <HeaderMain
                        title={t("Payment Setting")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Accordion defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>{t("PaymentSetting")}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block" }}>
                    <Typography component="span" style={{ width: "100%" }}>
                        <FormGroup style={{ fontSize: "14px" }}>
                            <Typography style={{ fontSize: "14px" }} className="mb-2">{t("PaymentTakenReferenceFrom")}</Typography>
                            <div className="gstButtons">
                                {
                                    detailState.paymentSetting.map((item) => (
                                        <CustomInput
                                            className="mb-1 d-block"
                                            type="radio"
                                            key={item.code}
                                            id={item.code}
                                            name={item.code}
                                            value={item.code === detailState.entity.code}
                                            inline
                                            onChange={() => {
                                                onChangeSelect(item.code);
                                            }}
                                            label={item.description}
                                            checked={item.code === detailState.entity.code}
                                            disabled={!paymentSettingPermission.write}
                                        />
                                    ))
                                }
                            </div>
                        </FormGroup>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Container>
    );
};

export default PaymentSetting;
