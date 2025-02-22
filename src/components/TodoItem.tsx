import classNames from 'classnames';
import { Todo } from '../types/Todo';
import { useState, useEffect } from 'react';
import { updateTodo } from '../api/todos';
import { ErrorType } from '../types/ErrorMessages';

interface TodoItemProps {
  todo: Todo;
  handleDeleteTodo: (id: number) => void;
  loadingId: number | null;
  loading: boolean;
  setError: (errorType: ErrorType | null) => void;
  fetchTodos: () => void;
  setIsUpdating: (updating: boolean) => void;
  isUpdating: boolean;
  setLoadingId: (id: number | null) => void;
  loadingIds: number[];
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  handleDeleteTodo,
  loadingId,
  loading,
  setError,
  fetchTodos,
  setIsUpdating,
  loadingIds,
  setLoadingId,
}) => {
  const { id, completed, title } = todo;
  const [isChecked, setIsChecked] = useState(completed);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  useEffect(() => {
    setIsChecked(completed);
  }, [completed]);

  const handleCheckboxChange = () => {
    const newCompletedState = !isChecked;

    setIsChecked(newCompletedState);
    setLoadingId(id);

    updateTodo(id, { completed: newCompletedState })
      .then(updatedTodo => {
        if (updatedTodo.completed !== newCompletedState) {
          setIsChecked(updatedTodo.completed);
        }

        fetchTodos();
      })
      .catch(() => {
        setIsChecked(isChecked);
        setError('update');
      })
      .finally(() => {
        setIsUpdating(false);
        setLoadingId(null);
      });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(event.target.value);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
      handleDeleteTodo(id);

      return;
    }

    setLoadingId(id);
    setIsLocalLoading(true);

    updateTodo(id, { title: trimmedTitle })
      .then(() => {
        setNewTitle(trimmedTitle);
        setIsEditing(false);
        fetchTodos();
      })
      .catch(() => {
        setError('update');
      })
      .finally(() => {
        setIsEditing(false);
        setIsLocalLoading(false);
        setLoadingId(null);
      });
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: isChecked,
      })}
    >
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={isChecked}
          onChange={handleCheckboxChange}
          disabled={loading}
        />
      </label>

      {isEditing ? (
        <form onBlur={handleSave} onSubmit={handleSave}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            autoFocus
            onChange={handleInputChange}
            onKeyUp={handleKeyUp}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleEditClick}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteTodo(id)}
          >
            ×
          </button>
        </>
      )}

      {(loadingId === id || isLocalLoading || loadingIds.includes(id)) && (
        <div data-cy="TodoLoader" className="modal overlay is-active">
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      )}
    </div>
  );
};
