import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// HTML 언어 속성 변경 함수
const updateHtmlLang = (lng) => {
    document.documentElement.setAttribute('lang', lng);
};

i18n
    // i18next-http-backend 연결 (필요한 경우 외부 API에서 번역 리소스를 로드할 수 있음)
    .use(Backend)
    // 브라우저 언어 감지
    .use(LanguageDetector)
    // React와 i18next 연결
    .use(initReactI18next)
    .init({
        fallbackLng: 'ko',
        debug: import.meta.env.MODE === 'development', // 개발 환경에서만 디버그 모드 활성화
        interpolation: {
            escapeValue: false,
        },
        supportedLngs: ['ko', 'en'],
        ns: ["translation", "response", "visit"],
        defaultNS: 'translation',
        detection: {
            order: ['localStorage', 'cookie', 'sessionStorage', 'navigator', 'querystring', 'htmlTag'],
            caches: ['localStorage', 'cookie', 'sessionStorage'],
        },
        backend: {
            loadPath: import.meta.env.MODE === 'development'
                ? '/visit/src/i18n/locales/{{lng}}/{{ns}}.json'
                : '/locales/{{lng}}/{{ns}}.json',
        },
    });

// 초기 언어 설정에 따라 HTML lang 속성 업데이트
updateHtmlLang(i18n.language);

// 언어 변경 이벤트 리스너 추가
i18n.on('languageChanged', (lng) => {
    updateHtmlLang(lng);
});

export default i18n; 