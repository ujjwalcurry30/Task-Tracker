import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function apiRequest(path, method = 'GET', body, token) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || 'Something went wrong';
      throw new Error(message);
    }
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`Cannot connect to server. Make sure the backend is running on ${API_BASE_URL}`);
    }
    throw error;
  }
}

function NotificationBar({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="notification-bar">
      <span>{message}</span>
      <button type="button" className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function AuthView({ mode, onToggleMode, onAuthSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const isSignUp = mode === 'signup';

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowValidation(true);
    setShowNotification(false);

    // Check if fields are empty
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill all required fields.');
      if (!email || !password) {
        setNotificationMessage('Please enter a valid email and password.');
        setShowNotification(true);
      }
      return;
    }

    // Check if email format is valid
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setNotificationMessage('Please enter a valid email address format.');
      setShowNotification(true);
      return;
    }

    setLoading(true);
    try {
      const path = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignUp ? { name, email, password } : { email, password };
      const data = await apiRequest(path, 'POST', payload);

      // Store token + user in localStorage for persistence
      localStorage.setItem('taskTrackerToken', data.token);
      localStorage.setItem('taskTrackerUser', JSON.stringify(data.user));
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <NotificationBar
        message={notificationMessage || 'Please enter a valid email and password.'}
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <div className="auth-card">
        <h1 className="app-title">Task Tracker</h1>
        <p className="app-subtitle">
          {isSignUp ? 'Create an account to manage your tasks.' : 'Log in to access your tasks.'}
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          {isSignUp && (
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={showValidation && !name ? 'invalid' : ''}
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (showNotification && e.target.value && isValidEmail(e.target.value)) {
                  setShowNotification(false);
                }
              }}
              onBlur={() => {
                if (email && !isValidEmail(email)) {
                  setNotificationMessage('Please enter a valid email address format.');
                  setShowNotification(true);
                }
              }}
              className={
                showValidation && (!email || (email && !isValidEmail(email))) ? 'invalid' : ''
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (showNotification && e.target.value) {
                  setShowNotification(false);
                }
              }}
              className={showValidation && !password ? 'invalid' : ''}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <button className="ghost-btn" type="button" onClick={onToggleMode}>
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

function TaskForm({ initialTask, onCancel, onSave, users = [], currentUserId }) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate ? initialTask.dueDate.slice(0, 10) : ''
  );
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [status, setStatus] = useState(initialTask?.status || 'todo');
  const [assignedTo, setAssignedTo] = useState(() => {
    if (initialTask?.assignedTo) {
      if (typeof initialTask.assignedTo === 'object' && initialTask.assignedTo._id) {
        return initialTask.assignedTo._id;
      }
      return initialTask.assignedTo;
    }
    return '';
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    onSave({
      ...initialTask,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
      status,
      assignedTo: assignedTo && assignedTo.trim() ? assignedTo : null,
    });
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-card">
        <h2>{initialTask?._id ? 'Edit task' : 'New task'}</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="assignedTo">Assign to</label>
            <select
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user._id === currentUserId ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="task-form-actions">
            <button type="button" className="ghost-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskList({
  tasks,
  loading,
  error,
  filters,
  onFiltersChange,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
}) {
  const filteredTasks = useMemo(() => {
    // Backend already filters tasks, so just return them as-is
    return tasks;
  }, [tasks]);

  return (
    <div className="app-shell">
      <div className="tasks-layout">
        <header className="tasks-header">
          <div>
            <h1 className="app-title">My tasks</h1>
            <p className="app-subtitle">Create, track, and complete your personal tasks.</p>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-btn" onClick={onRefresh} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button type="button" className="primary-btn" onClick={onCreate}>
              + New task
            </button>
          </div>
        </header>

        <section className="filters-row">
          <div className="form-field">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-field filters-search">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by title or description"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <section className="tasks-list">
          {loading && <p className="muted">Loading tasks…</p>}
          {!loading && filteredTasks.length === 0 && (
            <p className="muted">No tasks yet. Create your first one!</p>
          )}

          {filteredTasks.map((task) => (
            <article key={task._id} className={`task-card priority-${task.priority}`}>
              <div className="task-card-main">
                <div>
                  <h2>{task.title}</h2>
                  {task.description && <p className="task-description">{task.description}</p>}
                </div>
                <span className={`status-pill status-${task.status}`}>{task.status}</span>
              </div>
              <div className="task-card-meta">
                {task.dueDate && (
                  <span>
                    Due:{' '}
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
                <span className="priority-pill">{task.priority} priority</span>
                {task.assignedTo && (
                  <span className="assigned-to">
                    Assigned to: {task.assignedTo.name || task.assignedTo.email}
                  </span>
                )}
              </div>
              <div className="task-card-actions">
                <button type="button" className="ghost-btn" onClick={() => onEdit(task)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() => onDelete(task)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('taskTrackerToken');
    const storedUser = localStorage.getItem('taskTrackerUser');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('taskTrackerToken');
        localStorage.removeItem('taskTrackerUser');
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadTasks();
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.status, filters.search]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/api/auth/users', 'GET', undefined, token);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadTasks = async () => {
    if (!token) return;
    setTasksLoading(true);
    setTasksError('');
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiRequest(`/api/tasks${query}`, 'GET', undefined, token);
      setTasks(data);
    } catch (err) {
      setTasksError(err.message || 'Failed to load tasks.');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('taskTrackerToken');
    localStorage.removeItem('taskTrackerUser');
  };

  const handleCreateTaskClick = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskPayload) => {
    try {
      if (taskPayload._id) {
        const { _id, ...update } = taskPayload;
        const updated = await apiRequest(`/api/tasks/${_id}`, 'PUT', update, token);
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      } else {
        const created = await apiRequest('/api/tasks', 'POST', taskPayload, token);
        setTasks((prev) => [created, ...prev]);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      alert(err.message || 'Failed to save task.');
    }
  };

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) return;
    try {
      await apiRequest(`/api/tasks/${task._id}`, 'DELETE', undefined, token);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  if (!token || !user) {
    return (
      <AuthView
        mode={authMode}
        onToggleMode={() => setAuthMode((m) => (m === 'login' ? 'signup' : 'login'))}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <>
      <div className="top-bar">
        <span className="top-bar-user">Signed in as {user.name || user.email}</span>
        <button type="button" className="ghost-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <TaskList
        tasks={tasks}
        loading={tasksLoading}
        error={tasksError}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={loadTasks}
        onCreate={handleCreateTaskClick}
        onEdit={handleEditTaskClick}
        onDelete={handleDeleteTask}
      />
      {showTaskForm && (
        <TaskForm
          initialTask={editingTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          users={users}
          currentUserId={user?.id}
        />
      )}
    </>
  );
}

export default App;
