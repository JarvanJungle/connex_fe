import i18n from "i18next";
import { initReactI18next  } from "react-i18next";

import translationEN from './languages/en/translation.json';
import translationCN from './languages/cn/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  cn: {
    translation: translationCN
  }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en",

        keySeparator: ">",
        nsSeparator: "|", // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
