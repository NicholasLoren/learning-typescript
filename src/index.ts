import { TodoItem } from './todoItem'
import { TodoCollection } from './todoCollection'
import inquirer from 'inquirer'

const todos = [
  new TodoItem(1, 'Task 1'),
  new TodoItem(2, 'Task 2', true),
  new TodoItem(3, 'Task 3', true),
  new TodoItem(4, 'Task 4'),
  new TodoItem(5, 'Task 5'),
]

const collection = new TodoCollection('Nicholas Loren', todos)
let showCompleted = true

function displayTodoList(): void {
  console.log(
    `${collection.userName}'s Todo List, ${
      collection.getItemCounts().incomplete
    } items pending.`
  )
  collection.getTodoItems(showCompleted).forEach((item) => item.printDetails())
}

function promptAdd(): void {
  inquirer
    .prompt({
      type: 'input',
      name: 'task',
      message: 'Enter new task: ',
    })
    .then((answers) => {
      if (answers['task'].trim() !== '') {
        collection.addTodo(answers['task'])
      }
      promptUser()
    })
}

function promptComplete(): void {
  console.clear()
  inquirer
    .prompt({
      type: 'checkbox',
      name: 'tasks',
      message: 'Mark tasks complete',
      choices: collection.getTodoItems(showCompleted).map((item) => ({
        name: item.task,
        value: item.id,
        checked: item.complete,
      })),
    })
    .then((answers) => {
      let completedTasks = answers['tasks'] as number[]
      collection.getTodoItems(true).forEach((item) => {
        collection.markComplete(
          item.id,
          completedTasks.find((id) => id === item.id) != undefined
        )
      })

      promptUser()
    })
}

function purgeTasks(): void {}

enum Commands {
  Add = 'Add new task',
  Complete = 'Complete Task',
  Purge = 'Remove Completed Tasks',
  Toggle = 'Show/Hide Completed',
  Quit = 'Quit',
}

function promptUser(): void {
  console.clear()
  displayTodoList()

  inquirer
    .prompt({
      type: 'rawlist',
      name: 'command',
      message: 'Choose option',
      choices: Object.values(Commands),
    })
    .then((answers) => {
      switch (answers['command']) {
        case Commands.Toggle:
          showCompleted = !showCompleted
          promptUser()
          break
        case Commands.Add:
          promptAdd()
          break
        case Commands.Complete:
          collection.getItemCounts().incomplete > 0
            ? promptComplete()
            : promptUser()
          break
        case Commands.Purge:
          collection.removeComplete()
          promptUser()
          break
        case Commands.Quit:
          console.log('Goodbye!')
          break
      }
    })
}

promptUser()
