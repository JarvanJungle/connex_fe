import React from "react";
import {
    Row,
    Button
} from "components";
const GroupButtonByStatus = (props) => {
    const {
        t,
        onConvertPressHandler,
        dirty,
    } = props;
    const handleRenderByStatus = () => {
        return (
            <>
                <Button
                    color="primary"
                    type="submit"
                    onClick={onConvertPressHandler}
                    disabled={!dirty}
                >
                    {t("Convert to Actual Claim")}
                </Button>
            </>
        );
    };
    return (
        <Row className="mx-0">
            {handleRenderByStatus()}
        </Row>
    );
};

export default GroupButtonByStatus;
