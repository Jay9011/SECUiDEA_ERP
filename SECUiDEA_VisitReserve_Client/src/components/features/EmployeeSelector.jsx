import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';

const EmployeeSelector = ({ employees, onSelect, onCancel }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 직원 목록 필터링
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 직원 선택 처리
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  // 확인 버튼 클릭 처리
  const handleConfirm = () => {
    if (selectedEmployee) {
      onSelect(selectedEmployee);
    }
  };

  return (
    <div className="employee-selector">
      {/* 검색 기능 */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="이름 또는 부서명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 직원 목록 */}
      <div className="employee-list">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div
              key={employee.pid}
              className={`employee-item ${selectedEmployee?.pid === employee.pid ? 'selected' : ''}`}
              onClick={() => handleSelectEmployee(employee)}
            >
              <div className="employee-info">
                <div className="employee-name">{employee.name}</div>
              </div>
              <div className="employee-id">{employee.departmentName}</div>
            </div>
          ))
        ) : (
          <div className="no-results">검색 결과가의 직원이 없습니다</div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="selector-actions">
        <button
          className="btn btn-outline"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          className="btn btn-primary"
          disabled={!selectedEmployee}
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
};

EmployeeSelector.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      pid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      departmentName: PropTypes.string.isRequired
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default EmployeeSelector; 