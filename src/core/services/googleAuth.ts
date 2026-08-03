/**
 * Google Identity Services (GIS) – Client-side OAuth wrapper
 * Docs: https://developers.google.com/identity/oauth2/web/reference/js-reference
 *
 * Sử dụng OAuth2 Token Client + popup flow → không cần backend.
 * Luồng: popup Google → access_token → gọi userinfo endpoint → nhận thông tin user.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GoogleUserInfo {
  /** Google unique user ID (stable, không đổi dù user đổi email) */
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

// ─── Script Loader ────────────────────────────────────────────────────────────

let scriptLoadPromise: Promise<void> | null = null;

function loadGISScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Đã load rồi
    if (typeof window !== 'undefined' && (window as any).google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null; // Cho phép retry
      reject(new Error('Không tải được Google Identity Services. Kiểm tra kết nối mạng.'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

// ─── Core Sign-In ──────────────────────────────────────────────────────────────

/**
 * Mở popup đăng nhập Google và trả về thông tin người dùng.
 *
 * @param clientId - Google OAuth Client ID (từ Google Cloud Console)
 *                   Cấu hình tại: https://console.cloud.google.com/apis/credentials
 *
 * Nếu `clientId` là chuỗi rỗng hoặc placeholder, ném lỗi hướng dẫn setup.
 */
export async function signInWithGoogle(clientId: string): Promise<GoogleUserInfo> {
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
    throw new Error(
      'Google Client ID chưa được cấu hình.\n' +
      'Vui lòng tạo OAuth Client ID tại Google Cloud Console và thêm vào biến môi trường VITE_GOOGLE_CLIENT_ID.'
    );
  }

  await loadGISScript();

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services chưa sẵn sàng. Vui lòng thử lại.');
  }

  return new Promise<GoogleUserInfo>((resolve, reject) => {
    let settled = false;

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    // Timeout 2 phút
    const timeoutId = setTimeout(() => {
      settle(() => reject(new Error('Hết thời gian chờ đăng nhập Google. Vui lòng thử lại.')));
    }, 120_000);

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse: any) => {
        clearTimeout(timeoutId);

        if (tokenResponse.error) {
          settle(() => {
            if (tokenResponse.error === 'access_denied') {
              reject(new Error('Bạn đã hủy đăng nhập Google.'));
            } else {
              reject(new Error(`Đăng nhập Google thất bại: ${tokenResponse.error}`));
            }
          });
          return;
        }

        try {
          // Lấy thông tin user từ Google userinfo endpoint
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });

          if (!res.ok) {
            throw new Error(`Google API lỗi: ${res.status}`);
          }

          const info = await res.json();
          settle(() =>
            resolve({
              sub: info.sub,
              email: info.email || '',
              name: info.name || info.given_name || info.email || 'Người dùng Google',
              picture: info.picture,
              email_verified: info.email_verified,
            })
          );
        } catch (err: any) {
          settle(() =>
            reject(new Error(err.message || 'Không thể lấy thông tin tài khoản từ Google.'))
          );
        }
      },
      error_callback: (err: any) => {
        clearTimeout(timeoutId);
        settle(() => {
          if (err?.type === 'popup_closed') {
            reject(new Error('Bạn đã đóng cửa sổ đăng nhập Google.'));
          } else {
            reject(new Error('Đăng nhập Google thất bại. Vui lòng thử lại.'));
          }
        });
      },
    });

    // Mở popup
    client.requestAccessToken({ prompt: 'select_account' });
  });
}

// ─── Config Helper ─────────────────────────────────────────────────────────────

/** Lấy Google Client ID từ biến môi trường Vite */
export function getGoogleClientId(): string {
  return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
}

/** Kiểm tra xem Google OAuth có được cấu hình không */
export function isGoogleAuthConfigured(): boolean {
  const id = getGoogleClientId();
  return Boolean(id && id !== 'YOUR_GOOGLE_CLIENT_ID');
}
