import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "../firebase-config.js";

class BlipNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.user = null;
        
        // Initialize Firebase if not already initialized
        if (getApps().length === 0) {
            initializeApp(firebaseConfig);
        }
        this.auth = getAuth();
        this.provider = new GoogleAuthProvider();
    }

    connectedCallback() {
        this.render();
        this.setupAuth();
    }

    setupAuth() {
        onAuthStateChanged(this.auth, (user) => {
            this.user = user;
            this.updateUI();
            
            // Dispatch event for other components to listen to
            this.dispatchEvent(new CustomEvent('auth-changed', {
                detail: { user },
                bubbles: true,
                composed: true
            }));
        });
    }

    async login() {
        try {
            await signInWithPopup(this.auth, this.provider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    logout() {
        signOut(this.auth);
    }

    updateUI() {
        const authActions = this.shadowRoot.querySelector('.auth-actions');
        if (!authActions) return;

        if (this.user) {
            authActions.innerHTML = `
                <div class="user-profile">
                    <img class="user-avatar" src="${this.user.photoURL || 'https://via.placeholder.com/32'}" alt="Avatar">
                    <span class="user-name">${this.user.displayName.split(' ')[0]}</span>
                    <button class="btn-logout">Logout</button>
                </div>
            `;
            authActions.querySelector('.btn-logout').onclick = () => this.logout();
        } else {
            authActions.innerHTML = `
                <button class="btn-login">Sign In</button>
            `;
            authActions.querySelector('.btn-login').onclick = () => this.login();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                --nav-height: 80px;
                --gold: oklch(80% 0.12 90);
                --ice: oklch(95% 0.01 260);
                --midnight: oklch(15% 0.02 260);
                --glass: rgba(15, 18, 25, 0.7);
                --border: rgba(255, 255, 255, 0.08);
                --accent: oklch(75% 0.2 240);
                position: fixed;
                top: 0; left: 0;
                z-index: 9999;
            }

            nav {
                height: var(--nav-height);
                background: var(--glass);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 40px;
                font-family: 'Outfit', 'Noto Sans KR', sans-serif;
            }

            .nav-logo {
                font-weight: 900;
                font-size: 1.4rem;
                letter-spacing: 3px;
                color: var(--ice);
                text-transform: uppercase;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: transform 0.3s ease;
            }
            
            .logo-mark {
                background: linear-gradient(135deg, var(--gold), var(--accent));
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .nav-links {
                display: flex;
                gap: 30px;
                list-style: none;
                margin: 0; padding: 0;
            }

            .nav-links a {
                color: var(--ice);
                text-decoration: none;
                font-size: 0.85rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                opacity: 0.7;
                transition: all 0.3s;
            }

            .nav-links a:hover {
                opacity: 1;
                color: var(--gold);
            }

            .auth-actions {
                display: flex;
                align-items: center;
            }

            .user-profile {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(255,255,255,0.05);
                padding: 6px 12px;
                border-radius: 50px;
                border: 1px solid var(--border);
            }

            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 1px solid var(--gold);
            }

            .user-name {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--ice);
            }

            .btn-login, .btn-logout {
                background: transparent;
                border: 1px solid var(--gold);
                color: var(--gold);
                padding: 8px 20px;
                border-radius: 5px;
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s;
            }

            .btn-login:hover {
                background: var(--gold);
                color: var(--midnight);
                box-shadow: 0 0 20px oklch(80% 0.12 90 / 0.3);
            }

            .btn-logout {
                border-color: rgba(255,255,255,0.2);
                color: rgba(255,255,255,0.5);
                padding: 5px 12px;
                font-size: 0.7rem;
            }

            .btn-logout:hover {
                border-color: var(--gold);
                color: var(--gold);
                background: rgba(197, 160, 89, 0.1);
            }

            @media (max-width: 768px) {
                .nav-links { display: none; }
                nav { padding: 0 20px; }
            }
        </style>
        <nav>
            <a href="index.html" class="nav-logo">
                <span class="logo-mark">⚡</span> BLIPZONES
            </a>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="index.html#playground">Playground</a></li>
                <li><a href="yokai.html">Yokai</a></li>
                <li><a href="about.html">About</a></li>
            </ul>
            <div class="auth-actions">
                <!-- Injected via JS -->
            </div>
        </nav>
        `;
        this.updateUI();
    }
}

customElements.define('blip-nav', BlipNav);
