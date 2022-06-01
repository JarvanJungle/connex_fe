import React from "react";
import { toast } from "react-toastify";
import { Media, Button } from "components";

const useToast = () => {
    let message = "Opp! Something went wrong.";

    const contentError = ({ closeToast }) => (
        <Media>
            <Media middle left className="mr-3">
                <i className="fa fa-fw fa-close" />
            </Media>
            <Media body>
                <Media heading tag="h6">
                    Error!
                </Media>
                {typeof message === "string" && <p>{message}</p>}
                {Array.isArray(message) && (
                    <p>
                        {message.map((item) => (
                            <div>
                                {item}
                                {" "}
                                <br />
                            </div>
                        ))}
                    </p>
                )}
                <div className="d-flex mt-2">
                    <Button color="danger" onClick={() => closeToast}>
                        OK
                    </Button>
                </div>
            </Media>
        </Media>
    );

    const contentSuccess = ({ closeToast }) => (
        <Media>
            <Media middle left className="mr-3">
                <i className="fa fa-fw fa-check" />
            </Media>
            <Media body>
                <Media heading tag="h6">
                    Success!
                </Media>
                {typeof message === "string" && <p>{message}</p>}
                {Array.isArray(message) && (
                    <p>
                        {message.map((item) => (
                            <div>
                                {item}
                                {" "}
                                <br />
                            </div>
                        ))}
                    </p>
                )}
                <div className="d-flex mt-2">
                    <Button color="success" onClick={() => closeToast}>
                        I Understand
                    </Button>
                    <Button color="link" className="ml-2 text-success" onClick={() => closeToast}>
                        Cancel
                    </Button>
                </div>
            </Media>
        </Media>
    );

    const showToast = (type, text) => {
        message = text;
        switch (type) {
        case "success":
            toast.success(contentSuccess);
            break;
        case "error":
            toast.error(contentError);
            break;
        }
    };

    return showToast;
};

export default useToast;
