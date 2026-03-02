const express = require("express");
const router = express.Router();
const pool = require('../config/database');
const validateTask = require('../middlewares/validateTask');
const TaskRepository = require('../repositories/TaskRepository');
const TaskController = require('../controllers/TaskController');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const authenticate = require('../middlewares/authMiddleware')
const authorize = require('../middlewares/roleMiddleware')

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if(username !== 'admin' || password !== '1234'){
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = jwt.sign(
    { id: 1, username: 'admin' },
    'segredo_super_secreto',
    { expiresIn: '1h' }
  );

  res.json({ token });
});

router.get('/admin/tasks',
  authenticate,
  authorize('ADMIN'),
  TaskController.getAllTasks
)

router.use(authMiddleware);

router.patch('/tasks/:id/status', TaskController.updateTaskStatus)

router.get('/tasks',authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
});

router.post('/tasks', authMiddleware, validateTask, TaskController.create);

router.put('/tasks/:id', authMiddleware,async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;


  if (!title || title.trim() === ''){
    return res.status(400).json({ error: 'Title é obrigatório'});
  }
  try {
    const task = await TaskRepository.update(id, { title });

    if(!task){
      return res.status(404).json({error: 'Task não encontrada'});
    }

  
  res.json(task);
  } catch (error) {
  console.error('ERRO REAL DO PUT:', error);
  res.status(500).json({ error: 'Erro ao atualizar task' });
}
});

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed deve ser boolean' });
  }

  try {
    const task = await TaskRepository.updateCompleted(Number(id), { completed });

    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    res.json(task);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status da task' });
  }
});

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try{
    const task = await TaskRepository.delete(id);

    if(!task){
      return res.status(404).json({error: 'Task não econtrada'});
    }
    res.json({message: 'Task deletada com sucesso'});
  } catch(error){
    res.status(500).json({error: 'Erro ao deletar task'});
  }
});

module.exports = router;