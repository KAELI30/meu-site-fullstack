const TaskRepository = require('../repositories/TaskRepository');
const taskService = require('../services/taskService');

class TaskController {

  async create(req, res, next) {
    try {
      const task = await TaskRepository.create(req.body);
      return res.status(201).json(task);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const task = await TaskRepository.update(id, { title });

      if (!task) {
        return res.status(404).json({ error: 'Task não encontrada' });
      }

      return res.json(task);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const task = await TaskRepository.delete(id);

      if (!task) {
        return res.status(404).json({ error: 'Task não encontrada' });
      }

      return res.json({ message: 'Task deletada com sucesso' });
    } catch (error) {
      return next(error);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const tasks = await TaskRepository.getAll();
      return res.json(tasks);
    } catch (error) {
      return next(error);
    }
  }

  async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await taskService.updateTaskStatus(
        Number(id),
        status
      );

      return res.status(200).json(result);

    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TaskController();