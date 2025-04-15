# CoreDAL 라이브러리 사용 설명서

## 개요

CoreDAL은 다중 데이터베이스 환경을 위한 확장 가능한 데이터 액세스 계층을 제공하는 .NET 라이브러리입니다.

### 주요 특징

- **확장 가능한 데이터베이스 지원**: 인터페이스 기반 설계로 새로운 데이터베이스 종류를 쉽게 추가 가능
- **다중 데이터베이스 관리**: 여러 데이터베이스의 연결 정보를 동시에 관리
- **통합된 인터페이스**: 데이터베이스 종류에 관계없이 일관된 방식으로 접근
- **보안성**: 연결 정보 암호화 지원
- **비동기 지원**: 모든 데이터베이스 작업에 대한 비동기 처리

## 설치

라이브러리를 사용하기 위해 다음 네임스페이스를 **필요에 따라** 프로젝트에 포함시킵니다.

```csharp
using CoreDAL.Configuration;
using CoreDAL.Configuration.Interface;
using CoreDAL.Configuration.Models;
using CoreDAL.DALs.Interface;
using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;
```
## 핵심 인터페이스

### IDbConnectionInfo

데이터베이스 연결 정보를 정의하는 Model에 대한 인터페이스입니다. 데이터베이스 종류에 따라 구현체를 제공합니다. (예: MsSqlConnectionInfo, OracleConnectionInfo)

주요 메서드와 프로퍼티:
- `DbType`: 데이터베이스 종류
- `ToConnectionString`: 연결 문자열 생성
- `Validate`: 연결 정보 유효성 검사
- `ToSettings`: 설정 파일 저장을 위한 정보 반환

### IDatabaseSetup

데이터베이스 설정의 기본 인터페이스입니다. 데이터베이스 종류와 해당하는 데이터 엑세스 계층, 저장 위치에서 사용될 연결 정보를 관리합니다. (INI 파일, 레지스트리 등...)

주요 메서드와 프로퍼티:
- `DatabaseType`: 데이터베이스 종류
- `DAL`: 데이터 액세스 계층
- `GetConnectionString`: 연결 문자열 반환
- `GetConnectionInfo`: 연결 정보 반환
- `UpdateConnectionInfo`: 연결 정보 업데이트

### ICoreDAL

데이터베이스 작업을 위한 핵심 인터페이스입니다. 프로시저 실행, 연결 테스트 등의 메서드를 제공합니다.

주요 메서드:
- `TestConnectionAsync`: 연결 테스트
- `ExecuteProcedureAsync`: 프로시저 실행 (비동기)
- `ExecuteProcedure`: 프로시저 실행 (동기)

## 주요 컴포넌트 설명

### DatabaseSetup

- 데이터베이스 연결 설정의 중앙 관리 (읽기, 쓰기, 엑세스 계층 제공 등)
- 연결 문자열 생성
- 설정 파일과의 상호작용
- 암호화/복호화 처리

### DatabaseSetupContainer

- 여러 DatabaseSetup 인스턴스 관리
- 섹션별 데이터베이스 설정 관리
- 통합된 설정 업데이트 인터페이스 제공

### DbConnectionInfo 구현체

- 각 데이터베이스별 특화된 설정 지원
- MsSqlConnectionInfo: MSSQL 연결 정보
- OracleConnectionInfo: Oracle 연결 정보

### CoreDAL 구현체

- 각 데이터베이스별 최적화된 처리 제공
- SqlServerDAL: MSSQL 데이터 액세스
- OracleDAL: Oracle 데이터 액세스

### SQLParam

- 저장 프로시저 파라미터 객체의 기본 클래스
- 파라미터 속성 정의

### SQLResult

- 저장 프로시저 실행 결과 캡슐화
- DataSet, 성공 여부, 메시지, 반환 값 포함

## 기본 사용법

### 1. 데이터베이스 설정 관리

#### 1-1. 단일 데이터베이스 설정 (DatabaseSetup)

```csharp
// IIOHelper 인스턴스 생성
IIOHelper ioHelper = new IniFileHelper("파일경로/settings.ini");

// 선택적 암호화 관리자 설정
ICryptoManager cryptoManager = new AES256(key);

// DatabaseSetup 인스턴스 생성
var dbSetup = new DatabaseSetup(
    DatabaseType.MSSQL, 
    ioHelper, 
    "S1ACCESS", 
    cryptoManager // 없는 경우 암호화 미사용
);
```

#### 1-2. 다중 데이터베이스 설정 (DatabaseSetupContainer)

```csharp
var setupFiles = new Dictionary<string, (DatabaseType dbType, IIOHelper ioHelper)>
{
    ["MainDB"] = (DatabaseType.MSSQL, new IniFileHelper("main.ini")),
    ["ReportDB"] = (DatabaseType.ORACLE, new IniFileHelper("report.ini")),
    ["ArchiveDB"] = (DatabaseType.MSSQL, new IniFileHelper("main.ini"))
};

var container = new DatabaseSetupContainer(setupFiles, cryptoManager); // 모든 DatabaseSetup에서 동일한 암호화 사용

var dbSetup = container.GetSetup("MainDB"); // MainDB DatabaseSetup 가져오기
```

