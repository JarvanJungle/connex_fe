import React, {
    useState, useRef
} from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import UserDataService from "services/UserService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import uuid from "uuid/v4";

import { HeaderMain } from "routes/components/HeaderMain";
import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    Media,
    FormGroup,
    Label,
    Button,
    Col
} from "components";
import { IconButton } from "@material-ui/core";
import EntitiesService from "services/EntitiesService";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "actions/authActions";
import ReactAvatarEditor from "react-avatar-editor";

const avatarExample = "/static/nobody.jpeg";
const styles = {
    avatar: {
        width: "100px",
        height: "100px",
        objectFit: "cover",
        borderRadius: "50%",
        border: "1px solid #e2e4e6"
    }
};

export const classes = (theme) => ({
    cropContainer: {
        position: "relative",
        width: "100%",
        height: 200,
        background: "#333",
        [theme.breakpoints.up("sm")]: {
            height: 400
        }
    },
    cropButton: {
        flexShrink: 0,
        marginLeft: 16
    },
    controls: {
        padding: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        [theme.breakpoints.up("sm")]: {
            flexDirection: "row",
            alignItems: "center"
        }
    },
    sliderContainer: {
        display: "flex",
        flex: "1",
        alignItems: "center"
    },
    sliderLabel: {
        [theme.breakpoints.down("xs")]: {
            minWidth: 65
        }
    },
    slider: {
        padding: "22px 0px",
        marginLeft: 32,
        [theme.breakpoints.up("sm")]: {
            flexDirection: "row",
            alignItems: "center",
            margin: "0 16px"
        }
    }
});

