import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerBodySchema } from "@findash/shared";
import { register } from "../../api/auth.js";
import { Button } from "../../components/Button/Button.js";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage.js";
import { Input } from "../../components/Input/Input.js";
import { useAuthStore } from "../../stores/authStore.js";
import styles from "./AuthPages.module.css";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFieldErrors({});

    const body = { email, password, ...(name ? { name } : {}) };
    const parsed = registerBodySchema.safeParse(body);
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
      const data = await register(parsed.data);
      setAuth(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user,
      );
      navigate("/dashboard", { replace: true });
    } catch {
      setApiError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start tracking your finances</p>

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          {apiError && <ErrorMessage>{apiError}</ErrorMessage>}

          <Input
            label="Name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint="Minimum 8 characters"
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
