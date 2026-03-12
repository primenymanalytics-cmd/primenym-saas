import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id') || '';
    const redirectUri = searchParams.get('redirect_uri') || '';
    const state = searchParams.get('state') || '';
    const scope = searchParams.get('scope') || '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authorize - Primenym</title>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 16px; }
        .card { background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px; width: 100%; padding: 32px; text-align: center; }
        .logo { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 24px; letter-spacing: -0.5px; }
        .shield { width: 56px; height: 56px; background: #eef2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .shield svg { width: 28px; height: 28px; color: #4f46e5; }
        h2 { font-size: 20px; color: #1e293b; margin-bottom: 8px; }
        .desc { font-size: 14px; color: #64748b; margin-bottom: 20px; }
        .desc strong { color: #1e293b; }
        .perms { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 16px; }
        .perms p { font-size: 13px; color: #64748b; margin-bottom: 8px; }
        .perms ul { padding-left: 20px; font-size: 13px; color: #475569; }
        .perms li { margin-bottom: 4px; }
        .user-info { font-size: 12px; color: #94a3b8; margin-bottom: 20px; }
        .user-info strong { color: #1e293b; }
        .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 16px; display: none; }
        .btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: all 0.2s; }
        .btn-primary { background: #4f46e5; color: white; }
        .btn-primary:hover { background: #4338ca; }
        .btn-primary:disabled { background: #a5b4fc; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #94a3b8; }
        .btn-ghost:hover { background: #f1f5f9; }
        .btn-google { background: white; border: 1px solid #e2e8f0; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-google:hover { background: #f8fafc; }
        input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 10px; outline: none; }
        input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        .divider { display: flex; align-items: center; margin: 14px 0; color: #94a3b8; font-size: 12px; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
        .divider::before { margin-right: 12px; }
        .divider::after { margin-left: 12px; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer { font-size: 11px; color: #94a3b8; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">Primenym</div>

        <!-- Loading State -->
        <div id="loading">
            <p style="color: #64748b; font-size: 14px;">Loading...</p>
        </div>

        <!-- Login Section -->
        <div id="login-section" style="display:none;">
            <div class="shield">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            </div>
            <h2>Sign In Required</h2>
            <p class="desc">Sign in to your <strong>Primenym</strong> account to authorize Looker Studio.</p>
            <div id="login-error" class="error"></div>
            <form onsubmit="signInWithEmail(event)">
                <input type="email" id="email" placeholder="Email address" required />
                <input type="password" id="password" placeholder="Password" required />
                <button type="submit" class="btn btn-primary" id="email-btn">Sign In</button>
            </form>
            <div class="divider">or</div>
            <button class="btn btn-google" onclick="signInWithGoogle()">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58Z"/></svg>
                Sign in with Google
            </button>
        </div>

        <!-- Authorize Section -->
        <div id="authorize-section" style="display:none;">
            <div class="shield">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
            </div>
            <h2>Authorize Access</h2>
            <p class="desc"><strong>Looker Studio</strong> wants to access your Primenym data sources.</p>
            <div id="auth-error" class="error"></div>
            <div class="perms">
                <p>This will allow Looker Studio to:</p>
                <ul>
                    <li>List your connected data sources</li>
                    <li>Fetch data from your sources for reports</li>
                </ul>
            </div>
            <p class="user-info">Signed in as <strong id="user-email"></strong></p>
            <button id="approve-btn" class="btn btn-primary" onclick="handleApprove()">Approve Access</button>
            <button class="btn btn-ghost" onclick="handleDeny()">Deny</button>
        </div>

        <p class="footer">Primenym &copy; ${new Date().getFullYear()}</p>
    </div>

    <script>
        var CLIENT_ID = ${JSON.stringify(clientId)};
        var REDIRECT_URI = ${JSON.stringify(redirectUri)};
        var STATE = ${JSON.stringify(state)};

        firebase.initializeApp({
            apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
            authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
            projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}"
        });

        var currentUser = null;

        firebase.auth().onAuthStateChanged(function(user) {
            document.getElementById('loading').style.display = 'none';
            if (user) {
                currentUser = user;
                document.getElementById('authorize-section').style.display = 'block';
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('user-email').textContent = user.email;
            } else {
                // Check if we are returning from a signInWithRedirect
                firebase.auth().getRedirectResult().then(function(result) {
                    if (result && result.user) {
                        // onAuthStateChanged will fire and handle the UI
                    } else {
                        document.getElementById('login-section').style.display = 'block';
                        document.getElementById('authorize-section').style.display = 'none';
                    }
                }).catch(function(err) {
                    document.getElementById('login-section').style.display = 'block';
                    document.getElementById('authorize-section').style.display = 'none';
                    document.getElementById('login-error').style.display = 'block';
                    document.getElementById('login-error').textContent = err.message;
                });
            }
        });

        function signInWithEmail(e) {
            e.preventDefault();
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            var btn = document.getElementById('email-btn');
            btn.disabled = true;
            btn.textContent = 'Signing in...';
            document.getElementById('login-error').style.display = 'none';

            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                document.getElementById('login-error').style.display = 'block';
                document.getElementById('login-error').textContent = error.message;
                btn.disabled = false;
                btn.textContent = 'Sign In';
            });
        }

        function signInWithGoogle() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).catch(function(error) {
                // If popup blocked, fall back to redirect
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                    firebase.auth().signInWithRedirect(provider);
                } else {
                    document.getElementById('login-error').style.display = 'block';
                    document.getElementById('login-error').textContent = error.message;
                }
            });
        }

        function handleApprove() {
            var btn = document.getElementById('approve-btn');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Approving...';
            document.getElementById('auth-error').style.display = 'none';

            currentUser.getIdToken().then(function(idToken) {
                return fetch('/api/oauth/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
                    body: JSON.stringify({ clientId: CLIENT_ID, redirectUri: REDIRECT_URI, state: STATE })
                });
            }).then(function(res) {
                return res.json().then(function(data) {
                    if (!res.ok) throw new Error(data.details ? (data.error + ': ' + data.details) : (data.error || 'Failed'));
                    return data;
                });
            }).then(function(data) {
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                }
            }).catch(function(err) {
                document.getElementById('auth-error').style.display = 'block';
                document.getElementById('auth-error').textContent = err.message;
                btn.disabled = false;
                btn.textContent = 'Approve Access';
            });
        }

        function handleDeny() {
            var url = new URL(REDIRECT_URI);
            url.searchParams.append('error', 'access_denied');
            if (STATE) url.searchParams.append('state', STATE);
            window.location.href = url.toString();
        }
    </script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
