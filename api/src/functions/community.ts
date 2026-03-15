import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
  type PlanStatus,
  approveComment,
  approveThread,
  createComment,
  createNews,
  createPlan,
  createThread,
  listComments,
  listNews,
  listPlans,
  listThreads,
  updatePlanStatus,
} from "../data/store";

function json(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    jsonBody: body,
    headers: { "Content-Type": "application/json" },
  };
}

async function parseBody(request: HttpRequest): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getUserEmail(request: HttpRequest): string {
  return request.headers.get("x-ms-client-principal-name") || "anonymous@local";
}

function isLocalDevelopment(request: HttpRequest): boolean {
  const host = (request.headers.get("host") || "").toLowerCase();
  return host.includes("localhost") || host.includes("127.0.0.1");
}

function isAdminUser(request: HttpRequest): boolean {
  if (isLocalDevelopment(request)) {
    return true;
  }

  const userEmail = getUserEmail(request).toLowerCase();
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (admins.length === 0) {
    return false;
  }

  return admins.includes(userEmail);
}

function requireAdmin(request: HttpRequest): HttpResponseInit | null {
  if (!isAdminUser(request)) {
    return json(403, { message: "admin privileges are required" });
  }

  return null;
}

app.http("getThreads", {
  methods: ["GET"],
  route: "threads",
  authLevel: "anonymous",
  handler: async () => json(200, await listThreads()),
});

app.http("postThread", {
  methods: ["POST"],
  route: "threads",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const body = await parseBody(request);
    const title = String(body.title || "").trim();
    const content = String(body.body || "").trim();
    if (!title || !content) {
      return json(400, { message: "title and body are required" });
    }
    return json(
      201,
      await createThread({
        title,
        body: content,
        createdBy: getUserEmail(request),
      }),
    );
  },
});

app.http("getComments", {
  methods: ["GET"],
  route: "threads/{threadId}/comments",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const threadId = request.params.threadId;
    if (!threadId) {
      return json(400, { message: "threadId is required" });
    }
    return json(200, await listComments(threadId));
  },
});

app.http("postComment", {
  methods: ["POST"],
  route: "threads/{threadId}/comments",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const threadId = request.params.threadId;
    const body = await parseBody(request);
    const content = String(body.body || "").trim();

    if (!threadId) {
      return json(400, { message: "threadId is required" });
    }

    if (!content) {
      return json(400, { message: "body is required" });
    }

    return json(
      201,
      await createComment(threadId, {
        body: content,
        createdBy: getUserEmail(request),
      }),
    );
  },
});

app.http("getNews", {
  methods: ["GET"],
  route: "news",
  authLevel: "anonymous",
  handler: async () => json(200, await listNews()),
});

app.http("postNews", {
  methods: ["POST"],
  route: "news",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const authorizationError = requireAdmin(request);
    if (authorizationError) {
      return authorizationError;
    }

    const body = await parseBody(request);
    const title = String(body.title || "").trim();
    const summary = String(body.summary || "").trim();

    if (!title || !summary) {
      return json(400, { message: "title and summary are required" });
    }

    return json(201, await createNews({ title, summary }));
  },
});

app.http("getPlans", {
  methods: ["GET"],
  route: "plans",
  authLevel: "anonymous",
  handler: async () => json(200, await listPlans()),
});

app.http("postPlans", {
  methods: ["POST"],
  route: "plans",
  authLevel: "anonymous",
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const authorizationError = requireAdmin(request);
    if (authorizationError) {
      return authorizationError;
    }

    context.info("Creating plan item");
    const body = await parseBody(request);
    const title = String(body.title || "").trim();
    if (!title) {
      return json(400, { message: "title is required" });
    }
    return json(201, await createPlan({ title }));
  },
});

app.http("updatePlanStatus", {
  methods: ["POST"],
  route: "plans/{planId}/status",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const authorizationError = requireAdmin(request);
    if (authorizationError) {
      return authorizationError;
    }

    const planId = request.params.planId;
    if (!planId) {
      return json(400, { message: "planId is required" });
    }

    const body = await parseBody(request);
    const status = String(body.status || "").trim().toLowerCase() as PlanStatus;
    const validStatuses: PlanStatus[] = ["draft", "review", "published"];
    if (!validStatuses.includes(status)) {
      return json(400, { message: "status must be one of: draft, review, published" });
    }

    const updated = await updatePlanStatus(planId, status);
    if (!updated) {
      return json(404, { message: "plan not found" });
    }

    return json(200, updated);
  },
});

app.http("approveThread", {
  methods: ["POST"],
  route: "threads/{threadId}/approve",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const authorizationError = requireAdmin(request);
    if (authorizationError) {
      return authorizationError;
    }

    const threadId = request.params.threadId;
    if (!threadId) {
      return json(400, { message: "threadId is required" });
    }

    const approved = await approveThread(threadId);
    if (!approved) {
      return json(404, { message: "thread not found" });
    }

    return json(200, approved);
  },
});

app.http("approveComment", {
  methods: ["POST"],
  route: "comments/{commentId}/approve",
  authLevel: "anonymous",
  handler: async (request: HttpRequest) => {
    const authorizationError = requireAdmin(request);
    if (authorizationError) {
      return authorizationError;
    }

    const commentId = request.params.commentId;
    if (!commentId) {
      return json(400, { message: "commentId is required" });
    }

    const approved = await approveComment(commentId);
    if (!approved) {
      return json(404, { message: "comment not found" });
    }

    return json(200, approved);
  },
});
