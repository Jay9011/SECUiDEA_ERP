/**
 * 권한 관리 유틸리티 함수
 */
import { useAuth } from '../context/AuthContext';

/**
 * 권한 확인을 위한 커스텀 훅
 * @param {Object} requiredPermission - 필요한 권한 정보 {feature, level}
 * @returns {boolean} 권한 있음 여부
 */
export const usePermission = (requiredPermission) => {
    const { user } = useAuth();

    if (!user || !user.permissions) return false;

    return user.permissions.some(p =>
        p.feature === requiredPermission.feature &&
        p.level >= requiredPermission.level
    );
};

/**
 * 컴포넌트에서 권한을 확인하기 위한 HOC (Higher Order Component)
 * @param {Component} Component - 래핑할 컴포넌트
 * @param {Object} requiredPermission - 필요한 권한 정보 {feature, level}
 * @returns {Component} 권한 확인 로직이 포함된 컴포넌트
 */
export const withPermission = (Component, requiredPermission) => {
    return (props) => {
        const hasAccess = usePermission(requiredPermission);

        if (!hasAccess) {
            return null; // 또는 접근 거부 메시지를 표시하는 컴포넌트
        }

        return <Component {...props} />;
    };
}; 