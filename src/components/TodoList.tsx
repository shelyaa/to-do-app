import { ErrorType } from '../types/ErrorMessages';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  filteredTodos: Todo[];
  loadingId: number | null;
  handleDeleteTodo: (id: number) => void;
  loading: boolean;
  setError: (errorType: ErrorType | null) => void;
  fetchTodos: () => void;
  setIsUpdating: (updating: boolean) => void;
  isUpdating: boolean;
  setLoadingId: (id: number | null) => void;
  loadingIds: number[];
}

export const TodoList: React.FC<TodoListProps> = ({
  filteredTodos,
  loadingId,
  handleDeleteTodo,
  setError,
  fetchTodos,
  isUpdating,
  setIsUpdating,
  setLoadingId,
  loadingIds,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          fetchTodos={fetchTodos}
          handleDeleteTodo={handleDeleteTodo}
          loadingId={loadingId}
          loading={false}
          setError={setError}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          setLoadingId={setLoadingId}
          loadingIds={loadingIds}
        />
      ))}
    </section>
  );
};
