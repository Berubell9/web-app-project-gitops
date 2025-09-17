import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    axios.get('http://localhost:5000/api/todos')
      .then(response => setTodos(response.data))
      .catch(error => console.error(error))
  }, [])

  const addTodo = async () => {
    if (newTodo) {
      await axios.post('http://localhost:5000/api/todos', { title: newTodo })
      setNewTodo('')
      window.location.reload() // Re-fetch todos after adding
    }
  }

  return (
    <div>
      <h1>Todo List</h1>
      <input 
        type="text" 
        value={newTodo} 
        onChange={e => setNewTodo(e.target.value)} 
        placeholder="New Todo"
      />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  )
}