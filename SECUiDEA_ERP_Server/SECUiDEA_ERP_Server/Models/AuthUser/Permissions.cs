namespace SECUiDEA_ERP_Server.Models.AuthUser;

public enum PermissionLevel
{
    None = 0,
    Read = 1,
    Modify = 2,
    Write = 3,
}

public enum UserRole
{
    Guest = 0,
    Member = 1,
    Admin = 2,
    SuperAdmin = 3,
}

public enum S1AuthType
{
    Guest = 0,
    Cooperation = 1,
    Employee = 2,
    Admin = 3
}