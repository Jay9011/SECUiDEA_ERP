/**
 * 알리고 서비스 수신자 정보 클래스
 */
class ReceiverInfo {
    /**
     * 수신자 정보 생성자
     * @param {string} options.phone - 수신자 전화번호
     * @param {string} options.name - 수신자 이름
     * @param {Object} options.variables - 변수 값 딕셔너리
     * @param {Object} options.queryVariables - 쿼리 변수 딕셔너리
     */
    constructor({
        phone = '',
        name = '',
        variables = {},
        queryVariables = {}
    } = {}) {
        /**
         * 수신자 전화번호
         * @type {string}
         */
        this.phone = phone;

        /**
         * 수신자 이름
         * @type {string}
         */
        this.name = name;

        /**
         * 변수 값 딕셔너리 (알리고 템플릿 변수 쌍 필요 "변수" : "값")
         * @type {Object}
         */
        this.variables = variables;

        /**
         * 쿼리 변수 딕셔너리 (알리고 템플릿 변수 쌍 필요 "변수" : "값")
         * @type {Object}
         */
        this.queryVariables = queryVariables;
    }

    /**
     * JSON 직렬화를 위한 메서드
     * @returns {Object} - 직렬화된 객체
     */
    toJSON() {
        return {
            phone: this.phone,
            name: this.name,
            variables: this.variables,
            queryVariables: this.queryVariables
        };
    }
}

export default ReceiverInfo; 