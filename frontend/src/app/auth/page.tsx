"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { syncUserWithBackend } from "@/context/AuthContext";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (password.length === 0) return { score: 0, label: "", color: "#e8dce8" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "#e05252" };
  if (score <= 3) return { score: 2, label: "Fair", color: "#e0a040" };
  return { score: 3, label: "Strong", color: "#4caf7d" };
}

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [remember, setRemember] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agree, setAgree] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const strength = useMemo(() => getPasswordStrength(signupPassword), [signupPassword]);

  const switchTab = (t: string) => { setTab(t); setError(null); };

  const handleLogin = async () => {
    if (!loginEmail.trim()) { setError("Please enter your email address."); return; }
    if (!loginPassword) { setError("Please enter your password."); return; }
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (data.session) await syncUserWithBackend(data.session.access_token);
    router.push("/home");
  };

  const handleSignup = async () => {
    if (!signupName.trim()) { setError("Please enter your full name."); return; }
    if (!signupEmail.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) { setError("Please enter a valid email address."); return; }
    if (signupPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (signupPassword !== signupConfirm) { setError("Passwords do not match."); return; }
    if (!agree) { setError("Please agree to the Terms of Service."); return; }
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { full_name: signupName } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }

    // identities is empty when the email already exists in Supabase
    if (!data.user?.identities?.length) {
      setError("An account with this email already exists. Please log in.");
      return;
    }

    // session is null when email confirmation is still required
    if (!data.session) {
      setError("Almost there! Check your inbox and confirm your email to activate your account.");
      return;
    }

    await syncUserWithBackend(data.session.access_token);
    router.push("/home");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <div style={s.page}>
      <style>{css}</style>

      <div style={s.left}>
        <div style={s.brandName}>Lavender</div>
        <Image
          src={tab === "login" ? "/lavender-signup-bg.png" : "/lavender-login-bg.png"}
          alt="Lavender fashion"
          fill
          priority
          sizes="45vw"
          style={s.heroImg}
        />
        <div style={s.imgOverlay} />
      </div>

      <div style={s.right}>
        <div style={s.scroll} className="lav-scroll">
          <div style={s.tabsWrapper}>
            <button onClick={() => switchTab("login")} className={tab === "login" ? "tab tab-active" : "tab tab-inactive"}>Login</button>
            <button onClick={() => switchTab("signup")} className={tab === "signup" ? "tab tab-active" : "tab tab-inactive"}>Sign Up</button>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          {tab === "login" && (
            <div style={s.form}>
              <h1 style={s.heading}>Welcome Back</h1>
              <p style={s.subheading}>Please enter your details to sign in.</p>

              <label style={s.label}>Email Address</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>✉</span>
                <input type="email" placeholder="hello@lavender.com" style={s.input} className="lav-input"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>

              <label style={s.label}>Password</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>🔒</span>
                <input type={showLoginPass ? "text" : "password"} placeholder="••••••••" style={s.input} className="lav-input"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <span style={s.eyeIcon} onClick={() => setShowLoginPass(!showLoginPass)}>{showLoginPass ? "🙈" : "👁"}</span>
              </div>

              <label style={s.checkLabel}>
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} style={s.checkbox} />
                Remember me for 30 days
              </label>

              <button style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }} className="lav-btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in…" : "Login to Account"}
              </button>

              <div style={s.dividerRow}>
                <div style={s.dividerLine} /><span style={s.dividerText}>OR CONTINUE WITH</span><div style={s.dividerLine} />
              </div>

              <button style={s.googleBtn} className="lav-google" onClick={handleGoogleSignIn}><GoogleIcon />Sign in with Google</button>
            </div>
          )}

          {tab === "signup" && (
            <div style={s.form}>
              <h1 style={s.heading}>Create Account</h1>
              <p style={s.subheading}>Join our community for exclusive early access.</p>

              <button style={s.googleBtn} className="lav-google" onClick={handleGoogleSignIn}><GoogleIcon />Sign up with Google</button>

              <div style={s.dividerRow}>
                <div style={s.dividerLine} /><span style={s.dividerText}>OR CONTINUE WITH EMAIL</span><div style={s.dividerLine} />
              </div>

              <label style={s.label}>Full Name</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>👤</span>
                <input type="text" placeholder="Elowen Lavender" style={s.input} className="lav-input"
                  value={signupName} onChange={e => setSignupName(e.target.value)} />
              </div>

              <label style={s.label}>Email Address</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>✉</span>
                <input type="email" placeholder="hello@lavender.com" style={s.input} className="lav-input"
                  value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              </div>

              <label style={s.label}>Password</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>🔒</span>
                <input type={showSignupPass ? "text" : "password"} placeholder="Min. 8 characters" style={s.input} className="lav-input"
                  value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                <span style={s.eyeIcon} onClick={() => setShowSignupPass(!showSignupPass)}>{showSignupPass ? "🙈" : "👁"}</span>
              </div>

              {signupPassword.length > 0 && (
                <div style={s.strengthWrap}>
                  <div style={s.strengthBar}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ ...s.strengthSegment, background: i <= strength.score ? strength.color : "#e8dce8" }} />
                    ))}
                  </div>
                  <span style={{ ...s.strengthLabel, color: strength.color }}>{strength.label}</span>
                </div>
              )}

              <label style={s.label}>Confirm Password</label>
              <div style={s.inputWrapper}>
                <span style={s.inputIcon}>🔒</span>
                <input type={showConfirmPass ? "text" : "password"} placeholder="Re-enter your password" style={{
                  ...s.input,
                  borderColor: signupConfirm && signupConfirm !== signupPassword ? "#e05252" : undefined,
                }} className="lav-input"
                  value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSignup()} />
                <span style={s.eyeIcon} onClick={() => setShowConfirmPass(!showConfirmPass)}>{showConfirmPass ? "🙈" : "👁"}</span>
              </div>
              {signupConfirm && signupConfirm !== signupPassword && (
                <p style={s.fieldError}>Passwords do not match</p>
              )}

              <label style={s.checkLabel}>
                <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} style={s.checkbox} />
                I agree to the <span style={s.link}>Terms of Service</span> and <span style={s.link}>Privacy Policy</span>.
              </label>

              <button style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }} className="lav-btn" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </button>

              <p style={s.loginLink}>
                Already have an account?{" "}
                <span style={s.link} onClick={() => switchTab("login")}>Log In</span>
              </p>
            </div>
          )}
        </div>
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

