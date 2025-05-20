import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Users, Calendar, Clock, Shield, CheckCircle, Search, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

// 컴포넌트
import Accordion from '../../components/features/Accordion';
import Modal from '../../components/features/Modal';
import EmployeeSelector from '../../components/features/EmployeeSelector';
import InputWithButton from '../../components/features/InputWithButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

// 커스텀 훅
import useNetworkErrorAlert from '../../hooks/useNetworkErrorAlert';

// 스타일
import './PrivacyAgreementInput.scss';
import { getColorVariables } from '../../utils/cssVariables';

// API
import { verifyEmployee, submitReservation, getVisitReasons } from '../../services/visitReserveApis';
import { sendTemplateMessage } from '../../services/aligoService';

function PrivacyAgreementInput() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation('visit');
    const { showNetworkErrorAlert } = useNetworkErrorAlert();

    // 참조 추가
    const privacyCheckRef = useRef(null);
    const employeeCheckRef = useRef(null);

    // 현재 날짜와 시간 초기값 설정
    const getCurrentDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // 종료 시간 설정 (일단 23:59로 설정)
    const getEndTime = () => {
        return '23:59';
    };

    const initialDate = getCurrentDate();
    const initialTime = getCurrentTime();
    const initialEndDate = initialDate;
    const initialEndTime = getEndTime();

    const [privacyAgreed, setPrivacyAgreed] = useState('');
    const [accordionExpanded, setAccordionExpanded] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // 방문 대상 직원 정보
        employeePid: '',
        employeeName: '',

        // 방문자 정보
        visitorName: '',
        visitorCompany: '',
        visitorContact: '',
        visitorEmail: '',
        visitorCarNumber: '',
        visitReasonId: '',
        visitPurpose: '',
        visitDate: initialDate,
        visitTime: initialTime,
        visitEndDate: initialEndDate,
        visitEndTime: initialEndTime,
    });
    const [errors, setErrors] = useState({});
    const [isEmployeeVerified, setIsEmployeeVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [dateChanged, setDateChanged] = useState(false);
    const [timeChanged, setTimeChanged] = useState(false);
    const [endDateChanged, setEndDateChanged] = useState(false);
    const [visitReasons, setVisitReasons] = useState([]);
    const [loadingReasons, setLoadingReasons] = useState(false);

    // 모달 상태
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);

    // 페이지 로드 시 데이터 가져오기
    useEffect(() => {
        loadInitialData();
    }, [i18n.language]);    // 언어 변경 시 데이터 다시 로드

    // 페이지 이동 시 모달과 알림 정리
    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 실행
            Swal.close();
            toast.dismiss();
            setShowEmployeeModal(false);
            setLoading(false);
        };
    }, []);

    // 라우트 변경 감지하여 알림창 닫기
    useEffect(() => {
        Swal.close();
        toast.dismiss();
    }, [location]);

    // 페이지 초기 데이터 로드
    const loadInitialData = async () => {
        const success = await fetchVisitReasons();

        if (!success) {
            showNetworkErrorAlert(
                navigator.onLine
                    ? t('visitReserve.privacyAgreement.errorMessages.submitError')
                    : t('common.offlineError'),
                loadInitialData,
                t('common.networkError'),
                { showCancelButton: false, allowOutsideClick: false }
            );
        }
    };

    // 방문 목적 데이터 가져오기
    const fetchVisitReasons = async () => {
        try {
            setLoadingReasons(true);
            // 네트워크 연결 확인
            if (!navigator.onLine) {
                throw new Error(t('common.offlineError'));
            }

            const result = await getVisitReasons(i18n.language);
            if (result.isSuccess && result.data && result.data.reasons) {
                setVisitReasons(result.data.reasons);
                setFormData({
                    ...formData,
                    visitReasonId: result.data.reasons[0].visitReasonID
                });
                return true;
            } else {
                console.error('방문 목적 데이터를 가져오지 못했습니다.');
                return false;
            }
        } catch (error) {
            console.error('방문 목적 로드 오류:', error);
            return false;
        } finally {
            setLoadingReasons(false);
        }
    };

    // 스크롤 이동 함수
    const scrollToRef = (ref) => {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // 특정 필드로 스크롤 이동
    const scrollToField = (fieldId) => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
    };

    // 전화번호 포맷팅 함수
    const formatPhoneNumber = (value) => {
        if (!value) return '';

        // 현재는 숫자만 추출
        return value.replace(/[^\d]/g, '');
    };

    // 입력값 변경 처리
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // 직원 정보가 수정되면 인증 상태 초기화
        if (name === 'employeeName') {
            setIsEmployeeVerified(false);
            setVerificationError('');

            setFormData({
                ...formData,
                [name]: value,
                employeePid: '' // 이름 수정 시 PID 초기화
            });
        } else if (name === 'visitorContact') {
            const numbersOnly = value.replace(/[^\d-]/g, '');
            setFormData({
                ...formData,
                [name]: numbersOnly
            });
        } else if (name === 'visitDate') {
            // 날짜가 변경되었는지 체크
            if (value !== initialDate) {
                setDateChanged(true);
            } else {
                setDateChanged(false);
            }

            if (!endDateChanged) {
                setFormData({
                    ...formData,
                    [name]: value,
                    visitEndDate: value // 시작 날짜가 변경되면 종료 날짜도 같이 변경
                });
            } else {
                setFormData({
                    ...formData,
                    [name]: value
                });
            }
        } else if (name === 'visitEndDate') {
            // 종료 날짜 변경 체크
            if (value !== initialEndDate) {
                setEndDateChanged(true);
            } else {
                setEndDateChanged(false);
            }

            setFormData({
                ...formData,
                [name]: value
            });
        } else if (name === 'visitTime') {
            // 시간이 변경되었는지 체크
            if (value !== initialTime) {
                setTimeChanged(true);
            } else {
                setTimeChanged(false);
            }
            setFormData({
                ...formData,
                [name]: value
            });
        } else if (name === 'visitEndTime') {
            setFormData({
                ...formData,
                [name]: value
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // 입력 시 해당 필드 에러 제거
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // 전화번호 입력 필드 포커스 아웃 이벤트 처리
    const handlePhoneBlur = (e) => {
        const { value } = e.target;
        // 숫자만 추출 후 포맷팅
        const formattedPhone = formatPhoneNumber(value);
        setFormData({
            ...formData,
            visitorContact: formattedPhone
        });
    };

    // 개인정보 처리방침 동의 상태 변경 처리
    const handlePrivacyChange = (e) => {
        const value = e.target.value;
        setPrivacyAgreed(value);

        if (value === 'agree') {    // 동의 선택 시 아코디언 접기
            setAccordionExpanded(false);
        }
    };

    const handleAccordionToggle = (isExpanded) => {
        setAccordionExpanded(isExpanded);
    };

    // 직원 정보 확인 처리
    const handleVerifyEmployee = async () => {
        formData.employeeName = formData.employeeName.trim();

        // 필수 필드 유효성 검사
        if (!formData.employeeName.trim()) {
            setErrors({
                ...errors,
                employeeName: t('visitReserve.privacyAgreement.formErrors.requiredField')
            });
            return;
        }

        try {
            setIsVerifying(true);
            setVerificationError('');

            // 네트워크 연결 확인
            if (!navigator.onLine) {
                throw new Error(t('common.offlineError'));
            }

            // API 호출 - 직원 정보 확인
            const result = await verifyEmployee({
                name: formData.employeeName
            });

            if (result.isSuccess) {
                if (result.data && result.data.employees && result.data.employees.length > 1) {
                    setEmployeeList(result.data.employees);
                    setShowEmployeeModal(true);
                } else if (result.data && result.data.employees && result.data.employees.length === 1) {
                    const employee = result.data.employees[0];
                    setFormData({
                        ...formData,
                        employeeName: employee.name,
                        employeePid: employee.pid
                    });
                    setIsEmployeeVerified(true);
                } else {
                    setVerificationError(t('visitReserve.privacyAgreement.errorMessages.verificationError'));
                    toast.error(t('visitReserve.privacyAgreement.errorMessages.verificationError'));
                }
            } else {
                setVerificationError(t('visitReserve.privacyAgreement.errorMessages.verificationError'));
                toast.error(t('visitReserve.privacyAgreement.errorMessages.verificationError'));
            }
        } catch (error) {
            console.error('직원 확인 오류:', error);

            const errorMessage = error.message === t('common.offlineError')
                ? t('common.offlineError')
                : t('visitReserve.privacyAgreement.errorMessages.verificationError');

            setVerificationError(errorMessage);
            showNetworkErrorAlert(
                errorMessage,
                handleVerifyEmployee,
                t('common.networkError'),
                { showCancelButton: false, allowOutsideClick: false }
            );
        } finally {
            setIsVerifying(false);
        }
    };

    // 모달에서 직원 선택 처리 (둘 이상의 경우인 경우)
    const handleSelectEmployee = (employee) => {
        setFormData({
            ...formData,
            employeeName: employee.name,
            employeePid: employee.pid
        });
        setIsEmployeeVerified(true);
        setShowEmployeeModal(false);
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors = {};

        // 직원 확인 여부 검사
        if (!isEmployeeVerified || !formData.employeePid) {
            newErrors.employee = t('visitReserve.privacyAgreement.formErrors.employeeNotVerified');
        }

        // 필수 필드 검사
        const requiredFields = [
            'visitorName', 'visitorContact',
            'visitDate', 'visitTime', 'visitEndDate', 'visitEndTime'
        ];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = t('visitReserve.privacyAgreement.formErrors.requiredField');
            }
        });

        // 종료 날짜/시간이 시작 날짜/시간보다 이후인지 검사
        if (formData.visitDate && formData.visitEndDate && formData.visitTime && formData.visitEndTime) {
            const startDateTime = new Date(`${formData.visitDate}T${formData.visitTime}`);
            const endDateTime = new Date(`${formData.visitEndDate}T${formData.visitEndTime}`);

            if (endDateTime < startDateTime) {
                newErrors.visitEndDate = t('visitReserve.privacyAgreement.formErrors.endDateBeforeStartDate');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출 핸들러
    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (privacyAgreed !== 'agree') {
            toast.error(t('visitReserve.privacyAgreement.formErrors.privacyNotAgreed'));
            scrollToRef(privacyCheckRef);
            return;
        }

        if (!isEmployeeVerified || !formData.employeePid) {
            toast.error(t('visitReserve.privacyAgreement.formErrors.employeeNotVerified'));
            scrollToRef(employeeCheckRef);
            return;
        }

        if (!validateForm()) {
            const firstErrorField = Object.keys(errors)[0];
            scrollToField(firstErrorField);

            toast.error(t('visitReserve.privacyAgreement.formErrors.requiredField'));
            return;
        }

        handleSubmit();
    };

    // 폼 제출 처리
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 네트워크 연결 확인
            if (!navigator.onLine) {
                throw new Error(t('common.offlineError'));
            }

            // 색상 변수 가져오기
            const colors = getColorVariables();

            // 방문 신청 정보
            const employeeName = formData.employeeName;
            const visitorName = formData.visitorName;
            const visitorCompany = formData.visitorCompany;
            const visitorContact = formData.visitorContact;
            const visitDate = formData.visitDate;
            const visitTime = formData.visitTime;
            const visitEndDate = formData.visitEndDate;
            const visitEndTime = formData.visitEndTime;
            const visitReasonId = formData.visitReasonId;
            const visitPurpose = formData.visitPurpose;
            const visitorCarNumber = formData.visitorCarNumber;

            // 방문 신청 API 호출
            await submitReservation({
                employeePid: formData.employeePid,
                employeeName: employeeName,
                visitorName: visitorName,
                visitorCompany: visitorCompany,
                visitorContact: visitorContact,
                visitorEmail: formData.visitorEmail,
                visitReasonId: visitReasonId,
                visitPurpose: visitPurpose,
                visitDate: visitDate,
                visitTime: visitTime,
                visitEndDate: visitEndDate,
                visitEndTime: visitEndTime,
                visitorCarNumber: visitorCarNumber,
            }).then(response => {
                if (response.isSuccess && response.data?.ApiKey) {
                    // 카카오 알림톡 발송
                    sendTemplateMessage(response.data.ApiKey, 'VisitReserve', visitorContact, visitorName).then(() => response);

                    // 접견인에게 알림톡 발송
                    if (response.data.EmployeePhone && response.data.visitReserveVisitantId) {
                        const templateVariables = {
                            '방문자회사': visitorCompany,
                            '방문자이름': visitorName,
                            '방문일': visitDate,
                            '신청시간': new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };

                        const queryVariables = {
                            // '방문승인URL': `?uid=${response.data.visitReserveVisitantId}`
                            '방문승인URL': `/`
                        };

                        return sendTemplateMessage(response.data.ApiKey, 'RequestApprove', response.data.EmployeePhone, employeeName, templateVariables, queryVariables).then(() => response);
                    } else {
                        setLoading(false);

                        // Swal 다이얼로그를 표시하고 Promise 체인 내에서 직접 페이지 이동 처리
                        return Swal.fire({
                            title: t('common.kakaoMessageError'),
                            text: t('visitReserve.privacyAgreement.errorMessages.employeePhoneNotExists'),
                            icon: 'warning',
                            iconColor: colors.warning,
                            confirmButtonText: t('common.ok'),
                            confirmButtonColor: colors.primary,
                            focusConfirm: true
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const visitReason = visitReasons.find(reason => reason.visitReasonID == visitReasonId);

                                navigate('/visitReserve/ReserveResult', {
                                    state: {
                                        employeeName: employeeName,
                                        visitorName: visitorName,
                                        visitorCompany: visitorCompany,
                                        visitorContact: visitorContact,
                                        visitDate: visitDate,
                                        visitTime: visitTime,
                                        visitEndDate: visitEndDate,
                                        visitEndTime: visitEndTime,
                                        visitReason: visitReason.visitReasonName,
                                        visitPurpose: visitPurpose,
                                        visitorCarNumber: visitorCarNumber,
                                    }
                                });
                            }

                            return response;
                        });
                    }
                } else {
                    showNetworkErrorAlert(
                        response.message || t('visitReserve.privacyAgreement.errorMessages.submitError'),
                        handleSubmit,
                        t('common.networkError'),
                        { showCancelButton: true, allowOutsideClick: true }
                    );

                    return response;
                }
            }).then(response => {
                if (response.isSuccess) {
                    const visitReason = visitReasons.find(reason => reason.visitReasonID == visitReasonId);

                    // 성공 시 결과 페이지로 이동
                    navigate('/visitReserve/ReserveResult', {
                        state: {
                            employeeName: employeeName,
                            visitorName: visitorName,
                            visitorCompany: visitorCompany,
                            visitorContact: visitorContact,
                            visitDate: visitDate,
                            visitTime: visitTime,
                            visitEndDate: visitEndDate,
                            visitEndTime: visitEndTime,
                            visitReason: visitReason.visitReasonName,
                            visitPurpose: visitPurpose,
                            visitorCarNumber: visitorCarNumber,
                        }
                    });
                }
            });
        } catch (error) {
            console.error('방문 신청 오류:', error);

            const errorMessage = error.message === t('common.offlineError')
                ? t('common.offlineError')
                : t('visitReserve.privacyAgreement.errorMessages.submitError');

            showNetworkErrorAlert(
                errorMessage,
                handleSubmit,
                t('common.networkError'),
                { showCancelButton: false, allowOutsideClick: false }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="privacy-agreement-page">
            {/* ToastContainer 추가 */}
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="page-header">
                <h1>{t('visitReserve.privacyAgreement.title')}</h1>
                <p className="page-subtitle">{t('visitReserve.privacyAgreement.subtitle')}</p>
            </div>

            <div className="form-section">
                {/* 개인정보 처리방침 섹션 */}
                <div className="privacy-agreement-section">
                    <div className="section-header">
                        <h2><Shield size={20} /> {t('visitReserve.privacyAgreement.privacyPolicy.title')}</h2>
                        <p>{t('visitReserve.privacyAgreement.privacyPolicy.description')}</p>
                    </div>

                    <div className="privacy-card">
                        <Accordion
                            title={t('visitReserve.privacyAgreement.privacyPolicy.accordionTitle')}
                            className="privacy-accordion"
                            maxHeight={400}
                            expanded={accordionExpanded}
                            onToggle={handleAccordionToggle}
                        >
                            <div
                                className="privacy-policy-content"
                                dangerouslySetInnerHTML={{
                                    __html: t('visitReserve.privacyAgreement.privacyPolicy.fullContent')
                                }}
                            />
                        </Accordion>

                        <div className="privacy-radio-group" ref={privacyCheckRef}>
                            <div className="radio-options flex-end">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="privacy-agreement"
                                        value="agree"
                                        checked={privacyAgreed === 'agree'}
                                        onChange={handlePrivacyChange}
                                    />
                                    <span>{t('visitReserve.privacyAgreement.privacyPolicy.options.agree')}</span>
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="privacy-agreement"
                                        value="disagree"
                                        checked={privacyAgreed === 'disagree'}
                                        onChange={handlePrivacyChange}
                                    />
                                    <span>{t('visitReserve.privacyAgreement.privacyPolicy.options.disagree')}</span>
                                </label>
                            </div>
                            {privacyAgreed === 'disagree' && (
                                <div className="privacy-disagree-notice">
                                    {t('visitReserve.privacyAgreement.privacyPolicy.disagreeNotice')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 방문 정보 폼 */}
                <form onSubmit={handleFormSubmit} className="visit-form">
                    {/* 방문 대상 직원 정보 */}
                    <div className="form-group-section">
                        <h3><Users size={20} /> {t('visitReserve.privacyAgreement.employeeInfo.title')}</h3>

                        <div className="form-group" ref={employeeCheckRef}>
                            <label htmlFor="employeeName">{t('visitReserve.privacyAgreement.employeeInfo.employeeName')} <span className="required">*</span></label>
                            {isEmployeeVerified ? (
                                <InputWithButton
                                    inputProps={{
                                        type: "text",
                                        id: "employeeName",
                                        name: "employeeName",
                                        value: formData.employeeName,
                                        disabled: true,
                                        className: "verified-input",
                                    }}
                                    buttonProps={{
                                        className: "btn-outline btn-small",
                                        onClick: () => {
                                            setIsEmployeeVerified(false);
                                            setVerificationError('');
                                        },
                                    }}
                                    buttonContent={t('visitReserve.privacyAgreement.employeeInfo.reenter')}
                                    className="verified-employee"
                                />
                            ) : (
                                <InputWithButton
                                    inputProps={{
                                        type: "text",
                                        id: "employeeName",
                                        name: "employeeName",
                                        value: formData.employeeName,
                                        onChange: handleInputChange,
                                        placeholder: t('visitReserve.privacyAgreement.employeeInfo.placeholder'),
                                    }}
                                    buttonProps={{
                                        className: "btn-primary verify-btn",
                                        onClick: handleVerifyEmployee,
                                        disabled: isVerifying || !formData.employeeName.trim(),
                                    }}
                                    buttonContent={
                                        isVerifying ? (
                                            <span>{t('visitReserve.privacyAgreement.employeeInfo.verifying')}</span>
                                        ) : (
                                            <>
                                                <Search size={18} />
                                                <span>{t('visitReserve.privacyAgreement.employeeInfo.verifyButton')}</span>
                                            </>
                                        )
                                    }
                                    error={errors.employeeName}
                                />
                            )}
                        </div>

                        {/* 직원 확인 상태 표시 */}
                        {isEmployeeVerified && (
                            <div className="verification-status success">
                                <CheckCircle size={18} />
                                <span>{t('visitReserve.privacyAgreement.employeeInfo.verified')}</span>
                            </div>
                        )}

                        {verificationError && (
                            <div className="verification-status error">
                                <AlertCircle size={18} />
                                <span>{verificationError}</span>
                            </div>
                        )}

                        {errors.employee && !verificationError && (
                            <div className="verification-status error">
                                <AlertCircle size={18} />
                                <span>{errors.employee}</span>
                            </div>
                        )}
                    </div>

                    {/* 방문자 정보 */}
                    <div className="form-group-section">
                        <h3><User size={20} /> {t('visitReserve.privacyAgreement.visitorInfo.title')}</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitorName">{t('visitReserve.privacyAgreement.visitorInfo.name')} <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="visitorName"
                                    name="visitorName"
                                    value={formData.visitorName}
                                    onChange={handleInputChange}
                                    placeholder={t('visitReserve.privacyAgreement.visitorInfo.namePlaceholder')}
                                    className={errors.visitorName ? 'error' : ''}
                                />
                                {errors.visitorName && <div className="error-message">{errors.visitorName}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitorCompany">{t('visitReserve.privacyAgreement.visitorInfo.company')}</label>
                                <input
                                    type="text"
                                    id="visitorCompany"
                                    name="visitorCompany"
                                    value={formData.visitorCompany}
                                    onChange={handleInputChange}
                                    placeholder={t('visitReserve.privacyAgreement.visitorInfo.companyPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitorContact">{t('visitReserve.privacyAgreement.visitorInfo.contact')} <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="visitorContact"
                                    name="visitorContact"
                                    value={formData.visitorContact}
                                    onChange={handleInputChange}
                                    onBlur={handlePhoneBlur}
                                    placeholder={t('visitReserve.privacyAgreement.visitorInfo.contactPlaceholder')}
                                    className={errors.visitorContact ? 'error' : ''}
                                />
                                {errors.visitorContact && <div className="error-message">{errors.visitorContact}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitorCarNumber">{t('visitReserve.privacyAgreement.visitorInfo.carNumber')}</label>
                                <input
                                    type="text"
                                    id="visitorCarNumber"
                                    name="visitorCarNumber"
                                    value={formData.visitorCarNumber}
                                    onChange={handleInputChange}
                                    placeholder={t('visitReserve.privacyAgreement.visitorInfo.carNumberPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="visitPurpose">{t('visitReserve.privacyAgreement.visitorInfo.purpose')} <span className="required">*</span></label>
                            <div className="form-purpose-container">
                                <div className="form-purpose-select">
                                    <select
                                        id="visitReasonId"
                                        name="visitReasonId"
                                        onChange={handleInputChange}
                                        disabled={loadingReasons}
                                    >
                                        {visitReasons.map(reason => (
                                            <option key={reason.visitReasonID} value={reason.visitReasonID}>{reason.visitReasonName}</option>
                                        ))}
                                    </select>
                                    {loadingReasons && <div className="loading-text">{t('common.loading')}</div>}
                                </div>
                                <div className="form-purpose-input">
                                    <input
                                        type="text"
                                        id="visitPurpose"
                                        name="visitPurpose"
                                        value={formData.visitPurpose}
                                        onChange={handleInputChange}
                                        placeholder={t('visitReserve.privacyAgreement.visitorInfo.purposePlaceholder')}
                                        className={errors.visitPurpose ? 'error' : ''}
                                        disabled={loadingReasons}
                                    />
                                </div>
                            </div>
                            {errors.visitPurpose && <div className="error-message">{errors.visitPurpose}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitDate">{t('visitReserve.privacyAgreement.visitorInfo.visitDate')} <span className="required">*</span></label>
                                <div className="input-with-icon">
                                    <Calendar size={18} />
                                    <input
                                        type="date"
                                        id="visitDate"
                                        name="visitDate"
                                        value={formData.visitDate}
                                        onChange={handleInputChange}
                                        min={getCurrentDate()}
                                        className={errors.visitDate ? 'error' : ''}
                                    />
                                </div>
                                {errors.visitDate && <div className="error-message">{errors.visitDate}</div>}
                                {!dateChanged && <div className="input-help-text">{t('visitReserve.privacyAgreement.visitorInfo.defaultDateNotice')}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitTime">{t('visitReserve.privacyAgreement.visitorInfo.visitTime')} <span className="required">*</span></label>
                                <div className="input-with-icon">
                                    <Clock size={18} />
                                    <input
                                        type="time"
                                        id="visitTime"
                                        name="visitTime"
                                        value={formData.visitTime}
                                        onChange={handleInputChange}
                                        className={errors.visitTime ? 'error' : ''}
                                    />
                                </div>
                                {errors.visitTime && <div className="error-message">{errors.visitTime}</div>}
                                {!timeChanged && <div className="input-help-text">{t('visitReserve.privacyAgreement.visitorInfo.defaultTimeNotice')}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitEndDate">{t('visitReserve.privacyAgreement.visitorInfo.visitEndDate')} <span className="required">*</span></label>
                                <div className="input-with-icon">
                                    <Calendar size={18} />
                                    <input
                                        type="date"
                                        id="visitEndDate"
                                        name="visitEndDate"
                                        value={formData.visitEndDate}
                                        onChange={handleInputChange}
                                        min={formData.visitDate}
                                        className={errors.visitEndDate ? 'error' : ''}
                                    />
                                </div>
                                {errors.visitEndDate && <div className="error-message">{errors.visitEndDate}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitEndTime">{t('visitReserve.privacyAgreement.visitorInfo.visitEndTime')} <span className="required">*</span></label>
                                <div className="input-with-icon">
                                    <Clock size={18} />
                                    <input
                                        type="time"
                                        id="visitEndTime"
                                        name="visitEndTime"
                                        value={formData.visitEndTime}
                                        onChange={handleInputChange}
                                        className={errors.visitEndTime ? 'error' : ''}
                                    />
                                </div>
                                {errors.visitEndTime && <div className="error-message">{errors.visitEndTime}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className={`btn btn-primary btn-lg ${(privacyAgreed !== 'agree' || !isEmployeeVerified) ? 'btn-disabled' : ''}`}
                        >
                            {t('visitReserve.privacyAgreement.actions.submit')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-lg"
                            onClick={() => navigate('/')}
                        >
                            {t('visitReserve.privacyAgreement.actions.cancel')}
                        </button>
                    </div>
                </form>
            </div>

            {/* 직원 선택 모달 */}
            <Modal
                isOpen={showEmployeeModal}
                onClose={() => setShowEmployeeModal(false)}
                title={t('visitReserve.privacyAgreement.employeeSelector.title')}
                size="medium"
                closeOnClickOutside={false}
            >
                <EmployeeSelector
                    employees={employeeList}
                    onSelect={handleSelectEmployee}
                    onCancel={() => setShowEmployeeModal(false)}
                />
            </Modal>

            {loading && <LoadingOverlay />}
        </div>
    );
}

PrivacyAgreementInput.propTypes = {
    onSubmit: PropTypes.func,
};

export default PrivacyAgreementInput; 