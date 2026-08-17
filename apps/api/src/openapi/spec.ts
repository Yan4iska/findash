export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FinDash API",
    version: "1.0.0",
    description: "Personal budget analytics API",
  },
  servers: [{ url: "http://localhost:3001" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          message: { type: "string" },
          code: { type: "string" },
          details: {},
        },
        required: ["message"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          user: { $ref: "#/components/schemas/UserPublic" },
        },
        required: ["accessToken", "refreshToken", "user"],
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
        required: ["accessToken", "refreshToken"],
      },
      UserPublic: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "createdAt"],
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          name: { type: "string" },
          color: { type: "string" },
          icon: { type: "string" },
          sortOrder: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "userId", "name", "color", "sortOrder", "createdAt"],
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          categoryId: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["income", "expense"] },
          description: { type: "string" },
          date: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "userId",
          "categoryId",
          "amount",
          "type",
          "date",
          "createdAt",
          "updatedAt",
        ],
      },
      PaginatedTransactions: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Transaction" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
        },
        required: ["items", "total", "page", "limit", "totalPages"],
      },
      AnalyticsSummary: {
        type: "object",
        properties: {
          totalIncome: { type: "number" },
          totalExpense: { type: "number" },
          net: { type: "number" },
          transactionCount: { type: "integer" },
        },
        required: [
          "totalIncome",
          "totalExpense",
          "net",
          "transactionCount",
        ],
      },
      DashboardLayout: {
        type: "object",
        properties: {
          widgets: {
            type: "array",
            items: { $ref: "#/components/schemas/WidgetConfig" },
          },
        },
        required: ["widgets"],
      },
      WidgetConfig: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: ["summary", "categoryPie", "trendChart", "recentTransactions"],
          },
          title: { type: "string" },
          grid: {
            type: "object",
            properties: {
              x: { type: "integer" },
              y: { type: "integer" },
              w: { type: "integer" },
              h: { type: "integer" },
            },
            required: ["x", "y", "w", "h"],
          },
        },
        required: ["id", "type", "grid"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: { required: true },
        responses: {
          "201": {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Rotate refresh token",
        responses: {
          "200": {
            description: "New tokens issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokens" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Logout and revoke refresh token",
        responses: { "204": { description: "Logged out" } },
      },
    },
    "/categories": {
      get: {
        summary: "List categories",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Category list" } },
      },
      post: {
        summary: "Create category",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Category created" } },
      },
    },
    "/categories/reorder": {
      patch: {
        summary: "Reorder categories",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Reordered categories" } },
      },
    },
    "/categories/{id}": {
      put: {
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Updated category" } },
      },
      delete: {
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },
    "/transactions": {
      get: {
        summary: "List transactions",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Paginated transactions",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedTransactions" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create transaction",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Transaction created" } },
      },
    },
    "/transactions/export.csv": {
      get: {
        summary: "Export transactions as CSV",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "CSV file", content: { "text/csv": {} } } },
      },
    },
    "/transactions/{id}": {
      get: {
        summary: "Get transaction",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Transaction" } },
      },
      put: {
        summary: "Update transaction",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Updated transaction" } },
      },
      delete: {
        summary: "Delete transaction",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },
    "/analytics/summary": {
      get: {
        summary: "Analytics summary",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Summary totals" } },
      },
    },
    "/analytics/category-breakdown": {
      get: {
        summary: "Expense breakdown by category",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Breakdown items" } },
      },
    },
    "/analytics/trend": {
      get: {
        summary: "Income/expense trends",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Trend points" } },
      },
    },
    "/dashboard/layout": {
      get: {
        summary: "Get dashboard layout",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Dashboard layout" } },
      },
      put: {
        summary: "Save dashboard layout",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Saved layout" } },
      },
    },
  },
} as const;
