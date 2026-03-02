const pool = require('../config/database')

const allowedTransitions = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
}

async function updateTaskStatus(taskId, newStatus) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Buscar tarefa com lock
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE id = $1 FOR UPDATE',
      [taskId]
    )

    const task = taskResult.rows[0]

    if (!task) {
      const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    const currentStatus = task.status

    // Validar transição
    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      const error = new Error(
        `Invalid transition from ${currentStatus} to ${newStatus}`
        )
error.statusCode = 409
throw error
    }

    // Atualizar status
    const updateResult = await client.query(
  `UPDATE tasks
   SET status = $1,
       updated_at = CURRENT_TIMESTAMP
   WHERE id = $2
   RETURNING *`,
  [newStatus, taskId]
)

const updatedTask = updateResult.rows[0]

// Inserir histórico
await client.query(
  `INSERT INTO task_status_history
   (task_id, old_status, new_status)
   VALUES ($1, $2, $3)`,
  [taskId, currentStatus, newStatus]
)

await client.query('COMMIT')

return updatedTask

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { updateTaskStatus }