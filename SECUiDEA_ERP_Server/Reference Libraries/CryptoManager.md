# CryptoManager 라이브러리 사용 설명서

## 개요

CryptoManager는 다양한 암호화 방식을 지원하는 .NET 라이브러리입니다. 현재 다음과 같은 구현체를 제공합니다.

- AES-256 암호화 (CBC 모드)
  - `AES256`: 기본 AES-256 구현체
  - `SecuAES256`: 향상된 AES-256 구현체
  - `SecuSHA256`: SHA-256 해시 함수
  - `EncryptionAES256_IV`: IV를 외부에서 주입하는 AES-256 구현체
  - `S1AES`: 기존 S1 암호화 DLL 사용한 AES-256 구현체
  - `S1SHA512`: 기존 S1 암호화 DLL 사용한 SHA-512 해시 함수

## 설치
라이브러리를 사용하기 위해 다음 네임스페이스를 프로젝트에 포함시킵니다:

```csharp
using CryptoManager;
using CryptoManager.Services;
```

## 핵심 인터페이스

라이브러리는 암호화/복호화를 위한 표준 메서드 세트를 제공하는 `ICryptoManager` 인터페이스를 구현합니다.

### 주요 메서드

- `Encrypt`: 평문을 암호화합니다.
- `Decrypt`: 암호문을 복호화합니다.

## 구현체 사용 예제

### 1. SecuAES256 사용 (AES256도 동일)

```csharp
ICryptoManager crypto = new SecuAES256("암호키");
string encrypted = crypto.Encrypt("Hello, World!");
string decrypted = crypto.Decrypt(encrypted);
```

### 3. SecuSHA256 사용

```csharp
ICryptoManager hasher = new SecuSHA256();
string hash = hasher.Encrypt("Hello, World!"); // Decrypt는 지원하지 않음
```

### 3. EncryptionAES256_IV 사용

```csharp
ICryptoManager crypto = new EncryptionAES256_IV("key", "iv");
string encrypted = crypto.Encrypt("Hello, World!");
string decrypted = crypto.Decrypt(encrypted);
```

## 구현체별 특징

### AES256
- 문자열 키 사용
- 키에서 IV 생성
- CBC 모드 사용
- PKCS7 패딩 사용
- 16진수 문자열 출력

### SecuAES256
- 문자열 키 사용
- 고정된 IV (0으로 초기화)
- CBC 모드 사용
- PKCS7 패딩 사용
- Base64 인코딩된 출력

### SecuSHA256
- 단방향 해시 함수
- 복호화 불가능
- 16진수 문자열 출력

### EncryptionAES256_IV
- 가장 안전한 구현체
- 키와 IV를 별도로 관리 가능
- CBC 모드 사용
- PKCS7 패딩 사용
- Base64 인코딩된 출력

## 성능 고려사항

- 해시 연산이 암호화/복호화보다 빠름
- Base64 인코딩이 16진수 인코딩보다 효율적

## 제한 사항

- 모든 구현체는 동기 방식으로 동작
- SHA-256은 복호화 불가능
- 크로스 플랫폼 사용 시 인코딩 주의 필요
- 키 길이는 256비트로 고정