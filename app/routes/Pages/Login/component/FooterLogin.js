/* eslint-disable import/prefer-default-export */
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
    footer: {
        fontSize: "14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "absolute",
        bottom: "30px"
    },
    link: {
        padding: "0 0.2em",
        color: "#50BEE0"
    }
});

const FooterLogin = () => {
    const styles = useStyles();
    return (
        <>
            <div className={`${styles.footer}`}>
                <div>
                    v.1.06.01.07.00
                    |
                    <a
                        href="https://www.doxa-holdings.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.link}`}
                    >
                        Terms of Use
                    </a>
                    |
                    <a
                        href="https://www.doxa-holdings.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.link}`}
                    >
                        Privacy Policy
                    </a>
                    |
                    <a
                        href="https://www.doxa-holdings.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.link}`}
                    >
                        Contact Us
                    </a>
                </div>
                <div>Copyright ©2021 Doxa Holdings International Pte. Ltd.</div>
            </div>
        </>
    );
};

export { FooterLogin };
