/* eslint-disable global-require */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import UserDataService from "services/UserService";
import { ToastContainer, toast } from "react-toastify";
import {
    FormGroup,
    Media,
    Button,
    EmptyLayout,
    Divider
} from "components";
import { AvForm, AvField } from "availity-reactstrap-validation";
import ButtonSpinner from "components/ButtonSpinner";
import { HeaderMain } from "routes/components/HeaderMain";
import { FooterLogin } from "./component/FooterLogin";
import classes from "./Login.scss";

let message = "Opp! Something went wrong.";
const contentError = ({ closeToast }) => (
    <Media>
        <Media middle left className="mr-3">
            <i className="fa fa-fw fa-2x fa-close" />
        </Media>
        <Media body>
            <Media heading tag="h6">
                Error!
            </Media>
            <p>
                {message}
            </p>
            <div className="d-flex mt-2">
                <Button color="danger" onClick={() => closeToast}>
                    OK
                </Button>
            </div>
        </Media>
    </Media>
);

// eslint-disable-next-line react/prop-types
const contentInfo = ({ closeToast }) => (
    <Media>
        <Media middle left className="mr-3">
            <i className="fa fa-fw fa-2x fa-check" />
        </Media>
        <Media body>
            <Media heading tag="h6">
                Success!
            </Media>
            <p>
                You successfully login to the system.
            </p>
            <div className="d-flex mt-2">
                <Button color="success" onClick={() => closeToast}>
                    I Understand
                </Button>
                <Button color="link" onClick={() => closeToast} className="ml-2 text-success">
                    Cancel
                </Button>
            </div>
        </Media>
    </Media>
);

const Login = (props) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const showToast = (type) => {
        switch (type) {
        case "success":
            toast.success(contentInfo);
            break;
        case "error":
            toast.info(contentError);
            break;
        }
    };

    const handleSSOLogin = () => {
        UserDataService.ssoLogin();
    };

    useEffect(() => {
        handleSSOLogin();
    });

    const handleLogin = () => {
        if (email && password) {
            setIsLoading(true);
            UserDataService.authentication({ email, password }).then((response) => {
                setIsLoading(false);
                const responseData = response.data;
                if (responseData.status === "OK") {
                    const data = responseData?.data || {};
                    localStorage.setItem("mustSetPassword", data.mustSetPassword);
                    localStorage.setItem("user", JSON.stringify(data));
                    localStorage.setItem("token", `${data.tokenType} ${data.accessToken}`);
                    const { companies } = data;
                    if (companies && companies.length > 0) {
                        let company = companies.find((element) => element.main);
                        // set the default company with role information
                        if (!company) {
                            company = companies[0];
                        }
                        localStorage.setItem("companyRole", JSON.stringify(company));
                    }
                    setEmail("");
                    setPassword("");
                    message = "You have successful login to Doxa";
                    showToast("success");
                    if (data.mustSetPassword) {
                        history.push("/setup-password");
                    } else if (data.is2FA) {
                        history.push("/twofa/login");
                    } else {
                        history.push("/dashboard");
                    }
                } else {
                    // message = response.data.message
                    showToast("error");
                }
            }).catch((error) => {
                setIsLoading(false);
                message = error.response.data.message;
                showToast("error");
            });
        }
    };

    return (
        <EmptyLayout>
            <EmptyLayout.Section>
                <div className={`${classes.login_container}`}>
                    <Divider className={`${classes.image_content}`}>
                        <div className={`${classes.login_image}`} />
                        <div className={`${classes.logo_doxa}`} />
                    </Divider>
                    <Divider className={`${classes.login_content}`}>
                        <HeaderMain
                            title="Welcome"
                            className={`${classes.title} mx-0 px-0`}
                        />
                        <div className={`${classes.sub_title}`}>
                            Make it easy!
                        </div>
                        <AvForm
                            onValidSubmit={handleLogin}
                        >
                            <FormGroup>
                                <AvField
                                    type="text"
                                    name="email"
                                    label="Email"
                                    placeholder="Enter email..."
                                    validate={{
                                        required: { value: true, errorMessage: "Email is required." },
                                        pattern: { value: "^[a-zA-Z0-9_]+((\\.[a-zA-Z0-9_]+)+)?@[a-z][a-zA-Z-0-9]*\\.[a-z]+(\\.[a-z]+)*?$", errorMessage: "Email is invalid." }
                                    }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <AvField
                                    type="password"
                                    name="password"
                                    label="Password"
                                    placeholder="Password..."
                                    validate={{
                                        required: { value: true, errorMessage: "Password is required." }
                                    }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Link to="/pages/forgotpassword" className={`${classes.forgot_password}`}>
                                    Forgot Password?
                                </Link>
                                <ButtonSpinner text="Login" isLoading={isLoading} type="submit" />
                            </FormGroup>
                        </AvForm>
                        <div className={`${classes.register}`}>
                            <div>Not a user yet?</div>
                            <Link to="/pages/register" className={`${classes.register_now}`}>
                                Register Now!
                            </Link>
                        </div>
                        <FooterLogin />
                    </Divider>
                </div>
            </EmptyLayout.Section>
            <ToastContainer
                position="top-right"
                autoClose={50000}
                draggable={false}
                hideProgressBar
            />
        </EmptyLayout>
    );
};

export default Login;