const Settings = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const dispatch = useDispatch();

    let message = "Opp! Something went wrong.";
    const [user] = useState(useSelector((state) => state.authReducer.userDetails));
    const [width] = useState(4);
    const fileInput = useRef(null);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const [avatarImg, setAvatarImg] = useState(useSelector((state) => state.authReducer.userDetails.avatarUrl));
    const [state, setState] = useState({
        image: "",
        allowZoomOut: true,
        position: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 0,
        borderRadius: 0,
        preview: null,
        width: 200,
        height: 200
    });
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
                    <Button color="danger" onClick={() => { closeToast(); }}>
                        OK
                    </Button>
                </div>
            </Media>
        </Media>
    );
    // eslint-disable-next-line react/prop-types
    const contentInfo = () => (
        <Media>
            <Media middle left className="mr-3">
                <i className="fa fa-fw fa-2x fa-check" />
            </Media>
            <Media body>
                <Media heading tag="h6">
                    Success!
                </Media>
                <p>
                    {message}
                </p>
                <div className="d-flex mt-2">
                    <Button color="success" onClick={() => { history.push("/dashboard"); }}>
                        I Understand
                    </Button>
                    <Button color="link" onClick={() => { history.push("/dashboard"); }} className="ml-2 text-success">
                        Cancel
                    </Button>
                </div>
            </Media>
        </Media>
    );
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
    const handleDrop = (e) => {
        const acceptedFiles = e.target.files;
        if (acceptedFiles && acceptedFiles.length > 0) {
            const { type, size } = acceptedFiles[0];
            if (size < 10000000 && (type === "image/png" || type === "image/jpg" || type === "image/jpeg")) {
                const reader = new FileReader();
                reader.addEventListener("load", () => setState((prevState) => ({ ...prevState, image: reader.result })));
                reader.readAsDataURL(acceptedFiles[0]);
                setShow(true);
            } else {
                message = "Please upload valid image format!";
                showToast("error");
            }
        } else {
            message = "Please upload valid image format!";
            showToast("error");
        }
    };
    const handleScale = (e) => {
        const scale = parseFloat(e.target.value);
        setState((prevState) => ({ ...prevState, scale }));
    };
    const handlePositionChange = (position) => {
        setState((prevState) => ({ ...prevState, position }));
    };
    const [editor, setEditor] = useState();
    const setEditorRef = (editorImg) => {
        setEditor(editorImg);
    };
    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(","); const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        // eslint-disable-next-line no-plusplus
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };
    const handleSave = async () => {
        const canvasScaled = editor.getImageScaledToCanvas().toDataURL();
        const fileData = dataURLtoFile(canvasScaled, "imageName.jpg");
        const data = new FormData();
        data.append("file", fileData);
        data.append("category", "public/images");
        data.append("uploaderRole", "user");
        data.append("publicRead", true);
        const response = await EntitiesService.uploadImage(data);
        const responseData = response.data.data;
        if (response.data.status === "OK") {
            const resUpdate = await UserDataService.updateUserAvatar({ avatarUrl: responseData.fileUrl });
            if (resUpdate.data.status === "OK") {
                dispatch(updateUserProfile());
                handleClose();
                setAvatarImg(responseData.fileUrl);
                setState((prevState) => ({
                    ...prevState,
                    image: "",
                    position: { x: 0.5, y: 0.5 },
                    scale: 1,
                    rotate: 0
                }));
            } else {
                message = resUpdate.data.message;
                showToast("error");
            }
        } else {
            message = response.data.message;
            showToast("error");
        }
    };
    const handleBack = () => {
        handleClose();
        setState((prevState) => ({
            ...prevState,
            image: "",
            position: { x: 0.5, y: 0.5 },
            scale: 1,
            rotate: 0
        }));
    };
    const onDeleteImage = async () => {
        const resUpdate = await UserDataService.updateUserAvatar({ avatarUrl: "" });
        if (resUpdate.data.status === "OK") {
            dispatch(updateUserProfile());
            setAvatarImg(null);
        } else {
            message = resUpdate.data.message;
            showToast("error");
        }
    };
    return (
        <>
            <Container>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("Settings")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col lg={12}>
                        <Card>
                            <CardHeader tag="h6">
                                {t("User Profile")}
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col lg={4}>
                                                <div>
                                                    <img
                                                        style={styles.avatar}
                                                        src={
                                                            avatarImg || avatarExample
                                                        }
                                                        alt=""
                                                    />
                                                </div>
                                            </Col>
                                            <Col lg={8} className="d-flex align-items-center">
                                                <div>
                                                    <Button color="primary" onClick={() => fileInput.current.click()}>Change Profile Photo</Button>
                                                    {(avatarImg) && (
                                                        <div className="d-flex align-items-center mt-2 ">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onDeleteImage()}
                                                                style={{ color: "red" }}
                                                            >
                                                                <i className="fa fa-trash" />
                                                            </IconButton>
                                                            <div>Remove Photo</div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <input key={uuid()} className="d-none" ref={fileInput} type="file" accept="image/*" onChange={handleDrop} />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Modal show={show} onHide={handleClose}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Crop Avatar</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <div>
                                                    <div className="d-flex justify-content-center mt-3">
                                                        <ReactAvatarEditor
                                                            ref={setEditorRef}
                                                            scale={parseFloat(state.scale)}
                                                            width={state.width}
                                                            height={state.height}
                                                            position={state.position}
                                                            onPositionChange={handlePositionChange}
                                                            rotate={parseFloat(state.rotate)}
                                                            borderRadius={100}
                                                            image={state.image}
                                                            className="editor-canvas"
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-center mt-3">
                                                        <input
                                                            style={{ width: "200px" }}
                                                            name="scale"
                                                            type="range"
                                                            onChange={handleScale}
                                                            min="0.2"
                                                            max="2"
                                                            step="0.01"
                                                            defaultValue={parseFloat(state.scale)}
                                                        />
                                                    </div>
                                                </div>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={handleBack} color="secondary">
                                                    {t("Cancel")}
                                                </Button>
                                                <Button variant="primary" onClick={handleSave} color="primary">
                                                    {t("Activate")}
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </Col>
                                </Row>
                                <Row className="mt-5">
                                    <Col lg={width}>
                                        <FormGroup>
                                            <Label for="userName">
                                                {t("User Name")}
                                            </Label>
                                            <h5 name="userName">{user.name}</h5>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={width}>
                                        <FormGroup>
                                            <Label for="email">
                                                {t("Info Email")}
                                            </Label>
                                            <h5 name="email">{user.email}</h5>
                                        </FormGroup>
                                    </Col>
                                    {user.entity
                                        && (
                                            <Col lg={width}>
                                                <FormGroup>
                                                    <Label for="companyName">
                                                        {t("Company Name")}
                                                    </Label>
                                                    <h5 name="companyName">{user.entity.entityName}</h5>
                                                </FormGroup>
                                            </Col>
                                        )}
                                    <Col lg={width}>
                                        <FormGroup>
                                            <Label for="workNumber">
                                                {t("Work Phone")}
                                            </Label>
                                            <h5 name="workNumber">{`+${user.countryCode} ${user.workNumber}`}</h5>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={width}>
                                        <FormGroup>
                                            <Label for="designation">
                                                {t("Designation")}
                                            </Label>
                                            <h5 name="designation">{user.designation}</h5>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader tag="h6">
                                {t("Security and Login")}
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col lg={10}>
                                        <FormGroup>
                                            <Label for="changePassword">
                                                {t("Change Password")}
                                            </Label>
                                            <p name="changePassword">{t("It's a good idea to use a strong password that you're not using elsewhere")}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={2}>
                                        <Link to="/me/settings/password/reset/own">
                                            <button type="button" className="btn btn-primary float-right my-3">{t("Edit")}</button>
                                        </Link>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={10}>
                                        <FormGroup>
                                            <Label for="twoFactor">
                                                {t("Two Factor Authentication")}
                                            </Label>
                                            <p name="twoFactor">{t("Use an app like Google Authenticator or Duo Mobile to generate verification codes for more protection")}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={2}>
                                        <Link to="/twofa">
                                            <button type="button" className="btn btn-primary float-right my-3">{t("Edit")}</button>
                                        </Link>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Settings;
