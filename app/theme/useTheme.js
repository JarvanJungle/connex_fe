import { useEffect, useState } from "react";
import _ from "lodash";
import { setToLS, getFromLS } from "../helper/utilities";

export const useTheme = () => {
    const themes = getFromLS("all-themes");
    const [themeData, setThemeData] = useState({
        theme: themes.data.light,
        themeLoaded: false
    });
    const setMode = (mode) => {
        setToLS("theme", mode);
        setThemeData((prevStates) => ({
            ...prevStates,
            theme: mode
        }));
    };

    const getFonts = () => {
        const allFonts = _.values(_.mapValues(themes.data, "font"));
        return allFonts;
    };

    useEffect(() => {
        const localTheme = getFromLS("theme");
        setThemeData((prevStates) => ({
            ...prevStates,
            themeLoaded: true,
            theme: localTheme || themes.data.light
        }));
    }, []);

    return {
        theme: themeData.theme, themeLoaded: themeData.themeLoaded, setMode, getFonts
    };
};
