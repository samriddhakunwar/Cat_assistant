import React, { useState, useCallback } from 'react';
import { useTodo } from '../../hooks/useTodo';

export default function TodoWidget() {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodo();
  const [input, setInput] = useState('');

  const handleAdd = useCallback(() => {
    addTodo(input);
    setInput('');
  }, [addTodo, input]);

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const completed = todos.filter(t => t.completed).length;

  return (
    <div className="widget-section">
      {/* Input */}
      <div className="widget-row" style={{ gap: 6, marginBottom: 10 }}>
        <input
          className="todo-input"
          placeholder="Add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="todo-add-btn" onClick={handleAdd}>＋</button>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
            <span>{completed}/{todos.length} done</span>
            {completed > 0 && (
              <button className="link-btn" onClick={clearCompleted}>Clear done</button>
            )}
          </div>
          <div className="todo-progress-track">
            <div className="todo-progress-fill" style={{ width: `${todos.length ? (completed / todos.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* List */}
      <div className="todo-list">
        {todos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, padding: '20px 0' }}>
            No tasks yet 🐱
          </p>
        )}
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item${todo.completed ? ' todo-done' : ''}`}>
            <button className="todo-check" onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? '✓' : ''}
            </button>
            <span className="todo-text">{todo.text}</span>
            <button className="todo-delete" onClick={() => deleteTodo(todo.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
