import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Thread = {
  id: string
  title: string
  body: string
  createdBy: string
  createdAt: string
  isApproved: boolean
}

type Comment = {
  id: string
  threadId: string
  body: string
  createdBy: string
  createdAt: string
  isApproved: boolean
}

type NewsItem = {
  id: string
  title: string
  summary: string
  publishedAt: string
}

type PlanItem = {
  id: string
  title: string
  status: 'draft' | 'review' | 'published'
  updatedAt: string
  updatedBy: string
}

type PlanStatus = PlanItem['status']

type HealthResponse = {
  ok: boolean
  utcNow: string
  storageConfigured: boolean
}

type AuthMeRecord = {
  clientPrincipal?: unknown
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return (await response.json()) as T
}

async function postJson<T>(url: string, payload: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) {
        message = body.message
      }
    } catch {
      // no-op
    }
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

function App() {
  const pageSize = 4

  const [threads, setThreads] = useState<Thread[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [status, setStatus] = useState('Loading community content...')

  const [threadTitle, setThreadTitle] = useState('')
  const [threadBody, setThreadBody] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [newsTitle, setNewsTitle] = useState('')
  const [newsSummary, setNewsSummary] = useState('')
  const [planTitle, setPlanTitle] = useState('')

  const [forumQuery, setForumQuery] = useState('')
  const [newsQuery, setNewsQuery] = useState('')
  const [plansQuery, setPlansQuery] = useState('')

  const [forumPage, setForumPage] = useState(1)
  const [newsPage, setNewsPage] = useState(1)
  const [plansPage, setPlansPage] = useState(1)

  const [showPendingThreads, setShowPendingThreads] = useState(false)
  const [commentView, setCommentView] = useState<'approved' | 'pending' | 'all'>('approved')

  const pendingThreads = useMemo(
    () => threads.filter((thread) => !thread.isApproved),
    [threads],
  )
  const pendingComments = useMemo(
    () => comments.filter((comment) => !comment.isApproved),
    [comments],
  )

  const canWrite = useMemo(() => {
    if (isAuthenticated) {
      return true
    }
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }, [isAuthenticated])

  const visibleThreads = useMemo(() => {
    const base = threads.filter((thread) => {
      if (showPendingThreads) {
        return !thread.isApproved
      }
      return thread.isApproved || isAuthenticated
    })

    if (!forumQuery.trim()) {
      return base
    }

    const term = forumQuery.toLowerCase()
    return base.filter(
      (thread) =>
        thread.title.toLowerCase().includes(term) || thread.body.toLowerCase().includes(term),
    )
  }, [threads, showPendingThreads, forumQuery, isAuthenticated])

  const visibleComments = useMemo(() => {
    const filteredByModeration = comments.filter((comment) => {
      if (commentView === 'approved') {
        return comment.isApproved || isAuthenticated
      }
      if (commentView === 'pending') {
        return !comment.isApproved
      }
      return true
    })
    return filteredByModeration
  }, [comments, commentView, isAuthenticated])

  const filteredNews = useMemo(() => {
    if (!newsQuery.trim()) {
      return news
    }
    const term = newsQuery.toLowerCase()
    return news.filter(
      (item) => item.title.toLowerCase().includes(term) || item.summary.toLowerCase().includes(term),
    )
  }, [news, newsQuery])

  const filteredPlans = useMemo(() => {
    if (!plansQuery.trim()) {
      return plans
    }
    const term = plansQuery.toLowerCase()
    return plans.filter((item) => item.title.toLowerCase().includes(term))
  }, [plans, plansQuery])

  const pagedThreads = useMemo(
    () => paginate(visibleThreads, forumPage, pageSize),
    [visibleThreads, forumPage],
  )
  const pagedNews = useMemo(() => paginate(filteredNews, newsPage, pageSize), [filteredNews, newsPage])
  const pagedPlans = useMemo(() => paginate(filteredPlans, plansPage, pageSize), [filteredPlans, plansPage])

  const forumPageCount = Math.max(1, Math.ceil(visibleThreads.length / pageSize))
  const newsPageCount = Math.max(1, Math.ceil(filteredNews.length / pageSize))
  const plansPageCount = Math.max(1, Math.ceil(filteredPlans.length / pageSize))

  async function loadAuthState() {
    try {
      const response = await fetch('/.auth/me')
      if (!response.ok) {
        setIsAuthenticated(false)
        return
      }
      const payload = (await response.json()) as AuthMeRecord | AuthMeRecord[]
      const records = Array.isArray(payload) ? payload : [payload]
      setIsAuthenticated(records.some((record) => Boolean(record?.clientPrincipal)))
    } catch {
      setIsAuthenticated(false)
    }
  }

  async function loadPrimaryData() {
    const [threadData, newsData, planData] = await Promise.all([
      getJson<Thread[]>('/api/threads'),
      getJson<NewsItem[]>('/api/news'),
      getJson<PlanItem[]>('/api/plans'),
    ])

    setThreads(threadData)
    setNews(newsData)
    setPlans(planData)

    if (!selectedThreadId && threadData.length > 0) {
      setSelectedThreadId(threadData[0].id)
    }
  }

  async function loadHealth(): Promise<HealthResponse> {
    return getJson<HealthResponse>('/api/health')
  }

  async function loadComments(threadId: string) {
    if (!threadId) {
      setComments([])
      return
    }
    const commentData = await getJson<Comment[]>(`/api/threads/${threadId}/comments`)
    setComments(commentData)
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [, health] = await Promise.all([loadAuthState(), loadHealth(), loadPrimaryData()])
        const storageMode = health.storageConfigured ? 'table storage' : 'in-memory mode'
        setStatus(`Community Hub is ready (${storageMode}).`)
      } catch {
        setStatus('Could not load data. Confirm the API is running.')
      }
    }
    void bootstrap()
  }, [])

  useEffect(() => {
    if (!selectedThreadId) {
      return
    }
    const fetchComments = async () => {
      try {
        await loadComments(selectedThreadId)
      } catch {
        setStatus('Comments could not be loaded for this thread.')
      }
    }
    void fetchComments()
  }, [selectedThreadId])

  useEffect(() => {
    setForumPage(1)
  }, [forumQuery, showPendingThreads])

  useEffect(() => {
    setNewsPage(1)
  }, [newsQuery])

  useEffect(() => {
    setPlansPage(1)
  }, [plansQuery])

  useEffect(() => {
    if (forumPage > forumPageCount) {
      setForumPage(forumPageCount)
    }
  }, [forumPage, forumPageCount])

  useEffect(() => {
    if (newsPage > newsPageCount) {
      setNewsPage(newsPageCount)
    }
  }, [newsPage, newsPageCount])

  useEffect(() => {
    if (plansPage > plansPageCount) {
      setPlansPage(plansPageCount)
    }
  }, [plansPage, plansPageCount])

  async function handleThreadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canWrite) {
      setStatus('Sign in is required to post in production.')
      return
    }
    try {
      await postJson<Thread>('/api/threads', { title: threadTitle, body: threadBody })
      setThreadTitle('')
      setThreadBody('')
      await loadPrimaryData()
      setStatus('Thread submitted for moderation.')
    } catch {
      setStatus('Could not create thread.')
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedThreadId) {
      setStatus('Choose a thread before adding a comment.')
      return
    }
    if (!canWrite) {
      setStatus('Sign in is required to comment in production.')
      return
    }
    try {
      await postJson<Comment>(`/api/threads/${selectedThreadId}/comments`, { body: commentBody })
      setCommentBody('')
      await loadComments(selectedThreadId)
      setStatus('Comment submitted for moderation.')
    } catch {
      setStatus('Could not create comment.')
    }
  }

  async function handleNewsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canWrite) {
      setStatus('Sign in is required to publish news in production.')
      return
    }
    try {
      await postJson<NewsItem>('/api/news', { title: newsTitle, summary: newsSummary })
      setNewsTitle('')
      setNewsSummary('')
      await loadPrimaryData()
      setStatus('News item created.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setStatus('Publishing news requires an admin email in ADMIN_EMAILS.')
        return
      }
      setStatus('Could not create news item.')
    }
  }

  async function handlePlanSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canWrite) {
      setStatus('Sign in is required to create plans in production.')
      return
    }
    try {
      await postJson<PlanItem>('/api/plans', { title: planTitle })
      setPlanTitle('')
      await loadPrimaryData()
      setStatus('Plan item created.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setStatus('Creating plans requires an admin email in ADMIN_EMAILS.')
        return
      }
      setStatus('Could not create plan item.')
    }
  }

  async function handlePlanStatusChange(planId: string, nextStatus: PlanStatus) {
    if (!canWrite) {
      setStatus('Sign in is required to update plans in production.')
      return
    }

    try {
      await postJson<PlanItem>(`/api/plans/${planId}/status`, { status: nextStatus })
      await loadPrimaryData()
      setStatus(`Plan status updated to ${nextStatus}.`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setStatus('Updating plan status requires an admin email in ADMIN_EMAILS.')
        return
      }
      setStatus('Could not update plan status.')
    }
  }

  async function handleApproveThread(threadId: string) {
    if (!canWrite) {
      setStatus('Sign in is required to moderate content in production.')
      return
    }

    try {
      await postJson<Thread>(`/api/threads/${threadId}/approve`)
      await loadPrimaryData()
      setStatus('Thread approved.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setStatus('Moderation requires an admin email in ADMIN_EMAILS.')
        return
      }
      setStatus('Could not approve thread.')
    }
  }

  async function handleApproveComment(commentId: string) {
    if (!canWrite) {
      setStatus('Sign in is required to moderate content in production.')
      return
    }

    try {
      await postJson<Comment>(`/api/comments/${commentId}/approve`)
      if (selectedThreadId) {
        await loadComments(selectedThreadId)
      }
      setStatus('Comment approved.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setStatus('Moderation requires an admin email in ADMIN_EMAILS.')
        return
      }
      setStatus('Could not approve comment.')
    }
  }

  return (
    <main className="hub-shell">
      <header className="hub-header">
        <div>
          <p className="eyebrow">St Jude's</p>
          <h1>Community Hub</h1>
          <p className="subhead">
            A welcoming space for local news, development plans, and resident
            discussion.
          </p>
        </div>
        <nav aria-label="Primary" className="hub-nav">
          <a href="#home">Home</a>
          <a href="#forum">Forum</a>
          <a href="#news">News</a>
          <a href="#plans">Plans</a>
          <a href="#admin">Admin</a>
        </nav>
        <div className="toolbar">
          <p className="status">{status}</p>
          <div className="auth-links">
            {isAuthenticated ? (
              <a href="/.auth/logout">Sign out</a>
            ) : (
              <a href="/.auth/login/aad">Sign in</a>
            )}
          </div>
        </div>
      </header>

      <section id="home" className="card">
        <h2>Home</h2>
        <p>
          Welcome to the prototype. Residents can browse updates and contribute
          comments on local topics.
        </p>
      </section>

      <section id="forum" className="card">
        <h2>Forum</h2>
        <div className="controls">
          <input
            value={forumQuery}
            onChange={(event) => setForumQuery(event.target.value)}
            placeholder="Search forum"
          />
          <button
            type="button"
            className="inline-button"
            onClick={() => setShowPendingThreads((current) => !current)}
          >
            {showPendingThreads ? 'Show approved' : 'Show pending'}
          </button>
        </div>
        <ul className="list">
          {pagedThreads.map((thread) => (
            <li key={thread.id}>
              <button
                className={`thread-link${selectedThreadId === thread.id ? ' active' : ''}`}
                onClick={() => setSelectedThreadId(thread.id)}
                type="button"
              >
                <strong>{thread.title}</strong>
                <span>{thread.body}</span>
                <span className={`badge ${thread.isApproved ? 'approved' : 'pending'}`}>
                  {thread.isApproved ? 'Approved' : 'Pending'}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {pagedThreads.length === 0 && <p className="empty">No forum threads match this view.</p>}
        <div className="pager">
          <button
            type="button"
            className="inline-button"
            disabled={forumPage === 1}
            onClick={() => setForumPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <span>
            Page {forumPage} / {forumPageCount}
          </span>
          <button
            type="button"
            className="inline-button"
            disabled={forumPage >= forumPageCount}
            onClick={() => setForumPage((value) => Math.min(forumPageCount, value + 1))}
          >
            Next
          </button>
        </div>

        <form className="form" onSubmit={handleThreadSubmit}>
          <h3>Start a new discussion</h3>
          <input
            value={threadTitle}
            onChange={(event) => setThreadTitle(event.target.value)}
            placeholder="Topic title"
            required
          />
          <textarea
            value={threadBody}
            onChange={(event) => setThreadBody(event.target.value)}
            placeholder="What would you like to discuss?"
            required
          />
          <button disabled={!canWrite} type="submit">
            Post thread
          </button>
        </form>

        <div className="comments">
          <div className="row">
            <h3>Comments</h3>
            <select
              value={commentView}
              onChange={(event) =>
                setCommentView(event.target.value as 'approved' | 'pending' | 'all')
              }
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="all">All</option>
            </select>
          </div>
          <ul className="list">
            {visibleComments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.body}</p>
                <span className={`badge ${comment.isApproved ? 'approved' : 'pending'}`}>
                  {comment.isApproved ? 'Approved' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
          {visibleComments.length === 0 && <p className="empty">No comments for this view yet.</p>}
          <form className="form" onSubmit={handleCommentSubmit}>
            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Add your comment"
              required
            />
            <button disabled={!canWrite} type="submit">
              Post comment
            </button>
          </form>
        </div>
      </section>

      <section id="news" className="card">
        <h2>Local News</h2>
        <p>Latest neighbourhood updates from organisers and residents.</p>
        <div className="controls">
          <input
            value={newsQuery}
            onChange={(event) => setNewsQuery(event.target.value)}
            placeholder="Search news"
          />
        </div>
        <ul className="list">
          {pagedNews.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </li>
          ))}
        </ul>
        {pagedNews.length === 0 && <p className="empty">No news items match this search.</p>}
        <div className="pager">
          <button
            type="button"
            className="inline-button"
            disabled={newsPage === 1}
            onClick={() => setNewsPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <span>
            Page {newsPage} / {newsPageCount}
          </span>
          <button
            type="button"
            className="inline-button"
            disabled={newsPage >= newsPageCount}
            onClick={() => setNewsPage((value) => Math.min(newsPageCount, value + 1))}
          >
            Next
          </button>
        </div>
      </section>

      <section id="plans" className="card">
        <h2>Plans &amp; Developments</h2>
        <p>Follow current proposals and key milestones.</p>
        <div className="controls">
          <input
            value={plansQuery}
            onChange={(event) => setPlansQuery(event.target.value)}
            placeholder="Search plans"
          />
        </div>
        <ul className="list">
          {pagedPlans.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>Status: {item.status}</p>
              <p className="meta">Last updated by: {item.updatedBy || 'Unknown'}</p>
            </li>
          ))}
        </ul>
        {pagedPlans.length === 0 && <p className="empty">No plans match this search.</p>}
        <div className="pager">
          <button
            type="button"
            className="inline-button"
            disabled={plansPage === 1}
            onClick={() => setPlansPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <span>
            Page {plansPage} / {plansPageCount}
          </span>
          <button
            type="button"
            className="inline-button"
            disabled={plansPage >= plansPageCount}
            onClick={() => setPlansPage((value) => Math.min(plansPageCount, value + 1))}
          >
            Next
          </button>
        </div>
      </section>

      <section id="admin" className="card">
        <h2>Admin</h2>
        <p>Publish updates and create plan items from one place.</p>
        <p className="admin-note">
          Moderation actions are restricted to emails configured in ADMIN_EMAILS.
        </p>
        <div className="moderation-panel">
          <p>
            Threads pending: <strong>{pendingThreads.length}</strong>
          </p>
          <p>
            Comments pending (selected thread): <strong>{pendingComments.length}</strong>
          </p>

          {pendingThreads.length > 0 && (
            <div className="moderation-group">
              <h3>Approve pending threads</h3>
              <ul className="list compact-list">
                {pendingThreads.map((thread) => (
                  <li key={thread.id}>
                    <div className="moderation-item">
                      <div>
                        <strong>{thread.title}</strong>
                        <p>{thread.body}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-button"
                        disabled={!canWrite}
                        onClick={() => handleApproveThread(thread.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pendingComments.length > 0 && (
            <div className="moderation-group">
              <h3>Approve pending comments</h3>
              <ul className="list compact-list">
                {pendingComments.map((comment) => (
                  <li key={comment.id}>
                    <div className="moderation-item">
                      <p>{comment.body}</p>
                      <button
                        type="button"
                        className="inline-button"
                        disabled={!canWrite}
                        onClick={() => handleApproveComment(comment.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <form className="form" onSubmit={handleNewsSubmit}>
          <h3>Publish news</h3>
          <input
            value={newsTitle}
            onChange={(event) => setNewsTitle(event.target.value)}
            placeholder="News title"
            required
          />
          <textarea
            value={newsSummary}
            onChange={(event) => setNewsSummary(event.target.value)}
            placeholder="Short update"
            required
          />
          <button disabled={!canWrite} type="submit">
            Publish news
          </button>
        </form>

        <form className="form" onSubmit={handlePlanSubmit}>
          <h3>Create plan item</h3>
          <input
            value={planTitle}
            onChange={(event) => setPlanTitle(event.target.value)}
            placeholder="Plan title"
            required
          />
          <button disabled={!canWrite} type="submit">
            Add plan
          </button>
        </form>

        <div className="form">
          <h3>Update plan status</h3>
          <ul className="list compact-list">
            {plans.map((item) => (
              <li key={item.id}>
                <div className="moderation-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      Current status: <span className="status-pill">{item.status}</span>
                    </p>
                    <p className="meta">Last updated by: {item.updatedBy || 'Unknown'}</p>
                  </div>
                  <div className="status-actions">
                    <button
                      type="button"
                      className="inline-button"
                      disabled={!canWrite || item.status === 'draft'}
                      onClick={() => handlePlanStatusChange(item.id, 'draft')}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className="inline-button"
                      disabled={!canWrite || item.status === 'review'}
                      onClick={() => handlePlanStatusChange(item.id, 'review')}
                    >
                      Review
                    </button>
                    <button
                      type="button"
                      className="inline-button"
                      disabled={!canWrite || item.status === 'published'}
                      onClick={() => handlePlanStatusChange(item.id, 'published')}
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {plans.length === 0 && <p className="empty">No plans available to update.</p>}
        </div>
      </section>
    </main>
  )
}

export default App
