import { useCallback, useState } from "react";
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
import type { WidgetConfig } from "@findash/shared";
import { CategoryPieWidget } from "../../components/dashboard/CategoryPieWidget.js";
import { RecentTransactionsWidget } from "../../components/dashboard/RecentTransactionsWidget.js";
import { SummaryWidget } from "../../components/dashboard/SummaryWidget.js";
import { TrendChartWidget } from "../../components/dashboard/TrendChartWidget.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  useDashboardLayout,
  useSaveDashboardLayout,
} from "../../hooks/useDashboardLayout.js";
import styles from "./DashboardPage.module.css";
import pageStyles from "../shared/Page.module.css";

function renderWidget(widget: WidgetConfig) {
  switch (widget.type) {
    case "summary":
      return <SummaryWidget title={widget.title} />;
    case "categoryPie":
      return <CategoryPieWidget title={widget.title} />;
    case "trendChart":
      return <TrendChartWidget title={widget.title} />;
    case "recentTransactions":
      return <RecentTransactionsWidget title={widget.title} />;
    default:
      return null;
  }
}

function SortableWidget({
  widget,
}: {
  widget: WidgetConfig;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const spanClass =
    widget.grid.w >= 2 ? styles.span2 : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.widgetWrapper} ${spanClass} ${isDragging ? styles.dragging : ""}`}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Drag ${widget.title ?? widget.type}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      {renderWidget(widget)}
    </div>
  );
}

export function DashboardPage() {
  const { data: layout, isLoading } = useDashboardLayout();
  const saveLayout = useSaveDashboardLayout();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    DEFAULT_DASHBOARD_LAYOUT.widgets,
  );

  const currentWidgets = layout?.widgets.length ? layout.widgets : widgets;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = currentWidgets.findIndex((w) => w.id === active.id);
      const newIndex = currentWidgets.findIndex((w) => w.id === over.id);
      const reordered = arrayMove(currentWidgets, oldIndex, newIndex).map(
        (w, i) => ({
          ...w,
          grid: { ...w.grid, y: i },
        }),
      );

      setWidgets(reordered);
      saveLayout.mutate({ widgets: reordered });
    },
    [currentWidgets, saveLayout],
  );

  if (isLoading && !layout) {
    return <LoadingSpinner />;
  }

  const displayWidgets = layout?.widgets.length ? layout.widgets : widgets;

  return (
    <div>
      <div className={pageStyles.pageHeader}>
        <div>
          <h1 className={pageStyles.pageTitle}>Dashboard</h1>
          <p className={pageStyles.pageSubtitle}>
            Your financial overview at a glance
          </p>
        </div>
      </div>

      <p className={styles.hint}>
        Drag widgets to reorder. Layout is saved automatically.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={displayWidgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.dashboardGrid}>
            {displayWidgets.map((widget) => (
              <SortableWidget key={widget.id} widget={widget} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
