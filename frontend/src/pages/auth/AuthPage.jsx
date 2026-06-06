import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Film,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/context/NotifyContext";
import { useLoading } from "@/context/LoadingContext";
import { useAuthContext } from "@/context/AuthContext";
import { loginApi, registerApi } from "@/apis/auth.api";

function AuthField({ icon: Icon, type = "text", value, onChange, placeholder, name, autoComplete, trailing, inputClassName = "" }) {
  return (
    <span className="auth-input-wrap">
      <Icon className="auth-input-icon" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`auth-input ${inputClassName}`.trim()}
      />
      {trailing}
    </span>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { withLoading } = useLoading();
  const { login } = useAuthContext();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.state?.tab === "login") {
      setActiveTab("login");
    }
    if (location.state?.registeredEmail) {
      setLoginForm((prev) => ({
        ...prev,
        email: location.state.registeredEmail,
      }));
    }
    if (location.state?.authNotice) {
      notify.info("Pendaftaran Berhasil", location.state.authNotice);
    }
  }, [location.state, notify]);

  const registerError = useMemo(() => {
    if (!registerForm.confirmPassword) return "";
    if (registerForm.password !== registerForm.confirmPassword) {
      return "Konfirmasi password belum sama.";
    }
    return "";
  }, [registerForm.password, registerForm.confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (activeTab === "login") {
      if (!loginForm.email || !loginForm.password) {
        notify.error("Login Gagal", "Email dan password wajib diisi.");
        return;
      }

      try {
        const res = await withLoading(() =>
          loginApi({
            email: loginForm.email,
            password: loginForm.password,
          }),
        );
        login(res.data.token, res.data.user, loginForm.rememberMe);
        notify.success("Login Berhasil", `Selamat datang, ${res.data.user.name}!`);
        navigate("/chat");
      } catch (error) {
        const message = error?.response?.data?.error || "Email atau password salah.";
        notify.error("Login Gagal", message);
      }
      return;
    }

    if (
      !registerForm.name ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      notify.error("Daftar Gagal", "Semua field pendaftaran wajib diisi.");
      return;
    }

    if (registerError) {
      notify.error("Daftar Gagal", registerError);
      return;
    }

    try {
      await withLoading(() =>
        registerApi({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      );

      const registeredEmail = registerForm.email.trim();
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setActiveTab("login");
      setShowPassword(false);
      setLoginForm((prev) => ({
        ...prev,
        email: registeredEmail,
        password: "",
      }));

      navigate("/auth", {
        replace: true,
        state: {
          tab: "login",
          registeredEmail,
          authNotice: "Akun berhasil dibuat. Silakan login untuk melanjutkan ke chat.",
        },
      });
    } catch (error) {
      const message = error?.response?.data?.error || "Pendaftaran gagal.";
      notify.error("Daftar Gagal", message);
    }
  };

  const isLogin = activeTab === "login";

  return (
    <section className="auth-page">
      <div className="auth-page__ambient auth-page__ambient--left" />
      <div className="auth-page__ambient auth-page__ambient--right" />
      <div className="auth-page__ambient auth-page__ambient--bottom" />

      <div className="auth-page__film auth-page__film--left" aria-hidden="true">
        <Film className="h-full w-full" />
      </div>
      <div className="auth-page__film auth-page__film--right" aria-hidden="true">
        <Film className="h-full w-full" />
      </div>

      <div className="auth-shell">
        <div className="auth-top-row">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="auth-top-pill"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali</span>
          </Button>
        </div>

        <div className="auth-card">
          <div className="auth-card__badge">
            <Shield className="h-4 w-4" />
            <span>Akses Akun</span>
          </div>

          <h1>Masuk atau Buat Akun</h1>
          <p className="auth-card__subtitle">
            Masuk atau buat akun untuk menyimpan seluruh percakapan Anda.
          </p>

          <div className="auth-tab-row" role="tablist" aria-label="Autentikasi">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`auth-tab-btn ${isLogin ? "is-active" : ""}`}
              aria-selected={isLogin}
              role="tab"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`auth-tab-btn ${!isLogin ? "is-active" : ""}`}
              aria-selected={!isLogin}
              role="tab"
            >
              <User className="h-4 w-4" />
              <span>Daftar</span>
            </button>
          </div>

          {isLogin ? (
            <form className="auth-form auth-form--login" onSubmit={handleSubmit}>
              <label className="auth-label">
                <span>Email</span>
                <AuthField
                  icon={Mail}
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="nama@domain.com"
                  autoComplete="email"
                />
              </label>

              <label className="auth-label">
                <span>Password</span>
                <AuthField
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  trailing={
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
              </label>

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, rememberMe: e.target.checked }))
                  }
                />
                <span>Ingat saya</span>
              </label>

              <Button className="auth-submit-btn auth-submit-btn--full">Masuk</Button>
            </form>
          ) : (
            <form className="auth-form auth-form--register" onSubmit={handleSubmit}>
              <label className="auth-label">
                <span>Nama Lengkap</span>
                <AuthField
                  icon={User}
                  type="text"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nama pengguna"
                  autoComplete="name"
                />
              </label>

              <label className="auth-label">
                <span>Email</span>
                <AuthField
                  icon={Mail}
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="nama@domain.com"
                  autoComplete="email"
                />
              </label>

              <label className="auth-label">
                <span>Password</span>
                <AuthField
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Buat password"
                  autoComplete="new-password"
                  trailing={
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
              </label>

              <label className="auth-label">
                <span>Konfirmasi Password</span>
                <AuthField
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
              </label>

              {registerError && <p className="auth-error">{registerError}</p>}

              <Button disabled={!!registerError} className="auth-submit-btn auth-submit-btn--full">
                Buat Akun
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default AuthPage;
