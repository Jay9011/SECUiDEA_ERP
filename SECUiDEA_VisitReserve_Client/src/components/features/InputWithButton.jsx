import React from 'react';
import PropTypes from 'prop-types';
import './InputWithButton.scss';

/**
 * 입력 필드와 버튼을 함께 표시하는 컴포넌트
 */
function InputWithButton({
  inputProps,      // 입력 필드에 전달할 props
  buttonProps,     // 버튼에 전달할 props
  buttonContent,   // 버튼 내용 (텍스트 또는 컴포넌트)
  error,           // 에러 메시지
  disabled,        // 비활성화 여부
  className        // 추가 클래스명
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !buttonProps.disabled && !disabled) {
      e.preventDefault();
      buttonProps.onClick && buttonProps.onClick(e);
    }

    inputProps.onKeyDown && inputProps.onKeyDown(e);
  };

  return (
    <div className={`input-with-button ${className || ''}`}>
      <div className="input-button-container">
        <input
          className={error ? 'error' : ''}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          {...inputProps}
        />
        <button
          type="button"
          disabled={buttonProps.disabled || disabled}
          {...buttonProps}
        >
          {buttonContent}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

InputWithButton.propTypes = {
  inputProps: PropTypes.object.isRequired,
  buttonProps: PropTypes.object.isRequired,
  buttonContent: PropTypes.node.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default InputWithButton; 