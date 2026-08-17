import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "@findash/shared";
import {
  createCategoryBodySchema,
  DEFAULT_CATEGORY_COLORS,
} from "@findash/shared";
import { Button } from "../../components/Button/Button.js";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage.js";
import { Input } from "../../components/Input/Input.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { Modal } from "../../components/Modal/Modal.js";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "../../hooks/useCategories.js";
import pageStyles from "../shared/Page.module.css";
import styles from "./CategoriesPage.module.css";

function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.categoryItem} ${isDragging ? styles.dragging : ""}`}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Reorder ${category.name}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span
        className={styles.colorDot}
        style={{ background: category.color }}
      />
      <span className={styles.categoryName}>{category.name}</span>
      <div className={styles.categoryActions}>
        <Button variant="ghost" small onClick={() => onEdit(category)}>
          Edit
        </Button>
        <Button variant="danger" small onClick={() => onDelete(category.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(DEFAULT_CATEGORY_COLORS[0]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = createCategoryBodySchema.safeParse({
      name: newName,
      color: newColor,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0]?.toString() ?? "form"] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    await createMutation.mutateAsync(parsed.data);
    setNewName("");
    setNewColor(DEFAULT_CATEGORY_COLORS[0]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !categories || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    reorderMutation.mutate({ orderedIds: reordered.map((c) => c.id) });
  };

  const openEdit = (category: Category) => {
    setEditCategory(category);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleEditSave = async () => {
    if (!editCategory) return;
    await updateMutation.mutateAsync({
      id: editCategory.id,
      body: { name: editName, color: editColor },
    });
    setEditCategory(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this category?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>Failed to load categories</ErrorMessage>;

  return (
    <div>
      <div className={pageStyles.pageHeader}>
        <div>
          <h1 className={pageStyles.pageTitle}>Categories</h1>
          <p className={pageStyles.pageSubtitle}>
            Organize your transactions · drag to reorder
          </p>
        </div>
      </div>

      <form className={styles.inlineForm} onSubmit={(e) => void handleCreate(e)}>
        <div className={styles.inlineFormRow}>
          <Input
            label="New category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={fieldErrors.name}
            placeholder="Category name"
          />
          <div>
            <label
              htmlFor="new-color"
              style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}
            >
              Color
            </label>
            <input
              id="new-color"
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{ display: "block", marginTop: "var(--space-xs)", width: "3rem", height: "2.5rem" }}
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            Add
          </Button>
        </div>
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories?.map((c) => c.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.categoryList}>
            {categories?.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                onEdit={openEdit}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Modal
        title="Edit category"
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditCategory(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleEditSave()}>Save</Button>
          </>
        }
      >
        <Input
          label="Name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
        <div style={{ marginTop: "var(--space-md)" }}>
          <label htmlFor="edit-color" style={{ fontSize: "var(--font-size-sm)" }}>
            Color
          </label>
          <input
            id="edit-color"
            type="color"
            value={editColor}
            onChange={(e) => setEditColor(e.target.value)}
            style={{ display: "block", marginTop: "var(--space-xs)" }}
          />
        </div>
      </Modal>
    </div>
  );
}
