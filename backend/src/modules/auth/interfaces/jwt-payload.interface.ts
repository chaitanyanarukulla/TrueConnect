export interface JwtPayload {
  sub: string; // user ID (original field)
  id?: string; // user ID (new field for backwards compatibility)
  iat?: number; // issued at
  exp?: number; // expiration time
  role?: string; // user role
}
