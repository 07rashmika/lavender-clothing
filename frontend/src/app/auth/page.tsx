"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/home");
  };

  const handleSignup = async () => {
    if (!agree) { setError("Please agree to the Terms of Service."); return; }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess("Check your email to confirm your account.");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.brandName}>Lavender</div>
        <img
          src={tab === "login" ? "/lavender-signup-bg.png" : "/lavender-login-bg.png"}
          alt="Lavender fashion"
          style={styles.heroImg}
        />
        <div style={styles.imgOverlay} />
      </div>

      {/* Right Panel */}
      <div style={styles.right}>
        <div style={styles.tabsWrapper}>
          <button onClick={() => { setTab("login"); setError(null); setSuccess(null); }} className={tab === "login" ? "tab tab-active" : "tab tab-inactive"}>Login</button>
          <button onClick={() => { setTab("signup"); setError(null); setSuccess(null); }} className={tab === "signup" ? "tab tab-active" : "tab tab-inactive"}>Sign Up</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {tab === "login" && (
          <div style={styles.form}>
            <h1 style={styles.heading}>Welcome Back</h1>
            <p style={styles.subheading}>Please enter your details to sign in.</p>

            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>
              <input type="email" placeholder="hello@lavender.com" style={styles.input} className="lav-input"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>

            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input type={showLoginPass ? "text" : "password"} placeholder="••••••••" style={styles.input} className="lav-input"
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
              <span style={styles.eyeIcon} onClick={() => setShowLoginPass(!showLoginPass)}>{showLoginPass ? "🙈" : "👁"}</span>
            </div>

            <label style={styles.checkLabel}>
              <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} style={styles.checkbox} />
              Remember me for 30 days
            </label>

            <button style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }} className="lav-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in…" : "Login to Account"}
            </button>

            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>OR CONTINUE WITH</span>
              <div style={styles.dividerLine} />
            </div>

            <button style={styles.googleBtn} className="lav-google" onClick={handleGoogleSignIn}><GoogleIcon />Sign in with Google</button>
          </div>
        )}

        {tab === "signup" && (
          <div style={styles.form}>
            <h1 style={styles.heading}>Create Account</h1>
            <p style={styles.subheading}>Join our community for exclusive early access.</p>

            <button style={styles.googleBtn} className="lav-google" onClick={handleGoogleSignIn}><GoogleIcon />Sign up with Google</button>

            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>OR CONTINUE WITH EMAIL</span>
              <div style={styles.dividerLine} />
            </div>

            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>👤</span>
              <input type="text" placeholder="Elowen Lavender" style={styles.input} className="lav-input"
                value={signupName} onChange={e => setSignupName(e.target.value)} />
            </div>

            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>
              <input type="email" placeholder="hello@lavender.com" style={styles.input} className="lav-input"
                value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
            </div>

            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input type={showSignupPass ? "text" : "password"} placeholder="••••••••" style={styles.input} className="lav-input"
                value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignup()} />
              <span style={styles.eyeIcon} onClick={() => setShowSignupPass(!showSignupPass)}>{showSignupPass ? "🙈" : "👁"}</span>
            </div>

            <label style={styles.checkLabel}>
              <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} style={styles.checkbox} />
              I agree to the <span style={styles.link}>Terms of Service</span> and <span style={styles.link}>Privacy Policy</span>.
            </label>

            <button style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }} className="lav-btn" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p style={styles.loginLink}>
              Already have an account?{" "}
              <span style={styles.link} onClick={() => { setTab("login"); setError(null); setSuccess(null); }}>Log In</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" style={{ marginRight: 10 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.174 0 7.548 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    backgroundColor: "#fdf8f8",
  },
  left: {
    position: "relative",
    width: "45%",
    height: "100vh",
    overflow: "hidden",
    flexShrink: 0,
  },
  brandName: {
    position: "absolute", top: 28, left: 32, zIndex: 10,
    color: "#fff", fontSize: 24, fontWeight: 700,
    fontFamily: "'Georgia',serif", letterSpacing: 1,
  },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" },
  imgOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom,rgba(80,40,100,0.18) 0%,rgba(60,20,80,0.32) 100%)",
  },
  right: {
    flex: 1,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 60px",
    backgroundColor: "#fdf8f8",
    overflow: "hidden",
  },
  tabsWrapper: {
    display: "flex", width: "100%", maxWidth: 460,
    marginBottom: 8, borderBottom: "1.5px solid #e8dce8",
  },
  errorBox: {
    width: "100%", maxWidth: 460, marginBottom: 10,
    padding: "10px 16px", borderRadius: 8,
    background: "#fde8ec", color: "#c0395a",
    fontSize: 13.5, fontWeight: 500,
  },
  successBox: {
    width: "100%", maxWidth: 460, marginBottom: 10,
    padding: "10px 16px", borderRadius: 8,
    background: "#e8f5e9", color: "#2e7d32",
    fontSize: 13.5, fontWeight: 500,
  },
  form: { width: "100%", maxWidth: 460, display: "flex", flexDirection: "column" },
  heading: {
    fontSize: 30, fontWeight: 700, color: "#2d1a3a",
    margin: "0 0 6px 0", fontFamily: "'Georgia',serif",
  },
  subheading: { fontSize: 14, color: "#888", margin: "0 0 14px 0", lineHeight: 1.4 },
  label: {
    fontSize: 13.5, fontWeight: 500, color: "#2d1a3a",
    marginBottom: 6, marginTop: 10, display: "block",
  },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 16, fontSize: 15, color: "#b0a0b8", pointerEvents: "none" },
  input: {
    width: "100%", padding: "12px 42px 12px 44px",
    borderRadius: 10, border: "1.5px solid #e8dce8",
    backgroundColor: "#fdf3f6", fontSize: 14.5, color: "#2d1a3a",
    outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif",
  },
  eyeIcon: { position: "absolute", right: 16, fontSize: 15, cursor: "pointer", color: "#b0a0b8" },
  checkLabel: {
    display: "flex", alignItems: "center", gap: 9, fontSize: 13,
    color: "#555", cursor: "pointer", marginTop: 10, marginBottom: 0,
  },
  checkbox: { accentColor: "#c0395a", width: 16, height: 16, cursor: "pointer" },
  primaryBtn: {
    marginTop: 16, width: "100%", padding: "14px 0", borderRadius: 50,
    background: "linear-gradient(135deg,#c0395a 0%,#a02848 100%)",
    color: "#fff", fontSize: 15.5, fontWeight: 600, border: "none",
    cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: 0.3,
  },
  dividerRow: { display: "flex", alignItems: "center", gap: 12, margin: "16px 0" },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e8dce8" },
  dividerText: { fontSize: 12, color: "#aaa", whiteSpace: "nowrap", letterSpacing: 0.5 },
  googleBtn: {
    width: "100%", padding: "12px 0", borderRadius: 10,
    border: "1.5px solid #e8dce8", backgroundColor: "#fff",
    fontSize: 14.5, fontWeight: 500, color: "#2d1a3a", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter',sans-serif",
  },
  link: { color: "#c0395a", cursor: "pointer", fontWeight: 500, textDecoration: "underline" },
  loginLink: { textAlign: "center", fontSize: 13, color: "#666", marginTop: 14 },
};

const css = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow: hidden; }
  .tab { flex: 1; background: none; border: none; border-bottom: 2px solid transparent; padding-bottom: 12px; font-size: 16px; cursor: pointer; font-family: 'Inter',sans-serif; transition: color 0.2s; }
  .tab-active { color: #c0395a; border-bottom-color: #c0395a; font-weight: 600; }
  .tab-inactive { color: #888; font-weight: 400; }
  .lav-input:focus { border-color: #c0395a !important; background: #fff !important; }
  .lav-btn:hover { opacity: 0.88; }
  .lav-google:hover { background: #fdf3f6 !important; }
`;
