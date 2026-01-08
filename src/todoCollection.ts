import { TodoItem } from './todoItem'

type ItemCount = {
  total: number
  incomplete: number
}
export class TodoCollection {
  private nextId: number = 1
  private itemMap = new Map<number, TodoItem>()

  public constructor(
    public userName: string,
    public todoItems: TodoItem[] = []
  ) {
    todoItems.forEach((item) => this.itemMap.set(item.id, item))
  }

  public addTodo(task: string): number {
    while (this.getTodoById(this.nextId)) {
      this.nextId++
    }
    this.itemMap.set(this.nextId, new TodoItem(this.nextId, task))

    return this.nextId
  }

  public getTodoItems(includeCompleted: boolean = false): TodoItem[] {
    return [...this.itemMap.values()].filter(
      (item) => includeCompleted || !item.complete
    )
  }

  public removeComplete(): void {
    this.itemMap.forEach((item) => {
      if (item.complete) this.itemMap.delete(item.id)
    })
  }

  getTodoById(id: number): TodoItem | undefined {
    return this.itemMap.get(id)
  }
 

  markComplete(id: number, complete: boolean): void {
    const todo = this.getTodoById(id)
    if (todo) {
      todo.complete = complete
    }
  }
 
  public getItemCounts(): ItemCount {
    return {
      total: this.itemMap.size,
      incomplete: this.getTodoItems(false).length,
    }
  }
}
