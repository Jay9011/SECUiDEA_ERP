import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VisitReservation = () => {
    const navigate = useNavigate();
    const { user, authHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorPhone: '',
        visitorEmail: '',
        visitorCompany: '',
        hostName: '',
        hostDepartment: '',
        visitDate: '',
        visitStartTime: '',
        visitEndTime: '',
        visitPurpose: '',
        numberOfVisitors: 1,
        carInfo: {
            hasVehicle: false,
            carNumber: '',
            carModel: ''
        },
        agreeToTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'hasVehicle') {
            setFormData({
                ...formData,
                carInfo: {
                    ...formData.carInfo,
                    hasVehicle: checked
                }
            });
        } else if (name === 'carNumber' || name === 'carModel') {
            setFormData({
                ...formData,
                carInfo: {
                    ...formData.carInfo,
                    [name]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const validateForm = () => {
        if (!formData.visitorName) return '방문자 이름을 입력해주세요.';
        if (!formData.visitorPhone) return '연락처를 입력해주세요.';
        if (!formData.visitDate) return '방문 날짜를 선택해주세요.';
        if (!formData.visitStartTime) return '방문 시작 시간을 선택해주세요.';
        if (!formData.visitEndTime) return '방문 종료 시간을 선택해주세요.';
        if (!formData.visitPurpose) return '방문 목적을 입력해주세요.';
        if (!formData.hostName) return '담당자 이름을 입력해주세요.';
        if (!formData.hostDepartment) return '담당 부서를 입력해주세요.';
        if (!formData.agreeToTerms) return '방문 안내 사항에 동의해주세요.';

        // 날짜 및 시간 형식 검증
        const visitDatePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!visitDatePattern.test(formData.visitDate)) {
            return '방문 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)';
        }

        // 시작 시간이 종료 시간보다 이후인 경우
        if (formData.visitStartTime >= formData.visitEndTime) {
            return '방문 종료 시간은 시작 시간 이후여야 합니다.';
        }

        // 차량 정보가 있는 경우 차량 번호 필수
        if (formData.carInfo.hasVehicle && !formData.carInfo.carNumber) {
            return '차량 번호를 입력해주세요.';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // API 호출
            const response = await fetch(`${import.meta.env.VITE_API_URL}/visits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user ? authHeader : {})
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '방문 신청 중 오류가 발생했습니다.');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 현재 날짜 이후만 선택 가능하도록 최소 날짜 설정
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (success) {
        return (
            <div className="visit-reservation">
                <div className="visit-reservation_success">
                    <h2>방문 신청이 완료되었습니다!</h2>
                    <p>신청하신 내용은 담당자 확인 후 승인될 예정입니다.</p>
                    <p>승인 결과는 입력하신 이메일로 알려드립니다.</p>
                    <p className="visit-reservation_redirect-info">3초 후 메인 페이지로 이동합니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="visit-reservation">
            <div className="visit-reservation_header">
                <h1>방문 신청</h1>
                <p>방문 정보를 입력하여 신청해주세요. 담당자 확인 후 승인됩니다.</p>
            </div>

            {error && (
                <div className="visit-reservation_error">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="visit-reservation_form">
                <div className="visit-reservation_form-section">
                    <h2>방문자 정보</h2>

                    <div className="form-group">
                        <label htmlFor="visitorName">방문자 이름 *</label>
                        <input
                            type="text"
                            id="visitorName"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="visitorPhone">연락처 *</label>
                        <input
                            type="tel"
                            id="visitorPhone"
                            name="visitorPhone"
                            value={formData.visitorPhone}
                            onChange={handleInputChange}
                            placeholder="010-0000-0000"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="visitorEmail">이메일</label>
                        <input
                            type="email"
                            id="visitorEmail"
                            name="visitorEmail"
                            value={formData.visitorEmail}
                            onChange={handleInputChange}
                            placeholder="이메일 주소를 입력하세요"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="visitorCompany">회사/기관명</label>
                        <input
                            type="text"
                            id="visitorCompany"
                            name="visitorCompany"
                            value={formData.visitorCompany}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="numberOfVisitors">방문 인원</label>
                        <input
                            type="number"
                            id="numberOfVisitors"
                            name="numberOfVisitors"
                            min="1"
                            max="10"
                            value={formData.numberOfVisitors}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="visit-reservation_form-section">
                    <h2>방문 일정</h2>

                    <div className="form-group">
                        <label htmlFor="visitDate">방문 날짜 *</label>
                        <input
                            type="date"
                            id="visitDate"
                            name="visitDate"
                            value={formData.visitDate}
                            onChange={handleInputChange}
                            min={getMinDate()}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="visitStartTime">시작 시간 *</label>
                            <input
                                type="time"
                                id="visitStartTime"
                                name="visitStartTime"
                                value={formData.visitStartTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="visitEndTime">종료 시간 *</label>
                            <input
                                type="time"
                                id="visitEndTime"
                                name="visitEndTime"
                                value={formData.visitEndTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="visit-reservation_form-section">
                    <h2>방문 정보</h2>

                    <div className="form-group">
                        <label htmlFor="visitPurpose">방문 목적 *</label>
                        <textarea
                            id="visitPurpose"
                            name="visitPurpose"
                            value={formData.visitPurpose}
                            onChange={handleInputChange}
                            rows="3"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="hostName">담당자 이름 *</label>
                        <input
                            type="text"
                            id="hostName"
                            name="hostName"
                            value={formData.hostName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="hostDepartment">담당 부서 *</label>
                        <input
                            type="text"
                            id="hostDepartment"
                            name="hostDepartment"
                            value={formData.hostDepartment}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="visit-reservation_form-section">
                    <h2>차량 정보</h2>

                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="hasVehicle"
                            name="hasVehicle"
                            checked={formData.carInfo.hasVehicle}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="hasVehicle">차량으로 방문합니다</label>
                    </div>

                    {formData.carInfo.hasVehicle && (
                        <>
                            <div className="form-group">
                                <label htmlFor="carNumber">차량 번호 *</label>
                                <input
                                    type="text"
                                    id="carNumber"
                                    name="carNumber"
                                    value={formData.carInfo.carNumber}
                                    onChange={handleInputChange}
                                    placeholder="예: 12가 3456"
                                    required={formData.carInfo.hasVehicle}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="carModel">차종</label>
                                <input
                                    type="text"
                                    id="carModel"
                                    name="carModel"
                                    value={formData.carInfo.carModel}
                                    onChange={handleInputChange}
                                    placeholder="예: 소나타"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="visit-reservation_form-section">
                    <h2>방문 안내</h2>

                    <div className="visit-reservation_notice">
                        <p>1. 방문자는 방문 당일 신분증을 지참해주세요.</p>
                        <p>2. 방문 시간 10분 전까지 도착해주시기 바랍니다.</p>
                        <p>3. 방문 목적 외 시설 이용은 제한됩니다.</p>
                        <p>4. 사진 촬영은 보안상 금지되어 있습니다.</p>
                        <p>5. 주차 공간은 제한되어 있으니 가급적 대중교통을 이용해주세요.</p>
                    </div>

                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="agreeToTerms">위 안내 사항을 모두 읽고 이에 동의합니다 *</label>
                    </div>
                </div>

                <div className="visit-reservation_form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? '처리중...' : '방문 신청하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VisitReservation; 