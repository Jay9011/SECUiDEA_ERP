// 방문 현황 목록 Mock 데이터
export const generateMockVisitData = (count = 20, forMember = true) => {
  const statusOptions = ['pending', 'approved', 'rejected', 'canceled'];
  const visitorNames = ['김철수', '이영희', '박지민', '최동욱', '정수연', '한지원', '윤민준', '송태희', '조현우', '황미란'];
  const companies = ['(주)대한기업', '세종전자', '광개발', '신흥물산', '태양건설', '해운정보통신', '미래에너지', '글로벌테크', '우리금융', '동서상사'];
  const purposes = ['회의', '납품', '미팅', '장비점검', '인터뷰', '컨설팅', '교육', '프로젝트 회의', '사업 제안', '공사'];
  
  const currentDate = new Date();
  const mockData = [];
  
  for (let i = 1; i <= count; i++) {
    // 랜덤 날짜 (현재 날짜 기준 ±30일)
    const randomDate = new Date(currentDate);
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 60) - 30);
    
    // 시간대 랜덤 생성 (9시~18시)
    const hour = Math.floor(Math.random() * 9) + 9;
    const minute = Math.floor(Math.random() * 6) * 10; // 10분 단위로
    
    const formattedDate = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    const visitorName = visitorNames[Math.floor(Math.random() * visitorNames.length)];
    const visitorCompany = companies[Math.floor(Math.random() * companies.length)];
    
    // Member와 Guest에 따라 상태 분포를 다르게 설정
    let status;
    if (forMember) {
      // Member는 대기중인 항목이 더 많도록
      const rand = Math.random();
      if (rand < 0.5) {
        status = 'pending';
      } else if (rand < 0.8) {
        status = 'approved';
      } else if (rand < 0.9) {
        status = 'rejected';
      } else {
        status = 'canceled';
      }
    } else {
      // Guest는 승인됨이 더 많도록
      const rand = Math.random();
      if (rand < 0.3) {
        status = 'pending';
      } else if (rand < 0.8) {
        status = 'approved';
      } else if (rand < 0.9) {
        status = 'rejected';
      } else {
        status = 'canceled';
      }
    }
    
    mockData.push({
      id: i,
      visitorName,
      visitorCompany,
      visitorContact: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      visitorEmail: `${visitorName.replace(/\s+/g, '')}@${visitorCompany.replace(/[()]/g, '').replace(/\s+/g, '')}.com`,
      visitPurpose: purposes[Math.floor(Math.random() * purposes.length)],
      visitDate: formattedDate,
      visitTime: formattedTime,
      status,
      employeeName: forMember ? '본인' : '홍길동',
      employeeDept: forMember ? '본인 부서' : 'IT부서',
      createdAt: new Date(currentDate.getTime() - Math.random() * 86400000 * 30).toISOString() // 최근 30일 내에 생성
    });
  }
  
  // 날짜 최신순 정렬
  return mockData.sort((a, b) => {
    const dateA = new Date(`${a.visitDate}T${a.visitTime}`);
    const dateB = new Date(`${b.visitDate}T${b.visitTime}`);
    return dateB - dateA;
  });
};

// 페이지네이션 처리를 위한 함수
export const paginateMockData = (data, page, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return data.slice(startIndex, endIndex);
}; 