import { useEffect } from 'react';
import { Todo } from '../types/Todo';

interface HeaderProps {
  inputText: string;
  setInputText: (inputText: string) => void;
  handleAddTodo: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  toggleAllTodos: () => void;
  todos: Todo[];
}

export const Header: React.FC<HeaderProps> = ({
  inputText,
  setInputText,
  handleAddTodo,
  loading,
  inputRef,
  toggleAllTodos,
  todos,
}) => {
  const allCompleted = todos.every(todo => todo.completed);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, inputRef]);

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      {todos.length !== 0 && (
        <button
          type="button"
          className={`todoapp__toggle-all ${allCompleted ? 'active' : ''}`}
          data-cy="ToggleAllButton"
          onClick={toggleAllTodos}
        />
      )}

      {/* Add a todo on form submit */}
      <form onSubmit={handleAddTodo}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={inputText}
          onChange={event => setInputText(event.target.value)}
          ref={inputRef}
          disabled={!!loading}
        />
      </form>
    </header>
  );
};
