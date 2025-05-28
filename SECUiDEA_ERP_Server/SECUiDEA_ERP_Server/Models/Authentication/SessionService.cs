using System.Collections.Concurrent;
using System.Data;
using CoreDAL.Configuration.Interface;
using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;
using Microsoft.Extensions.Caching.Memory;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Authentication;

public class SessionService : IDisposable
{
    #region 의존 주입

    private readonly JwtService _jwtService;
    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly UserRepositoryFactory _userRepositoryFactory;

    #endregion

    #region 세션 관리 Cache

    private readonly IMemoryCache _cache;
    private static readonly ConcurrentDictionary<string, string> _activeSessionCache = new();
    private readonly TimeSpan _sessionCacheExpiry = TimeSpan.FromMinutes(5);

    private const string SessionCacheKeyPrefix = "session_";
    private const string UserSessionKeyPrefix = "user_session_";

    private readonly Timer _cacheCleanupTimer;

    #endregion

    public SessionService(JwtService jwtService, IDatabaseSetupContainer dbContainer, IMemoryCache cache, UserRepositoryFactory userRepositoryFactory)
    {
        #region 의존 주입

        _jwtService = jwtService;
        _dbContainer = dbContainer;
        _cache = cache;
        _userRepositoryFactory = userRepositoryFactory;

        #endregion

#if DEBUG
        // 개발 모드에서는 1분마다 캐시 정리
        _cacheCleanupTimer = new Timer(CleanupCacheCallback, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
#else
        _cacheCleanupTimer = new Timer(CleanupCacheCallback, null, TimeSpan.Zero, TimeSpan.FromHours(1));
#endif

    }

    private string GetUserKey(string userId, string provider)
    {
        return $"{provider}_{userId}";
    }

    private string GetUserSessionKey(string userId, string provider)
    {
        return $"{UserSessionKeyPrefix}{GetUserKey(userId, provider)}";
    }

    private string GetSessionCacheKey(string sessionId)
    {
        return $"{SessionCacheKeyPrefix}{sessionId}";
    }

    /// <summary>
    /// 세션 생성 - 로그인 성공 후 호출
    /// </summary>
    /// <param name="provider"><see cref="Providers"/> 참조</param>
    /// <param name="userId"></param>
    /// <param name="ipAddress"></param>
    /// <param name="rememberMe"></param>
    /// <returns></returns>
    public async Task<string> CreateSessionAsync(string provider, string userId, string ipAddress, bool rememberMe = false)
    {
        string sessionId = Guid.NewGuid().ToString();
        string userKey = GetUserKey(userId, provider);
        string userSessionKey = GetUserSessionKey(userId, provider);

        // DB에 세션 정보 저장
        await SaveSessionAsync(new UserSession
        {
            Provider = provider,
            UserId = userId,
            SessionId = sessionId,
            IpAddress = ipAddress,
            CreatedAt = DateTime.Now,
            LastActivityAt = DateTime.Now,
            IsActive = true,
            ExpiryDate = rememberMe
                ? DateTime.Now.AddDays(_jwtService.GetSettings.AutoLoginDays)
                : DateTime.Now.AddDays(_jwtService.GetSettings.RefreshTokenDays),
        });

        // 중복 로그인 방지 설정이 활성화 된 경우
        if (_jwtService.GetSettings.PreventDuplicateLogin)
        {
            await DeactivateOtherSessionAsync(userId, sessionId, "New Login");
        }

        // 캐시에 최신 세션 ID 저장
        _activeSessionCache.AddOrUpdate(userKey, sessionId, (key, oldValue) => sessionId);
        _cache.Set(userSessionKey, sessionId, _sessionCacheExpiry);

        return sessionId;
    }

    /// <summary>
    /// 세션 유효성 검증
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="sessionId"></param>
    /// <returns></returns>
    public async Task<bool> ValidateSessionAsync(string userId, string provider, string sessionId)
    {
        string userKey = GetUserKey(userId, provider);
        string userSessionKey = GetUserSessionKey(userId, provider);

        // 캐시 확인
        if (_activeSessionCache.TryGetValue(userKey, out var activeCachedSessionId))
        {
            return (activeCachedSessionId == sessionId);
        }

        if (_cache.TryGetValue(userSessionKey, out string cachedSessionId))
        {
            _activeSessionCache.TryAdd(userKey, cachedSessionId);
            return (cachedSessionId == sessionId);
        }

        // DB 확인
        var latestSession = await GetLatestSessionAsync(provider, userId);
        if (latestSession == null || latestSession.SessionId != sessionId)
        {
            return false;
        }

        // 캐시 업데이트
        _activeSessionCache.AddOrUpdate(userKey, latestSession.SessionId, (key, oldValue) => latestSession.SessionId);
        _cache.Set(userSessionKey, latestSession.SessionId, _sessionCacheExpiry);

        return (sessionId == latestSession.SessionId);
    }

    /// <summary>
    /// 세션 활성 상태 업데이트 (요청 처리시마다)
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="provider"></param>
    /// <param name="sessionId"></param>
    /// <returns></returns>
    public async Task UpdateSessionActivityAsync(string userId, string provider, string sessionId)
    {
        // 세션 타임아웃이 설정되지 않은 경우 무시
        if (!_jwtService.GetSettings.InactivityTimeout)
            return;

        string sessionCacheKey = GetSessionCacheKey(sessionId);

        // 캐시에서 세션 찾기
        if (!_cache.TryGetValue(sessionCacheKey, out UserSession session))
        {
            // DB에서 세션 조회
            session = await GetSessionByIdAsync(sessionId);
            if (session == null)
                return;

            // 캐시에 세션 저장
            _cache.Set(sessionCacheKey, session, _sessionCacheExpiry);
        }

        // 마지막 Activity 시간 업데이트
        session.LastActivityAt = DateTime.Now;

        // DB의 세션 업데이트
        _ = Task.Run(async () =>
        {
            await UpdateSessionAsync(session);
        });
    }

    /// <summary>
    /// 세션 비활성화 (로그아웃 등으로 호출)
    /// </summary>
    /// <param name="sessionId"></param>
    /// <param name="reason"></param>
    /// <returns></returns>
    public async Task DeactivateSessionAsync(string sessionId, string reason = "Logout")
    {
        var session = await GetSessionByIdAsync(sessionId);
        if (session == null || !session.IsActive)
            return;

        session.IsActive = false;
        session.DeactivatedAt = DateTime.Now;
        session.DeactivatedReason = reason;

        // DB 업데이트
        await UpdateSessionAsync(session);

        // 캐시에서 세션 삭제
        string sessionCacheKey = GetSessionCacheKey(sessionId);
        string userKey = GetUserKey(session.UserId, session.Provider);
        
        string userSessionKey = GetUserSessionKey(session.UserId, session.Provider);

        _cache.Remove(sessionCacheKey);
        _activeSessionCache.TryRemove(userKey, out _);
        _cache.Remove(userSessionKey);
    }

    /// <summary>
    /// 다른 세션 비활성화 (중복 로그인 방지 등...)
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="currentSessionId"></param>
    /// <param name="reason"></param>
    /// <returns></returns>
    private async Task DeactivateOtherSessionAsync(string userId, string currentSessionId, string reason)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var parameters = new UserSession
        {
            UserId = userId,
            CurrentSessionId = currentSessionId,
            DeactivatedReason = reason
        };

        await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.DeactivateOthers, parameters);
    }
    
    /// <summary>
    /// 비활성 세션 확인
    /// </summary>
    /// <param name="sessionId"></param>
    /// <returns></returns>
    public async Task<bool> IsSessionInactiveAsync(string sessionId)
    {
        // 세션 타임아웃이 설정되지 않은 경우 무시
        if (!_jwtService.GetSettings.InactivityTimeout)
            return false;

        var session = await GetSessionByIdAsync(sessionId);
        if (session == null || !session.IsActive)
            return true;

        // 사용자의 세션 설정 가져오기
        var user = await GetUserByIdAsync(session.UserId, session.Provider);
        if (user == null)
        {
            return true;
        }

        if (!user.EnableSessionTimeout)
        {
            return false; // 세션 타임아웃 비활성화
        }

        // 마지막 활동 시간 확인
        var inactiveTime = DateTime.Now - session.LastActivityAt;
        var timeoutMinutes = user.SessionTimeoutMinutes == 0 ? _jwtService.GetSettings.InactivityTimeoutMinutes : user.SessionTimeoutMinutes;

        return (inactiveTime.TotalMinutes > timeoutMinutes);
    }

    /// <summary>
    /// 세션 ID로 세션 정보 조회
    /// </summary>
    /// <param name="sessionId"></param>
    /// <returns></returns>
    private async Task<UserSession> GetSessionByIdAsync(string sessionId)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var parameters = new UserSession
        {
            SessionId = sessionId
        };

        SQLResult result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.GetById, parameters);

        if (result.IsSuccess)
        {
            DataRow row = result.DataSet.Tables[0].Rows[0];
            var userSession = row.ToObject<UserSession>();
            return userSession;
        }

        return null;
    }

    /// <summary>
    /// 사용자 ID로 최신 세션 정보 조회
    /// </summary>
    /// <param name="provider"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    private async Task<UserSession> GetLatestSessionAsync(string provider, string userId)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var parameters = new UserSession
        {
            Provider = provider,
            UserId = userId
        };

        var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.GetLatest, parameters);

        if (result.IsSuccess)
        {
            DataRow row = result.DataSet.Tables[0].Rows[0];
            var userSession = row.ToObject<UserSession>();
            return userSession;
        }

        return null;
    }

    /// <summary>
    /// 세션 저장
    /// </summary>
    /// <param name="session"></param>
    /// <returns></returns>
    private async Task SaveSessionAsync(UserSession session)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var parameters = new UserSession 
        {
            Provider = session.Provider,
            UserId = session.UserId,
            SessionId = session.SessionId,
            IpAddress = session.IpAddress,
            CreatedAt = session.CreatedAt,
            LastActivityAt = session.LastActivityAt,
            IsActive = session.IsActive,
            ExpiryDate = session.ExpiryDate
        };

        await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.Insert, parameters);
    }

    /// <summary>
    /// 세션 업데이트
    /// </summary>
    /// <param name="session"></param>
    /// <returns></returns>
    private async Task UpdateSessionAsync(UserSession session)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var parameters = new UserSession
        {
            SessionId = session.SessionId,
            LastActivityAt = session.LastActivityAt,
            IsActive = session.IsActive,
            DeactivatedAt = session.DeactivatedAt,
            DeactivatedReason = session.DeactivatedReason
        };

        await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.Update, parameters);
    }

    private async Task<User> GetUserByIdAsync(string userId, string provider)
    {
        var repository = _userRepositoryFactory.GetRepository(provider);
        return await repository.GetUserModelByIdAsync(userId);
    }

    #region Cache 관리

    public async Task CleanupExpiredSessionsAsync()
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.CleanupExpired);
    }

    private void CleanupCacheCallback(object state)
    {
        _ = Task.Run(async () => // 비동기 정리 작업
        {
            try
            {
                await CleanupCacheAsync();
            }
            catch (Exception ex)
            {
                // 예외 처리 로직 필요
            }
        });
    }

    private async Task CleanupCacheAsync()
    {
        try
        {
            var activeSessions = await GetActiveSessionsAsync();
            var validKeys = new HashSet<string>();

            foreach (var session in activeSessions) // DB에서 유효한 세션 모두 가져오기
            {
                var userKey = GetUserKey(session.UserId, session.Provider);
                validKeys.Add(userKey);
            }

            foreach (var key in _activeSessionCache.Keys)
            {
                if (!validKeys.Contains(key)) // DB에 존재하지 않는 세션 지우기
                {
                    _activeSessionCache.TryRemove(key, out _);
                }
            }

            await CleanupExpiredSessionsAsync(); // 만료된 세션 DB에서 정리(삭제)
        }
        catch (Exception e)
        {
        }
    }

    /// <summary>
    /// DB에서 유효한(활성) 세션 모두 가져오기
    /// </summary>
    /// <returns></returns>
    private async Task<List<UserSession>> GetActiveSessionsAsync()
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);
        var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, SessionProcedure.GetActives);

        if (result.IsSuccess && result.DataSet?.Tables.Count > 0)
        {
            List<UserSession>? sessions = result.DataSet.Tables[0].ToObject<UserSession>() as List<UserSession>;
            return sessions ?? new List<UserSession>();
        }

        return new List<UserSession>();
    }

    public void Dispose()
    {
        _cacheCleanupTimer?.Dispose();
    }

    #endregion
}