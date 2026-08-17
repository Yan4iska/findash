import type {
  Category,
  DashboardLayout,
  Transaction,
  UserPublic,
} from "@findash/shared";
import type { CategoryDocument } from "../models/Category.js";
import type { DashboardLayoutDocument } from "../models/DashboardLayout.js";
import type { TransactionDocument } from "../models/Transaction.js";
import type { UserDocument } from "../models/User.js";

export function toUserPublic(user: UserDocument): UserPublic {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toCategory(category: CategoryDocument): Category {
  return {
    id: category._id.toString(),
    userId: category.userId.toString(),
    name: category.name,
    color: category.color,
    icon: category.icon,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt.toISOString(),
  };
}

export function toTransaction(transaction: TransactionDocument): Transaction {
  return {
    id: transaction._id.toString(),
    userId: transaction.userId.toString(),
    categoryId: transaction.categoryId.toString(),
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

export function toDashboardLayout(
  layout: DashboardLayoutDocument,
): DashboardLayout {
  return {
    widgets: layout.widgets.map((widget) => ({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      grid: {
        x: widget.grid.x,
        y: widget.grid.y,
        w: widget.grid.w,
        h: widget.grid.h,
      },
    })),
  };
}
