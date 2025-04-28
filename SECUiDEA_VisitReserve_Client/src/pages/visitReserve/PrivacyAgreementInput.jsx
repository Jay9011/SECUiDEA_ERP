import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Clock, Shield, CheckCircle, Search, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

// 컴포넌트
import Accordion from '../../components/features/Accordion';
import Modal from '../../components/features/Modal';
import EmployeeSelector from '../../components/features/EmployeeSelector';
import InputWithButton from '../../components/features/InputWithButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

// 스타일
import './PrivacyAgreement.scss';

import { verifyEmployee, submitReservation, getVisitReasons } from '../../services/visitReserveApis';

function PrivacyAgreementInput() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

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

    // 종료 시간 설정 (23:59)
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

    // 방문 목적 데이터 가져오기
    useEffect(() => {
        const fetchVisitReasons = async () => {
            try {
                setLoadingReasons(true);
                const result = await getVisitReasons(i18n.language);
                if (result.isSuccess && result.data && result.data.reasons) {
                    setVisitReasons(result.data.reasons);
                } else {
                    console.error('방문 목적 데이터를 가져오지 못했습니다.');
                }
            } catch (error) {
                console.error('방문 목적 로드 오류:', error);
            } finally {
                setLoadingReasons(false);
            }
        };

        fetchVisitReasons();
    }, [i18n.language]);

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

        // 숫자만 추출
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

            // 시작 날짜가 변경되면 종료 날짜도 같이 변경
            if (!endDateChanged) {
                setFormData({
                    ...formData,
                    [name]: value,
                    visitEndDate: value
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
        // 이름 필드 앞/뒤의 공백 제거
        formData.employeeName = formData.employeeName.trim();

        // 필수 필드 유효성 검사
        if (!formData.employeeName.trim()) {
            setErrors({
                ...errors,
                employeeName: '직원 이름을 입력해주세요'
            });
            return;
        }

        try {
            setIsVerifying(true);
            setVerificationError('');

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
                    setVerificationError('직원 정보를 가져오는 중 오류가 발생했습니다');
                    toast.error('직원 정보를 가져오는 중 오류가 발생했습니다');
                }
            } else {
                setVerificationError(result.message || '일치하는 직원 정보를 찾을 수 없습니다');
                toast.error(result.message || '일치하는 직원 정보를 찾을 수 없습니다');
            }
        } catch (error) {
            setVerificationError('직원 정보 확인 중 오류가 발생했습니다');
            toast.error('직원 정보 확인 중 오류가 발생했습니다');
            console.error('직원 확인 오류:', error);
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
            newErrors.employee = '직원 정보를 확인해주세요';
        }

        // 필수 필드 검사
        const requiredFields = [
            'visitorName', 'visitorContact',
            'visitDate', 'visitTime', 'visitEndDate', 'visitEndTime'
        ];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = '필수 입력 항목입니다';
            }
        });

        // 이메일 형식 검사
        if (formData.visitorEmail && !/\S+@\S+\.\S+/.test(formData.visitorEmail)) {
            newErrors.visitorEmail = '유효한 이메일 주소를 입력해주세요';
        }

        // 종료 날짜/시간이 시작 날짜/시간보다 이후인지 검사
        if (formData.visitDate && formData.visitEndDate && formData.visitTime && formData.visitEndTime) {
            const startDateTime = new Date(`${formData.visitDate}T${formData.visitTime}`);
            const endDateTime = new Date(`${formData.visitEndDate}T${formData.visitEndTime}`);

            if (endDateTime < startDateTime) {
                newErrors.visitEndDate = '종료 일시는 시작 일시보다 이후여야 합니다';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출 핸들러
    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (privacyAgreed !== 'agree') {
            toast.error('개인정보 처리방침에 동의해주세요');
            scrollToRef(privacyCheckRef);
            return;
        }

        if (!isEmployeeVerified || !formData.employeePid) {
            toast.error('직원 정보를 확인해주세요');
            scrollToRef(employeeCheckRef);
            return;
        }

        if (!validateForm()) {
            const firstErrorField = Object.keys(errors)[0];
            scrollToField(firstErrorField);

            toast.error('모든 필수 항목을 올바르게 입력해주세요');
            return;
        }

        handleSubmit();
    };

    // 기존 폼 제출 처리 - API 호출 부분
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 방문 신청 API 호출
            const result = await submitReservation({
                employeePid: formData.employeePid,
                employeeName: formData.employeeName,
                visitorName: formData.visitorName,
                visitorCompany: formData.visitorCompany,
                visitorContact: formData.visitorContact,
                visitorEmail: formData.visitorEmail,
                visitReasonId: formData.visitReasonId,
                visitPurpose: formData.visitPurpose,
                visitDate: formData.visitDate,
                visitTime: formData.visitTime,
                visitEndDate: formData.visitEndDate,
                visitEndTime: formData.visitEndTime,
                visitorCarNumber: formData.visitorCarNumber,
            });

            // 성공 시 결과 페이지로 이동
            navigate('/visitReserve/ReserveResult', {
                state: {
                    result: result.isSuccess,
                    visitorName: result.data?.visitorName,
                    visitorContact: result.data?.visitorContact,
                    visitDate: result.data?.visitDate,
                    visitTime: result.data?.visitTime,
                    educationWatched: result.data?.educationWatched,
                }
            });
        } catch (error) {
            toast.error('방문 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error('방문 신청 오류:', error);
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
                <h1>방문 예약</h1>
                <p className="page-subtitle">방문 정보 및 개인정보를 입력해주세요</p>
            </div>

            <div className="form-section">
                {/* 개인정보 처리방침 섹션 */}
                <div className="privacy-agreement-section">
                    <div className="section-header">
                        <h2><Shield size={20} /> 개인정보 처리방침</h2>
                        <p>방문 신청을 위해 아래 개인정보 처리방침을 확인해주세요</p>
                    </div>

                    <div className="privacy-card">
                        <Accordion
                            title="개인정보 수집 및 이용 동의 (필수)"
                            className="privacy-accordion"
                            maxHeight={400}
                            expanded={accordionExpanded}
                            onToggle={handleAccordionToggle}
                        >
                            <p>주식회사 [회사명]은(는) 방문 예약 서비스 제공을 위해 아래와 같이 개인정보를 수집 및 이용합니다.</p>

                            <h4>1. 수집항목</h4>
                            <ul>
                                <li>필수항목: 성명, 연락처, 소속, 방문목적, 방문일시</li>
                                <li>선택항목: 이메일</li>
                            </ul>

                            <h4>2. 수집 및 이용목적</h4>
                            <ul>
                                <li>방문자 출입관리 및 보안유지</li>
                                <li>방문 예약 확인 및 변경 안내</li>
                            </ul>

                            <h4>3. 보유 및 이용기간</h4>
                            <p>방문일로부터 1년간 보관 후 파기</p>

                            <h4>4. 동의 거부권 및 불이익</h4>
                            <p>개인정보 수집에 동의하지 않을 경우 방문 예약 서비스 이용이 제한됩니다.</p>

                            <h4>5. 개인정보의 제3자 제공</h4>
                            <p>수집한 개인정보는 아래의 경우를 제외하고 제3자에게 제공하지 않습니다.</p>
                            <ul>
                                <li>정보주체의 동의가 있는 경우</li>
                                <li>법령에 의해 제공이 요구되는 경우</li>
                                <li>서비스 제공에 관한 계약 이행을 위해 필요한 경우</li>
                            </ul>

                            <h4>6. 정보주체의 권리, 의무 및 행사방법</h4>
                            <p>정보주체는 개인정보 보호법 등 관계법령에 따라 다음과 같은 권리를 행사할 수 있습니다.</p>
                            <ul>
                                <li>개인정보 열람, 정정·삭제, 처리정지 요구</li>
                                <li>개인정보의 오류 등이 있는 경우 정정 요구</li>
                                <li>개인정보 수집에 대한 동의 철회</li>
                            </ul>

                            <h4>7. 개인정보 보호책임자</h4>
                            <p>개인정보 보호책임자: 홍길동</p>
                            <p>연락처: 02-1234-5678, privacy@company.com</p>
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
                                    <span>동의합니다</span>
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="privacy-agreement"
                                        value="disagree"
                                        checked={privacyAgreed === 'disagree'}
                                        onChange={handlePrivacyChange}
                                    />
                                    <span>동의하지 않습니다</span>
                                </label>
                            </div>
                            {privacyAgreed === 'disagree' && (
                                <div className="privacy-disagree-notice">
                                    개인정보 수집에 동의하지 않을 경우 방문 예약 서비스를 이용하실 수 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 방문 정보 폼 */}
                <form onSubmit={handleFormSubmit} className="visit-form">
                    {/* 방문 대상 직원 정보 */}
                    <div className="form-group-section">
                        <h3><Users size={20} /> 방문 대상 직원 정보</h3>

                        <div className="form-group" ref={employeeCheckRef}>
                            <label htmlFor="employeeName">직원 이름 <span className="required">*</span></label>
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
                                    buttonContent="다시 입력"
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
                                        placeholder: "방문 대상 직원 이름",
                                    }}
                                    buttonProps={{
                                        className: "btn-primary verify-btn",
                                        onClick: handleVerifyEmployee,
                                        disabled: isVerifying || !formData.employeeName.trim(),
                                    }}
                                    buttonContent={
                                        isVerifying ? (
                                            <span>확인 중...</span>
                                        ) : (
                                            <>
                                                <Search size={18} />
                                                <span>직원 확인</span>
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
                                <span>직원 정보가 확인되었습니다.</span>
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
                        <h3><User size={20} /> 방문자 정보</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitorName">방문자 이름 <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="visitorName"
                                    name="visitorName"
                                    value={formData.visitorName}
                                    onChange={handleInputChange}
                                    placeholder="방문자 이름"
                                    className={errors.visitorName ? 'error' : ''}
                                />
                                {errors.visitorName && <div className="error-message">{errors.visitorName}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitorCompany">소속 회사</label>
                                <input
                                    type="text"
                                    id="visitorCompany"
                                    name="visitorCompany"
                                    value={formData.visitorCompany}
                                    onChange={handleInputChange}
                                    placeholder="소속 회사명"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitorContact">연락처 <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="visitorContact"
                                    name="visitorContact"
                                    value={formData.visitorContact}
                                    onChange={handleInputChange}
                                    onBlur={handlePhoneBlur}
                                    placeholder="숫자만 입력 (예: 01012345678)"
                                    className={errors.visitorContact ? 'error' : ''}
                                />
                                {errors.visitorContact && <div className="error-message">{errors.visitorContact}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitorEmail">이메일</label>
                                <input
                                    type="email"
                                    id="visitorEmail"
                                    name="visitorEmail"
                                    value={formData.visitorEmail}
                                    onChange={handleInputChange}
                                    placeholder="example@email.com"
                                    className={errors.visitorEmail ? 'error' : ''}
                                />
                                {errors.visitorEmail && <div className="error-message">{errors.visitorEmail}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="visitPurpose">방문 목적 <span className="required">*</span></label>
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
                                    {loadingReasons && <div className="loading-text">로딩중...</div>}
                                </div>
                                <div className="form-purpose-input">
                                    <input
                                        type="text"
                                        id="visitPurpose"
                                        name="visitPurpose"
                                        value={formData.visitPurpose}
                                        onChange={handleInputChange}
                                        placeholder="방문의 상세 목적을 입력해주세요"
                                        className={errors.visitPurpose ? 'error' : ''}
                                        disabled={loadingReasons}
                                    />
                                </div>
                            </div>
                            {errors.visitPurpose && <div className="error-message">{errors.visitPurpose}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitDate">방문 시작 날짜 <span className="required">*</span></label>
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
                                {!dateChanged && <div className="input-help-text">현재 날짜가 기본값으로 설정되어 있습니다.</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitTime">방문 시작 시간 <span className="required">*</span></label>
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
                                {!timeChanged && <div className="input-help-text">현재 시간이 기본값으로 설정되어 있습니다.</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitEndDate">방문 종료 날짜 <span className="required">*</span></label>
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
                                <label htmlFor="visitEndTime">방문 종료 시간 <span className="required">*</span></label>
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

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="visitorCarNumber">차량 번호</label>
                                <input
                                    type="text"
                                    id="visitorCarNumber"
                                    name="visitorCarNumber"
                                    value={formData.visitorCarNumber}
                                    onChange={handleInputChange}
                                    placeholder="차량 번호 (예: 12가3456)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className={`btn btn-primary btn-lg ${(privacyAgreed !== 'agree' || !isEmployeeVerified) ? 'btn-disabled' : ''}`}
                        >
                            방문 신청하기
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-lg"
                            onClick={() => navigate('/')}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>

            {/* 직원 선택 모달 */}
            <Modal
                isOpen={showEmployeeModal}
                onClose={() => setShowEmployeeModal(false)}
                title="방문 대상 직원 선택"
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