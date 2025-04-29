/**
 * 인증 프로바이더 종류
 * @readonly
 * @enum {string}
 */
export const AuthProvider = Object.freeze({
    /** S1인증 방식 */
    S1: 'S1',
    /** S1 게스트 인증 방식 */
    S1_GUEST: 'S1_GUEST',
    /** SECUiDEA 인증 방식 */
    SECUiDEA: 'SECUiDEA'
});

/**
 * 프로바이더 설정 정보를 조회
 * @param {string} provider - 프로바이더 식별자 (AuthProvider 상수 중 하나)
 * @returns {Object} 프로바이더 설정 정보
 * @throws {Error} 지원하지 않는 프로바이더인 경우 예외 발생
 */
export const getProviderConfig = (provider) => {
    switch (provider) {
        case AuthProvider.S1:
            return {
                name: 'S1인증',
                loginEndpoint: '/api/Login/S1Auth/Login',
                requiresPassword: true
            };
        case AuthProvider.S1_GUEST:
            return {
                name: 'S1 게스트 인증',
                loginEndpoint: '/api/Login/S1Auth/GuestLogin',
                requiresPassword: true
            };
        case AuthProvider.SECUiDEA: // TODO: 추후 추가 예정
            return {
                name: 'SECUiDEA 인증',
                loginEndpoint: '/api/Login/SECUiDEA/Login',
                requiresPassword: true
            };
        default:
            throw new Error(`지원하지 않는 인증 프로바이더입니다: ${provider}`);
    }
};

/**
 * 사용 가능한 모든 프로바이더 목록 조회
 * @returns {Array<Object>} 프로바이더 설정 정보 배열
 */
export const getAllProviders = () => {
    return Object.values(AuthProvider).map(provider => ({
        id: provider,
        ...getProviderConfig(provider)
    }));
};

/**
 * 활성화된 프로바이더 목록 조회 (추후 설정 파일이나 API로부터 정보 받아올 수 있음)
 * @returns {Array<Object>} 활성화된 프로바이더 설정 정보 배열
 */
export const getEnabledProviders = () => {
    const enabledProviderIds = [AuthProvider.S1];
    return enabledProviderIds.map(provider => ({
        id: provider,
        ...getProviderConfig(provider)
    }));
}; 