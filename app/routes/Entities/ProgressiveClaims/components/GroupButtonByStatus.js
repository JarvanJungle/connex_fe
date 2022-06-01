import React from "react";
import {
    Row,
    Button
} from "components";
import useToast from "routes/hooks/useToast";
import { PAGE_STAGE } from "../CreateDraftProgressClaim/Helper";

const GroupButtonByStatus = (props) => {
    const {
        t,
        values,
        onSavePressHandler,
        detailDataState = {},
        pageState = ""
    } = props;

    const handleRenderByStatus = () => {
        if (pageState) {
            switch (pageState) {
            case PAGE_STAGE.DETAIL:
                return (
                    <>
                        <Button
                            color="primary"
                            className="mr-3"
                            type="submit"
                            onClick={
                                () => {
                                    onSavePressHandler(values, PAGE_STAGE.DETAIL);
                                }
                            }
                        >
                            {t("Create Draft Claims")}
                        </Button>
                    </>
                );
            case PAGE_STAGE.CREATE:
                return (
                    <>
                        <Button
                            color="secondary"
                            className="mr-3"
                            type="submit"
                            label={t("Save As Draft")}
                            onClick={() => {
                            }}
                        >
                            {t("Save as Draft")}
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            label={t("Create Claims")}
                            onClick={() => {
                                onSavePressHandler(values, PAGE_STAGE.CREATE_CLAIMS);
                            }}
                        >
                            {t("Create Claims")}
                        </Button>
                    </>
                );
            case PAGE_STAGE.EDIT:
                return (
                    <>
                        <Button
                            color="primary"
                            type="submit"
                            label={t("Issue")}
                        >
                            {t("Issue")}
                        </Button>
                    </>
                );
            default:
                break;
            }
        }
        return null;
    };
    return (
        <Row className="mx-0">
            {handleRenderByStatus()}
        </Row>
    );
};

export default GroupButtonByStatus;