const s: { [key: string]: React.CSSProperties } = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", backgroundColor: "#fdf8f8" },
  left: { position: "relative", width: "45%", overflow: "hidden", flexShrink: 0 },
  brandName: { position: "absolute", top: 28, left: 32, zIndex: 10, color: "#fff", fontSize: 24, fontWeight: 700, fontFamily: "'Georgia',serif", letterSpacing: 1 },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" },
  imgOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(80,40,100,0.18) 0%,rgba(60,20,80,0.32) 100%)" },
  right: { flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#fdf8f8" },
  scroll: { width: "100%", maxWidth: 580, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 60px" },
  tabsWrapper: { display: "flex", width: "100%", maxWidth: 460, marginBottom: 8, borderBottom: "1.5px solid #e8dce8" },
  errorBox: { width: "100%", maxWidth: 460, marginBottom: 10, padding: "10px 16px", borderRadius: 8, background: "#fde8ec", color: "#c0395a", fontSize: 13.5, fontWeight: 500 },
  form: { width: "100%", maxWidth: 460, display: "flex", flexDirection: "column" },
  heading: { fontSize: 30, fontWeight: 700, color: "#2d1a3a", margin: "0 0 6px 0", fontFamily: "'Georgia',serif" },
  subheading: { fontSize: 14, color: "#888", margin: "0 0 14px 0", lineHeight: 1.4 },
  label: { fontSize: 13.5, fontWeight: 500, color: "#2d1a3a", marginBottom: 6, marginTop: 10, display: "block" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 16, fontSize: 15, color: "#b0a0b8", pointerEvents: "none" },
  input: { width: "100%", padding: "12px 42px 12px 44px", borderRadius: 10, border: "1.5px solid #e8dce8", backgroundColor: "#fdf3f6", fontSize: 14.5, color: "#2d1a3a", outline: "none", boxSizing: "border-box", fontFamily: "'Inter',sans-serif" },
  eyeIcon: { position: "absolute", right: 16, fontSize: 15, cursor: "pointer", color: "#b0a0b8" },
  strengthWrap: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  strengthBar: { display: "flex", gap: 4, flex: 1 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 4, transition: "background 0.3s" },
  strengthLabel: { fontSize: 12, fontWeight: 600, minWidth: 40 },
  fieldError: { fontSize: 12, color: "#e05252", marginTop: 5, marginBottom: 0 },
  checkLabel: { display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#555", cursor: "pointer", marginTop: 10, marginBottom: 0 },
  checkbox: { accentColor: "#c0395a", width: 16, height: 16, cursor: "pointer" },
  primaryBtn: { marginTop: 16, width: "100%", padding: "14px 0", borderRadius: 50, background: "linear-gradient(135deg,#c0395a 0%,#a02848 100%)", color: "#fff", fontSize: 15.5, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: 0.3 },
  dividerRow: { display: "flex", alignItems: "center", gap: 12, margin: "16px 0" },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e8dce8" },
  dividerText: { fontSize: 12, color: "#aaa", whiteSpace: "nowrap", letterSpacing: 0.5 },
  googleBtn: { width: "100%", padding: "12px 0", borderRadius: 10, border: "1.5px solid #e8dce8", backgroundColor: "#fff", fontSize: 14.5, fontWeight: 500, color: "#2d1a3a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" },
  link: { color: "#c0395a", cursor: "pointer", fontWeight: 500, textDecoration: "underline" },
  loginLink: { textAlign: "center", fontSize: 13, color: "#666", marginTop: 14, marginBottom: 8 },
};

const css = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .tab { flex: 1; background: none; border: none; border-bottom: 2px solid transparent; padding-bottom: 12px; font-size: 16px; cursor: pointer; font-family: 'Inter',sans-serif; transition: color 0.2s; }
  .tab-active { color: #c0395a; border-bottom-color: #c0395a; font-weight: 600; }
  .tab-inactive { color: #888; font-weight: 400; }
  .lav-input:focus { border-color: #c0395a !important; background: #fff !important; }
  .lav-btn:hover { opacity: 0.88; }
  .lav-google:hover { background: #fdf3f6 !important; }
  .lav-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .lav-scroll::-webkit-scrollbar { display: none; width: 0; }
`;