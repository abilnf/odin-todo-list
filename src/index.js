import './index.css'

function TodoDate(day, month, year) {
  return { day, month, year, getDate: () => `${day.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}.${month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}.${year.toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false })}` }
}

const uiManager = (function () {
  document.querySelector('.project-selected').addEventListener('click', e => {
    todoManager.selectProject(null)
    updateTodos()
  })

  const closeDialogs = () => {
    document.querySelectorAll('.dialog-container input, .dialog-container textarea').forEach(field => field.value = '')
    document.querySelectorAll('.dialog-container').forEach(dialog => dialog.classList.add('dialog--hidden'))
  }

  const showNewProjectDialog = () => {
    document.querySelector('#new-project-dialog').classList.toggle('dialog--hidden')
  }
  const showNewTodoDialog = () => {
    const select = document.querySelector('#new-todo-project')
    select.querySelectorAll('option[data-project]').forEach(project => {
      select.removeChild(project)
    })
    select.querySelector('option').selected = true

    const template = document.querySelector('#new-todo-project-selector-template')
    for (let project of todoManager.getProjectNames()) {
      const clone = template.content.firstElementChild.cloneNode(true);
      clone.textContent = project
      clone.setAttribute('data-project', project)
      select.appendChild(clone)
    }

    document.querySelector('#new-todo-dialog').classList.toggle('dialog--hidden')
  }

  const updateProjects = () => {
    const sidebar = document.querySelector('#sidebar')
    sidebar.querySelectorAll('.project[data-project]').forEach(project => {
      sidebar.removeChild(project)
    })
    const template = document.querySelector('#project-template')
    const selected = todoManager.getCurrentProject()
    for (let project of todoManager.getProjectNames()) {
      const clone = template.content.firstElementChild.cloneNode(true);
      clone.querySelector('.project-name').textContent = project
      if (project === selected) {
        clone.querySelector('.project-selected').checked = true
      }
      clone.querySelector('.project-selected').addEventListener('click', e => {
        if (e.target.checked) {
          todoManager.selectProject(project)
          uiManager.updateTodos()
        }
      })
      sidebar.insertBefore(clone, sidebar.querySelector('.divider'))
    }
  }

  const updateTodos = () => {
    const todos = document.querySelector('#todos')
    document.querySelectorAll('#todos > *:not(template)').forEach(element => {
      todos.removeChild(element)
    })
    let date = null
    const template = document.querySelector('#todo-card-template')
    const dateTemplate = document.querySelector('#todo-date-template')
    for (let todo of todoManager.getTodos()) {
      if (JSON.stringify(date) !== JSON.stringify(todo.date)) {
        date = todo.date
        const clone = dateTemplate.content.firstElementChild.cloneNode(true);
        clone.textContent = date.getDate()
        todos.appendChild(clone)
      }

      const clone = template.content.firstElementChild.cloneNode(true);
      clone.addEventListener('click', e => {
        const area = clone.querySelector('.expandable-area')
        if (area.classList.contains('expandable-area--hidden')) {
          area.style.maxHeight = area.scrollHeight + "px";
        } else {
          area.style.maxHeight = null;
        }
        area.classList.toggle('expandable-area--hidden')
      })
      clone.querySelector('.todo-done-checkox').addEventListener('click', e => {
        e.stopPropagation()
      })
      clone.querySelector('.todo-done-checkox').addEventListener('change', e => {
        clone.classList.toggle('todo-card--done')
        todo.done = e.target.checked
        storageManager.saveProjects()
      })
      clone.querySelector('.todo-name').textContent = todo.name
      clone.querySelector('.todo-description').textContent = todo.description
      todos.appendChild(clone)
    }
  }

  return { showNewProjectDialog, showNewTodoDialog, closeDialogs, updateProjects, updateTodos }
})()


const storageManager = (function () {
  const saveProjects = () => {
    const projects = JSON.stringify(todoManager.getRawProjects())
    localStorage.projects = projects
  }

  const loadProjects = () => {
    const string = localStorage.projects
    if (string) {
      const projects = JSON.parse(string)
      for (let project of Object.values(projects)) {
        const newTodos = []
        for (let todo of project.todos) {
          todo.date = TodoDate(todo.date.day, todo.date.month, todo.date.year)
          if (!todo.done) newTodos.push(todo)
        }
        project.todos = newTodos
      }
      return projects
    } else {
      return {}
    }
  }

  return { saveProjects, loadProjects }
})()

const todoManager = (function (loadedProjects) {
  const projects = loadedProjects
  let currentProject = null

  function Project(name) {
    return { name, todos: [] }
  }

  function Todo(name, description, date) {
    return { name, description, date, done: false }
  }

  const addProject = (name) => {
    if (projects.hasOwnProperty(name)) return false
    projects[name] = Project(name)
    return true
  }

  const getProjectNames = () => {
    return Object.keys(projects)
  }

  const selectProject = (name) => {
    currentProject = name
  }

  const getCurrentProject = () => {
    return currentProject
  }

  const addTodo = (project, name, description, day, month, year) => {
    projects[project].todos.push(Todo(name, description, TodoDate(day, month, year)))
  }

  const getTodos = () => {
    let todos = (currentProject ? projects[currentProject].todos : Object.values(projects).map(project => project.todos).flat(1)).slice()
    todos.sort((a, b) =>
      (a.date.year * 10000 + a.date.month * 100 + a.date.day) - (b.date.year * 10000 + b.date.month * 100 + b.date.day))
    return todos
  }

  const getRawProjects = () => {
    return projects
  }

  return { addProject, getProjectNames, selectProject, getCurrentProject, addTodo, getTodos, getRawProjects }
})(storageManager.loadProjects())

document.querySelectorAll('.close-dialog').forEach(button => {
  button.addEventListener('click', uiManager.closeDialogs)
})

document.querySelector('#add-todo').addEventListener('click', e => {
  uiManager.showNewTodoDialog()
})

document.querySelector('#add-project').addEventListener('click', e => {
  uiManager.showNewProjectDialog()
})

document.querySelector('#confirm-new-project').addEventListener('click', e => {
  const title = document.querySelector('#new-project-title').value
  if (title) {
    if (todoManager.addProject(title)) {
      uiManager.closeDialogs()
      uiManager.updateProjects()
      storageManager.saveProjects()
    }
  }
})

document.querySelector('#confirm-new-todo').addEventListener('click', e => {
  const name = document.querySelector('#new-todo-name').value
  const date = document.querySelector('#new-todo-date').value
  const description = document.querySelector('#new-todo-description').value
  const project = document.querySelector('#new-todo-project').selectedOptions[0].getAttribute('data-project')
  if (name && date && description && project) {
    const today = new Date()
    const [year, month, day] = date.split('-').map(string => parseInt(string))
    if (!(year < today.getFullYear() || (year == today.getFullYear() && month < today.getMonth() + 1) || (year == today.getFullYear() && month == today.getMonth() + 1 && day < today.getDate()))) {
      todoManager.addTodo(project, name, description, day, month, year)
      uiManager.closeDialogs()
      uiManager.updateTodos()
      storageManager.saveProjects()
    }
  }
})

uiManager.updateProjects()
uiManager.updateTodos()