import React from "react";

import {
    Button
} from "..";

const ButtonSpinner = (props) => {
    const {
        onclick: handleClick,
        disabled,
        className,
        text,
        isLoading,
        style,
        icon
    } = props;
    return (
        <>
            <Button color="primary" onClick={handleClick} style={style} disabled={isLoading || disabled} className={className}>
                <>
                    <i
                        className={isLoading ? "fa fa-refresh fa-spin" : icon}
                        style={{ marginRight: "5px" }}
                    />
                    <span>{isLoading ? "Loading" : text}</span>
                </>
            </Button>
        </>
    );
};

export default ButtonSpinner;
