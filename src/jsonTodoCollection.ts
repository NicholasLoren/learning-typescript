import { TodoCollection } from './todoCollection'
import { TodoItem } from './todoItem'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

/**
 * This defines the exact shape of the JSON file.
 * TypeScript will enforce this structure everywhere.
 */
type Schema = {
  tasks: {
    id: number
    task: string
    complete: boolean
  }[]
}

export class JsonTodoCollection extends TodoCollection {
  /**
   * Low<Schema> means:
   * - this.db.data MUST match the Schema type
   */
  private db: Low<Schema>

  /**
   * The constructor MUST stay synchronous.
   * Only lightweight setup is allowed here.
   */
  constructor(public userName: string, todoItems: TodoItem[] = []) {
    super(userName, todoItems)

    // JSONFile is the adapter that reads/writes Tasks.json
    const adapter = new JSONFile<Schema>('Tasks.json')

    // Initial data is required (used if file does not exist)
    this.db = new Low(adapter, { tasks: [] })
  }

  /**
   * This method performs async work:
   * - reading from disk
   * - populating the in-memory collection
   */
  async init(): Promise<void> {
    // Load data from Tasks.json into this.db.data
    await this.db.read()

    // If the JSON file already has tasks
    if (this.db.data!.tasks.length > 0) {
      this.db.data!.tasks.forEach((dbItem) => {
        // Convert plain JSON objects into TodoItem instances
        this.itemMap.set(
          dbItem.id,
          new TodoItem(dbItem.id, dbItem.task, dbItem.complete)
        )
      })
    } else {
      /**
       * The JSON file was empty.
       * We initialize it using the TodoItems that already exist
       * in the in-memory Map (itemMap).
       */

      this.db.data!.tasks = [...this.itemMap.values()].map((item) => ({
        id: item.id,
        task: item.task,
        complete: item.complete,
      }))

      /**
       * Persist the initialized data to Tasks.json
       */
      await this.db.write()
    }
  }
  private async storeTasks(): Promise<void> {
    this.db.data!.tasks = [...this.itemMap.values()]
    await this.db.write()
  }

  addTodo(task: string): number {
      let result = super.addTodo(task)
      this.storeTasks();
      return result;
  }

  markComplete(id: number, complete: boolean): void {
      super.markComplete(id,complete)
      this.storeTasks()
  }

  removeComplete(){
    super.removeComplete()
    this.storeTasks()
  }
}
