import { TableClient } from "@azure/data-tables";

export type Thread = {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  createdAt: string;
  isApproved: boolean;
};

export type Comment = {
  id: string;
  threadId: string;
  body: string;
  createdBy: string;
  createdAt: string;
  isApproved: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
};

export type PlanItem = {
  id: string;
  title: string;
  status: "draft" | "review" | "published";
  updatedAt: string;
};

type Tables = {
  threads: Thread[];
  comments: Comment[];
  news: NewsItem[];
  plans: PlanItem[];
};

const memoryTables: Tables = {
  threads: [
    {
      id: "thread-1",
      title: "Ideas for safer evening lighting",
      body: "Share specific locations where lighting could be improved.",
      createdBy: "resident@example.com",
      createdAt: new Date().toISOString(),
      isApproved: true,
    },
  ],
  comments: [
    {
      id: "comment-1",
      threadId: "thread-1",
      body: "Corner near the park entrance is especially dark.",
      createdBy: "resident@example.com",
      createdAt: new Date().toISOString(),
      isApproved: true,
    },
  ],
  news: [
    {
      id: "news-1",
      title: "Spring clean-up volunteer day",
      summary: "Meet at the community hall this Saturday at 10am.",
      publishedAt: new Date().toISOString(),
    },
  ],
  plans: [
    {
      id: "plan-1",
      title: "Church Lane crossing improvements",
      status: "review",
      updatedAt: new Date().toISOString(),
    },
  ],
};

const tableNames = {
  users: process.env.TABLE_USERS || "Users",
  threads: process.env.TABLE_THREADS || "Threads",
  comments: process.env.TABLE_COMMENTS || "Comments",
  news: process.env.TABLE_NEWS || "News",
  plans: process.env.TABLE_PLANS || "Plans",
};

function getTableClient(name: string): TableClient | null {
  const connectionString = process.env.AZURE_TABLES_CONNECTION_STRING;
  if (!connectionString) {
    return null;
  }
  return TableClient.fromConnectionString(connectionString, name);
}

export async function listThreads(): Promise<Thread[]> {
  const client = getTableClient(tableNames.threads);
  if (!client) {
    return memoryTables.threads;
  }

  const entities: Thread[] = [];
  for await (const entity of client.listEntities<Record<string, unknown>>()) {
    entities.push({
      id: String(entity.rowKey),
      title: String(entity.title || ""),
      body: String(entity.body || ""),
      createdBy: String(entity.createdBy || "unknown"),
      createdAt: String(entity.createdAt || ""),
      isApproved: Boolean(entity.isApproved),
    });
  }
  return entities;
}

export async function createThread(input: Pick<Thread, "title" | "body" | "createdBy">): Promise<Thread> {
  const thread: Thread = {
    id: `thread-${Date.now()}`,
    title: input.title,
    body: input.body,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    isApproved: false,
  };

  const client = getTableClient(tableNames.threads);
  if (!client) {
    memoryTables.threads.unshift(thread);
    return thread;
  }

  await client.upsertEntity({
    partitionKey: "thread",
    rowKey: thread.id,
    title: thread.title,
    body: thread.body,
    createdBy: thread.createdBy,
    createdAt: thread.createdAt,
    isApproved: thread.isApproved,
  });
  return thread;
}

export async function approveThread(threadId: string): Promise<Thread | null> {
  const client = getTableClient(tableNames.threads);
  if (!client) {
    const thread = memoryTables.threads.find((item) => item.id === threadId);
    if (!thread) {
      return null;
    }
    thread.isApproved = true;
    return thread;
  }

  const existing = await client.getEntity<Record<string, unknown>>("thread", threadId).catch(() => null);
  if (!existing) {
    return null;
  }

  await client.upsertEntity(
    {
      partitionKey: "thread",
      rowKey: threadId,
      isApproved: true,
    },
    "Merge",
  );

  return {
    id: String(existing.rowKey),
    title: String(existing.title || ""),
    body: String(existing.body || ""),
    createdBy: String(existing.createdBy || "unknown"),
    createdAt: String(existing.createdAt || ""),
    isApproved: true,
  };
}

export async function listComments(threadId: string): Promise<Comment[]> {
  const client = getTableClient(tableNames.comments);
  if (!client) {
    return memoryTables.comments.filter((comment) => comment.threadId === threadId);
  }

  const entities: Comment[] = [];
  for await (const entity of client.listEntities<Record<string, unknown>>({
    queryOptions: { filter: `threadId eq '${threadId}'` },
  })) {
    entities.push({
      id: String(entity.rowKey),
      threadId: String(entity.threadId || ""),
      body: String(entity.body || ""),
      createdBy: String(entity.createdBy || "unknown"),
      createdAt: String(entity.createdAt || ""),
      isApproved: Boolean(entity.isApproved),
    });
  }
  return entities;
}

export async function createComment(
  threadId: string,
  input: Pick<Comment, "body" | "createdBy">,
): Promise<Comment> {
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    threadId,
    body: input.body,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    isApproved: false,
  };

  const client = getTableClient(tableNames.comments);
  if (!client) {
    memoryTables.comments.unshift(comment);
    return comment;
  }

  await client.upsertEntity({
    partitionKey: threadId,
    rowKey: comment.id,
    threadId: comment.threadId,
    body: comment.body,
    createdBy: comment.createdBy,
    createdAt: comment.createdAt,
    isApproved: comment.isApproved,
  });
  return comment;
}

export async function approveComment(commentId: string): Promise<Comment | null> {
  const client = getTableClient(tableNames.comments);
  if (!client) {
    const comment = memoryTables.comments.find((item) => item.id === commentId);
    if (!comment) {
      return null;
    }
    comment.isApproved = true;
    return comment;
  }

  for await (const entity of client.listEntities<Record<string, unknown>>({
    queryOptions: { filter: `RowKey eq '${commentId}'` },
  })) {
    const partitionKey = String(entity.partitionKey || "");
    const rowKey = String(entity.rowKey || "");

    if (!partitionKey || !rowKey) {
      continue;
    }

    await client.upsertEntity(
      {
        partitionKey,
        rowKey,
        isApproved: true,
      },
      "Merge",
    );

    return {
      id: rowKey,
      threadId: String(entity.threadId || partitionKey),
      body: String(entity.body || ""),
      createdBy: String(entity.createdBy || "unknown"),
      createdAt: String(entity.createdAt || ""),
      isApproved: true,
    };
  }

  return null;
}

export async function listNews(): Promise<NewsItem[]> {
  return memoryTables.news;
}

export async function createNews(item: Pick<NewsItem, "title" | "summary">): Promise<NewsItem> {
  const created: NewsItem = {
    id: `news-${Date.now()}`,
    title: item.title,
    summary: item.summary,
    publishedAt: new Date().toISOString(),
  };
  memoryTables.news.unshift(created);
  return created;
}

export async function listPlans(): Promise<PlanItem[]> {
  return memoryTables.plans;
}

export async function createPlan(item: Pick<PlanItem, "title">): Promise<PlanItem> {
  const created: PlanItem = {
    id: `plan-${Date.now()}`,
    title: item.title,
    status: "draft",
    updatedAt: new Date().toISOString(),
  };
  memoryTables.plans.unshift(created);
  return created;
}
