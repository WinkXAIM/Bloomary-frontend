const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /auth/kakao/callback 대응
 * 백엔드가 쿠키를 직접 설정하므로 프론트에서 저장 로직 불필요
 * 모든 API 호출 시 credentials: 'include' 사용
 */

/**
 * 로그인 상태 확인
 * HttpOnly 쿠키는 JS에서 읽기 불가하므로
 * 백엔드 API 호출로 로그인 상태 확인
 */
export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * POST /auth/logout 대응
 */
export const logout = async () => {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};

/**
 * POST /auth/refresh 대응
 */
export const refreshToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
};

/**
 * 공통 fetch 래퍼
 * 모든 API 호출 시 credentials: 'include' 자동 포함
 */
export const authFetch = (url, options = {}) => {
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: "include",
  });
};
