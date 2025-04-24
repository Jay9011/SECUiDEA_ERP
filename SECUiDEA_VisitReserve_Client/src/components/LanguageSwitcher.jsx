import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.scss';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    // 언어 변경 핸들러
    const changeLanguage = (e) => {
        const lng = e.target.value;
        i18n.changeLanguage(lng);
        setSelectedLanguage(lng);
    };

    // 현재 언어 상태 유지
    useEffect(() => {
        setSelectedLanguage(i18n.language);
    }, [i18n.language]);

    return (
        <div className="language-switcher">
            <select
                value={selectedLanguage}
                onChange={changeLanguage}
                className="language-select"
            >
                <option value="ko">한국어</option>
                <option value="en">English</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher; 