import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginBodySchema } from "@findash/shared";
import { login } from "../../api/auth.js";
import { Button } from "../../components/Button/Button.js";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage.js";
import { Input } from "../../components/Input/Input.js";
import { useAuthStore } from "../../stores/authStore.js";
import styles from "./AuthPages.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFieldErrors({});

    const parsed = loginBodySchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const data = await login(parsed.data);
      setAuth(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user,
      );
      navigate(from, { replace: true });
    } catch {
      setApiError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Welcome back to FinDash</p>

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          {apiError && <ErrorMessage>{apiError}</ErrorMessage>}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
