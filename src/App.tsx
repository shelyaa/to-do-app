import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  USER_ID,
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { Filter } from './types/Filter';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TodoItem } from './components/TodoItem';
import { ErrorType, errorMessages } from './types/ErrorMessages';

const filterTodos = (todos: Todo[], filter: Filter): Todo[] => {
  switch (filter) {
    case Filter.active:
      return todos.filter(todo => !todo.completed);
    case Filter.completed:
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<ErrorType | null>(null);
  const [filter, setFilter] = useState<Filter>(Filter.all);
  const [inputText, setInputText] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTodos = () => {
    setLoading(true);
    getTodos()
      .then(setTodos)
      .catch(() => setError('load'))
      .finally(() => setLoading(false)); // Finish loading
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [error]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = filterTodos(todos, filter);

  const handleAddTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = inputText.trim();

    if (trimmedTitle === '') {
      setError('empty');

      return;
    }

    const newTodo: Omit<Todo, 'id'> = {
      title: trimmedTitle,
      userId: USER_ID,
      completed: false,
    };

    setTempTodo({
      id: 0,
      title: trimmedTitle,
      userId: USER_ID,
      completed: false,
    });

    setLoadingId(0);

    createTodo(newTodo)
      .then(createdTodo => {
        setTodos(prevTodos => [...prevTodos, createdTodo]);
        setTempTodo(null);
        setInputText('');
        setLoadingId(null);
      })
      .catch(() => {
        setError('add');
        setInputText(trimmedTitle);
        setTempTodo(null);
        setLoadingId(null);
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteTodo = (id: number) => {
    setLoadingId(id);
    deleteTodo(id)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        if (inputRef.current) {
          inputRef.current.focus();
        }
      })
      .catch(() => setError('delete'))
      .finally(() => setLoadingId(null));
  };

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => {
      deleteTodo(todo.id)
        .then(() => {
          setTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
          if (inputRef.current) {
            inputRef.current.focus();
          }
        })
        .catch(() => setError('delete'));
    });
  };

  const toggleAllTodos = () => {
    setIsUpdating(true);

    const allCompleted = todos.every(todo => todo.completed);
    const todosToUpdate = allCompleted
      ? todos
      : todos.filter(todo => !todo.completed);

    const idsToUpdate = todosToUpdate.map(todo => todo.id);

    setLoadingIds(idsToUpdate);

    Promise.all(
      todosToUpdate.map(todo =>
        updateTodo(todo.id, { completed: !allCompleted }),
      ),
    )
      .then(fetchTodos)
      .catch(() => setError('update'))
      .finally(() => {
        setIsUpdating(false);
        setLoadingIds([]);
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          inputText={inputText}
          setInputText={setInputText}
          handleAddTodo={handleAddTodo}
          loading={loading || loadingId !== null}
          inputRef={inputRef}
          toggleAllTodos={toggleAllTodos}
          todos={todos}
        />

        <TodoList
          filteredTodos={filteredTodos}
          handleDeleteTodo={handleDeleteTodo}
          loadingId={loadingId}
          loading={loading}
          setError={setError}
          fetchTodos={fetchTodos}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          setLoadingId={setLoadingId}
          loadingIds={loadingIds}
        />

        {tempTodo && (
          <div className="todoapp__temp-todo">
            <TodoItem
              todo={tempTodo}
              handleDeleteTodo={handleDeleteTodo}
              loadingId={0}
              loading={true}
              setError={setError}
              fetchTodos={fetchTodos}
              isUpdating={isUpdating}
              setIsUpdating={setIsUpdating}
              setLoadingId={setLoadingId}
              loadingIds={loadingIds}
            />
          </div>
        )}

        {todos.length > 0 && (
          <Footer
            todos={todos}
            setFilter={setFilter}
            filter={filter}
            handleClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${error ? '' : 'hidden'}`}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {Object.values(errorMessages)
          .filter(msg => errorMessages[error as ErrorType] === msg)
          .map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
      </div>
    </div>
  );
};