### 2. 연결 정보 구성

#### 2-1. MSSQL 연결

```csharp
var mssqlInfo = new MsSqlConnectionInfo
{
    Server = "localhost",
    Database = "MyDatabase",
    UserId = "sa",
    Password = "password",
    IntegratedSecurity = false,
    Port = 1433
};

dbSetup.UpdateConnectionInfo(mssqlInfo); // DatabaseSetup을 통해 파일에 연결정보 업데이트
```

#### 2-2. Oracle 연결

```csharp
var oracleInfo = new OracleConnectionInfo
{
    Host = "localhost",
    Port = 1521,
    ServiceName = "ORCL",
    UserId = "system",
    Password = "password",
    Protocol = "TCP"
};

dbSetup.UpdateConnectionInfo(oracleInfo); // DatabaseSetup을 통해 파일에 연결정보 업데이트
```

## ORM 기능

### DbParameterAttribute

파라미터 속성을 정의하는 애트리뷰트입니다. 해당 애트리뷰트를 사용하지 않는 경우, 파라미터로 인식되지 않습니다.

파라미터명과 프로시저명이 동일한 경우 이름 매개변수를 생략 가능합니다.

```csharp
[DbParameter(name: "ParamName")] // 파라미터명과 프로시저명이 동일한 경우 이름 부분 생략 가능
```

### SQLParam

사용자 정의 파라미터 객체의 기본 클래스입니다. 저장 프로시저의 파라미터를 객체 지향적으로 관리합니다.

```csharp
public class UserParams : SQLParam
{
    public NoParam { get; set; } // 파라미터로 사용하지 않는 경우 Attribute 생략 (Attribute를 사용하지 않으면 파라미터로 인식하지 않음)
    
    [DbParameter] // 파라미터명과 프로시저명이 동일한 경우 이름 부분 생략 가능
    public int UserId { get; set; }

    [DbParameter("UserName")] // 파라미터명과 프로시저명이 다른 경우 이름 부분 필수
    public string Name { get; set; }
}
```

### SQLResult

저장 프로시저 실행 결과를 캡슐화합니다. 대부분의 프로시저 실행 메서드는 이 객체를 반환합니다.

```csharp
public class SQLResult
{
    public DataSet DataSet { get; set; } // 결과 데이터
    public bool IsSuccess { get; set; }
    public string Message { get; set; }
    public int ReturnValue { get; set; } // 프로시저 반환 값
}
```

## 데이터 액세스 예제

### 1. 기본 프로시저 실행

```csharp
var dbSetup = container.GetSetup("MainDB");
var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, "ProcedureName");

if (result.IsSuccess)
{
    var dataTable = result.DataSet.Tables[0];
    // 데이터 처리...
}
```

### 2. 파라미터를 사용한 프로시저 실행

```csharp
var parameters = new Dictionary<string, object>
{
    { "UserId", 1 },
    { "Status", "Active" }
};

var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, "uspGetUserDetails", parameters);
```

### 3. ORM 스타일 파라미터 사용

```csharp
var userParams = new UserParams // Model은 SQLParam을 상속받아서 미리 정의
{
    UserId = 1,
    Name = "John Doe"
};

var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, "uspUpdateUser", userParams);

// Output 파라미터 값 확인
int status = userParams.Status;
```

## 확장 메서드

CoreDAL은 `DataTable`과 `DataRow`를 .NET 객체로 변환하는 확장 메서드를 제공합니다. 이를 통해 데이터베이스 결과를 쉽게 객체로 변환할 수 있습니다.

### ToObject<T> 확장 메서드

```csharp
public class User
{
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

// DataTable을 객체 컬렉션으로 변환
var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, "uspGetUsers");
var users = result.DataSet.Tables[0].ToObject<User>();

// 단일 DataRow를 객체로 변환
var firstUser = result.DataSet.Tables[0].Rows[0].ToObject<User>();
```

## ※ 새로운 데이터베이스 타입 추가

새로운 데이터베이스 지원을 위해 다음 컴포넌트들을 구현해야 합니다.

1. `DatabaseType` enum에 새 타입 추가
2. `IDbConnectionInfo` 구현
3. `DbConnectionFactory`에 새로운 데이터베이스 타입 추가
4. `ICoreDAL` 구현
5. `DbDALFactory`에 새로운 데이터베이스 타입 추가
6. `IDbParameterHandler` 구현
7. `DatabaseParameterProcessor`의 `CreateParameterHandler()`에 새로운 데이터베이스 타입 추가

## 제한사항

- 현재 MSSQL과 Oracle만 기본 지원
- 저장 프로시저만 지원

---

# CoreDAL 변경 이력

### v1.1.0 beta (2024-12-20)

- 기능 변경:
    - DbParameterAttribute 사용 간략화
    - SQLParam 및 Dictionary 전달시 프로시저에서 파라미터를 찾아 자동으로 매핑
- 제한 사항:
    - Oracle 데이터베이스 기능 추가 예정

### v1.0.8 (2024-12-19)

- 버그 수정: MSSQL 테이블 건너뛰기 오류 수정

### v1.0.0 (2024-12-18)

- 첫 정식 릴리즈
