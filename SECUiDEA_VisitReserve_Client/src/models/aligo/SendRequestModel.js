import ReceiverInfo from './ReceiverInfo';

/**
 * 알리고 서비스 발송 요청 모델
 */
class SendRequestModel {
    /**
     * 발송 요청 모델
     * @param {string} options.gubun - 구분 값
     * @param {Array<ReceiverInfo>} options.receiverList - 수신 정보 목록
     */
    constructor({
        gubun = '',
        receiverList = []
    } = {}) {
        /**
         * 구분 값
         * @type {string}
         */
        this.gubun = gubun;

        /**
         * 수신 정보 목록
         * @type {Array<ReceiverInfo>}
         */
        this.receiverList = receiverList;
    }

    /**
     * 수신 정보 추가
     * @param {ReceiverInfo} receiver - 추가할 수신 정보
     */
    addReceiver(receiver) {
        if (receiver instanceof ReceiverInfo) {
            this.receiverList.push(receiver);
        } else {
            throw new Error('receiver는 ReceiverInfo 인스턴스여야 합니다.');
        }
    }

    /**
     * JSON 직렬화를 위한 메서드
     * @returns {Object} - 직렬화된 객체
     */
    toJSON() {
        return {
            gubun: this.gubun,
            receiverList: this.receiverList.map(receiver => receiver.toJSON())
        };
    }

    /**
     * 요청 바디로 변환하는 메서드
     * @returns {Object} - API 요청에 사용할 요청 바디
     */
    toRequestBody() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * FormData로 변환하는 메서드 (필요한 경우)
     * @returns {FormData} - 폼 데이터 형식으로 변환된 요청 데이터
     */
    toFormData() {
        const formData = new FormData();
        formData.append('gubun', this.gubun);

        // ReceiverList를 JSON 문자열로 변환하여 추가
        formData.append('receiverList', JSON.stringify(this.receiverList.map(receiver => receiver.toJSON())));

        return formData;
    }
}

export default SendRequestModel; 