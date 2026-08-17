import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createTransactionBodySchema,
  TRANSACTION_TYPES,
  type TransactionType,
} from "@findash/shared";
import { Button } from "../../components/Button/Button.js";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage.js";
import { Input } from "../../components/Input/Input.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { Select } from "../../components/Select/Select.js";
import { useCategories } from "../../hooks/useCategories.js";
import {
  useCreateTransaction,
  useTransaction,
  useUpdateTransaction,
} from "../../hooks/useTransactions.js";
import { formatDateInput } from "../../utils/format.js";
import styles from "../shared/Page.module.css";

export function TransactionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: existing, isLoading: loadingTx } = useTransaction(id);
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (existing) {
      setCategoryId(existing.categoryId);
      setAmount(String(existing.amount));
      setType(existing.type);
      setDescription(existing.description ?? "");
      setDate(formatDateInput(existing.date));
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFieldErrors({});

    const body = {
      categoryId,
      amount: parseFloat(amount),
      type,
      date,
      ...(description ? { description } : {}),
    };

    const parsed = createTransactionBodySchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, body: parsed.data });
      } else {
        await createMutation.mutateAsync(parsed.data);
      }
      navigate("/transactions");
    } catch {
      setApiError("Failed to save transaction");
    }
  };

  if ((isEdit && loadingTx) || loadingCategories) {
    return <LoadingSpinner />;
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {isEdit ? "Edit transaction" : "New transaction"}
          </h1>
        </div>
      </div>

      <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
        {apiError && <ErrorMessage>{apiError}</ErrorMessage>}

        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={fieldErrors.categoryId}
        >
          <option value="">Select category</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={fieldErrors.amount}
        />

        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          error={fieldErrors.type}
        >
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </Select>

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={fieldErrors.date}
        />

        <div className={styles.formActions}>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
          <Link to="/transactions">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
