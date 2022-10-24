import EventEmitter from 'events'

export class TaskQueue<TData> {
  running: number = 0
  concurrency: number
  queue: Array<() => Promise<TData>> = []
  emitter: EventEmitter

  constructor(concurrency: number) {
    this.concurrency = concurrency
    this.emitter = new EventEmitter()
  }

  push(task: () => Promise<TData>) {
    this.queue.push(task)
    this.next()
  }

  async next() {
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()
      if (!task) return
      this.running++
      await task()
      this.running--
      if (this.running === 0 && this.queue.length === 0) {
        this.emitter.emit('done')
      }
      this.next()
    }
  }
}
