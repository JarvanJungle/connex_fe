import React, { useState, useEffect } from "react";
import { Prompt } from "react-router-dom";

const useUnsavedChangesWarning = (
    message = "Are you sure you want to leave this page as all your input will be lost?"
) => {
    const [isDirty, setDirty] = useState(false);

    useEffect(() => {
        window.onbeforeunload = isDirty && (() => {
            setDirty(false);
            return message;
        });

        return () => {
            window.onbeforeunload = null;
        };
    }, [isDirty]);

    const routerPrompt = <Prompt when={isDirty} message={message} />;

    return [routerPrompt, () => setDirty(true), () => setDirty(false)];
};

export default useUnsavedChangesWarning;
