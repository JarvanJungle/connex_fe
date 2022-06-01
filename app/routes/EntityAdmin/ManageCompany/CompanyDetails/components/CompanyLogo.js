import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import EntitiesService from "services/EntitiesService";
import { useToast } from "routes/hooks";
import { Button } from "components";
import ReactAvatarEditor from "react-avatar-editor";
import { useDispatch, useSelector } from "react-redux";
import { gettingUserDetailsSuccess } from "actions/authActions";
import { getUserPermission } from "actions/permissionActions";

const CompanyLogo = (props) => {
    const {
        sendUrl, logoUrl, isEdit, userDetails
    } = props;
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [upImg, setUpImg] = useState();
    const showToast = useToast();
    const dispatch = useDispatch();

    const [state, setState] = useState({
        image: "",
        allowZoomOut: true,
        position: { x: 0.5, y: 0.5 },
        scale: 1,
        rotate: 0,
        borderRadius: 0,
        preview: null,
        width: 380,
        height: 200
    });

    const handleDrop = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const { type } = acceptedFiles[0];
            if (type === "image/png" || type === "image/jpg" || type === "image/jpeg") {
                const reader = new FileReader();
                reader.addEventListener("load", () => setState((prevState) => ({ ...prevState, image: reader.result })));
                reader.readAsDataURL(acceptedFiles[0]);
            } else {
                showToast("error", "Please upload valid image format!");
            }
        } else {
            showToast("error", "Please upload valid image format!");
        }
    };

    const toDataURL = (url) => fetch(url)
        .then((response) => response.blob())
        .then((blob) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));

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

    useEffect(() => {
        if (!isEdit) {
            setUpImg(null);
            setState((prevState) => ({
                ...prevState,
                image: "",
                position: { x: 0.5, y: 0.5 },
                scale: 1,
                rotate: 0
            }));
        }
    }, [isEdit]);

    useEffect(() => {
        if (userDetails) {
            dispatch(gettingUserDetailsSuccess(userDetails));
            const { companyUuid } = permissionReducer.currentCompany;
            const { companies, uuid } = userDetails;
            const currentCompanyObj = companies.find((x) => x.companyUuid === companyUuid);
            dispatch(getUserPermission(currentCompanyObj, uuid));
        }
    }, [userDetails]);

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
    const handleSave = async () => {
        const sourceCanvas = editor.getImageScaledToCanvas();
        const canvasScaled = sourceCanvas.toDataURL();
        const img = new window.Image();
        img.addEventListener("load", async () => {
            const ctx = sourceCanvas.getContext("2d");

            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
            ctx.drawImage(img, 0, 0);

            const fileData = dataURLtoFile(ctx.canvas.toDataURL(), "imageName.jpg");
            const data = new FormData();
            data.append("file", fileData);
            data.append("category", "public/images");
            data.append("uploaderRole", "user");
            data.append("publicRead", true);
            const response = await EntitiesService.uploadImage(data);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                setUpImg(responseData.fileUrl);
                setState((prevState) => ({
                    ...prevState,
                    image: "",
                    position: { x: 0.5, y: 0.5 },
                    scale: 1,
                    rotate: 0
                }));
                sendUrl(responseData.fileUrl);
            } else {
                showToast("error", response.data.message);
            }
        });
        img.setAttribute("src", canvasScaled);
    };

    const handleBack = () => {
        setState((prevState) => ({
            ...prevState,
            image: "",
            position: { x: 0.5, y: 0.5 },
            scale: 1,
            rotate: 0
        }));
    };

    return (
        <div className="App">
            {
                isEdit && (
                    <div>
                        <Dropzone
                            onDrop={handleDrop}
                            accept="image/*"
                            minSize={100}
                            maxSize={10000000}
                        >
                            {({
                                getRootProps,
                                getInputProps,
                                isDragActive,
                                isDragAccept,
                                isDragReject
                            }) => {
                                const additionalClass = isDragAccept
                                    ? "accept-drop-zone"
                                    : isDragReject
                                        ? "reject-drop-zone"
                                        : "";

                                return (
                                    <div
                                        {...getRootProps({
                                            className: `dropzone ${additionalClass}`
                                        })}
                                    >
                                        <input {...getInputProps()} />
                                        <p>
                                            <span>{isDragActive ? "📂" : "📁"}</span>
                                        </p>
                                        <h5>Click or drag file to this area to upload</h5>
                                        <p>
                                            Support for a single or bulk upload.
                                            Strictly prohibit from uploading company data or other band files
                                        </p>
                                    </div>
                                );
                            }}
                        </Dropzone>
                        <div style={{ color: "red", marginBottom: "10px" }}>
                            <div>*To be able to upload, jpg, jpeg, png. </div>
                            <div>*Max file size 10 MB </div>
                            <div>*For better resolution, please upload 1900 x 1000 size. Click here to crop your company logo</div>
                        </div>
                    </div>
                )
            }

            {
                state.image ? (
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
                                // borderRadius={100}
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
                        <div className="d-flex justify-content-center mt-3">
                            <Button className="ml-2" variant="secondary" onClick={handleBack} color="secondary">
                                Back
                            </Button>
                            <Button className="ml-2" variant="primary" onClick={handleSave} color="primary">
                                Crop
                            </Button>
                        </div>
                    </div>
                ) : ((upImg || logoUrl) && (
                    <div>
                        <img
                            className="avatar-drop"
                            src={
                                upImg || logoUrl
                            }
                            alt=""
                        />
                    </div>
                )
                )
            }

        </div>
    );
};
export default CompanyLogo;
