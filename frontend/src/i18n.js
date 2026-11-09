import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en.json";
import translationKN from "./locales/kn.json";
import translationHI from "./locales/hi.json";
import translationTA from "./locales/ta.json";
import translationTE from "./locales/te.json";
import translationML from "./locales/ml.json";
import translationBN from "./locales/bn.json";
import translationGU from "./locales/gu.json";
import translationMR from "./locales/mr.json";
import translationPA from "./locales/pa.json";
import translationOR from "./locales/or.json";
import translationUR from "./locales/ur.json";

const resources = {
  en: { translation: translationEN },
  kn: { translation: translationKN },
  hi: { translation: translationHI },
  ta: { translation: translationTA },
  te: { translation: translationTE },
  ml: { translation: translationML },
  bn: { translation: translationBN },
  gu: { translation: translationGU },
  mr: { translation: translationMR },
  pa: { translation: translationPA },
  or: { translation: translationOR },
  ur: { translation: translationUR },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  interpolation: { escapeValue: false },
});

export default i18n;
