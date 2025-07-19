import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector";

import enUS from 'antd/lib/locale/en_US.js';
import frFR from 'antd/lib/locale/fr_FR.js';

import translationEN from '../locales/en.json';
import translationFR from '../locales/fr.json';

const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
}

let options = {
  resources,
  fallbackLng: "en", // use et if detected lng is not available
  //saveMissing: true, // send not translated keys to endpoint
  //debug: true,
  react: {
      useSuspense: false
  },
  interpolation: {
    escapeValue: false
  },
  /*
  backend: {
    loadPath: `/locales/{{lng}}/translation.json`,
    allowMultiLoading: true
  },*/
}

i18n
.use(Backend)
.use(LanguageDetector)
.use(initReactI18next)
.init(options, () => {
  let szLang = "";
  if(i18n){
    szLang = i18n.language;
  }
  console.log('[I18n] Translations initialized: ' + szLang);
});

export function getAntdLocale()
{
  if(i18n.language.startsWith("fr")){
    return frFR;
  }
  return enUS;
}

export function getCurrentLocaleShort()
{
  return i18n.language.substring(0, 2);
}

export default i18n;
