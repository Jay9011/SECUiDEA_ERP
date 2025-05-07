import { ReceiverInfo, SendRequestModel } from '../models/aligo';

/**
 * 알리고 서비스 관련 API
 */
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

/**
 * 알리고 메시지 발송 API
 * @param {string} apiKey - 인증 API 키 (X-API-KEY)
 * @param {SendRequestModel} sendRequestModel - 발송 요청 모델
 * @returns {Promise<Object>} - API 응답 객체
 */
export async function sendMessage(apiKey, sendRequestModel) {
    try {
        const response = await fetch(`${API_BASE_URL}/Aligo/SendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            },
            body: sendRequestModel.toRequestBody()
        });

        return await response;
    } catch (error) {
        console.error('Aligo Api call failed:', error);
        throw error;
    }
}

/**
 * 알리고 메시지 발송 예제
 * @param {string} apiKey - 인증 API 키 (X-API-KEY)
 * @param {string} gubun - 구분 값
 * @param {string} phoneNumber - 수신자 전화번호
 * @param {string} userName - 수신자 이름
 * @param {Object} templateVariables - 템플릿 변수
 * @returns {Promise<Object>} - API 응답
 */
export async function sendTemplateMessage(apiKey, gubun, phoneNumber, userName, templateVariables = {}, queryVariables = {}) {
    // 수신자 정보 생성
    const receiver = new ReceiverInfo({
        phone: phoneNumber,
        name: userName,
        variables: templateVariables,
        queryVariables: queryVariables
    });

    // 요청 모델 생성
    const requestModel = new SendRequestModel({
        gubun: gubun,
        receiverList: [receiver]
    });

    // API 호출
    return await sendMessage(apiKey, requestModel);
}

/**
 * 여러 수신자에게 메시지 발송
 * @param {string} apiKey - 인증 API 키 (X-API-KEY)
 * @param {string} gubun - 구분 값
 * @param {Array<Object>} receiverDataList - 수신자 데이터 목록
 * @see {@link ReceiverInfo}
 * @returns {Promise<Object>} - API 응답
 */
export async function sendTemplateMessageMulti(apiKey, gubun, receiverDataList) {
    // 요청 모델 생성
    const requestModel = new SendRequestModel({
        gubun: gubun,
        receiverList: []
    });

    // 수신자 정보 추가
    receiverDataList.forEach(data => {
        const receiver = new ReceiverInfo({
            phone: data.phone,
            name: data.name,
            variables: data.variables || {},
            queryVariables: data.queryVariables || {}
        });

        requestModel.addReceiver(receiver);
    });

    // API 호출
    return await sendMessage(apiKey, requestModel);
} 