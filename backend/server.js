import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();

const PORT = process.env.PORT || 3000;

// Configuración del servidor
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json({ limit: '10kb' }));

// GET: Consultar transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY created_at DESC'
    );

    res.json({
      message: 'Listado de transacciones de FinanceTrack',
      transactions: result.rows,
    });
  } catch (error) {
    console.error('Error al consultar transacciones:', error);

    res.status(500).json({
      message: 'Error al obtener las transacciones',
    });
  }
});

// POST: Registrar transacciones
app.post('/api/transactions', async (req, res) => {
  const { name, type, amount, category } = req.body;

  // Validar los campos recibidos
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 150 ||
    typeof type !== 'string' ||
    !['income', 'expense'].includes(type) ||
    typeof category !== 'string' ||
    !category.trim() ||
    category.trim().length > 100 ||
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return res.status(400).json({
      message: 'Los datos de la transacción no son válidos',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (name, type, amount, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), type, amount, category.trim()]
    );

    res.status(201).json({
      message: 'Transacción registrada correctamente',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('Error al registrar transacción:', error);

    res.status(500).json({
      message: 'Error al registrar la transacción',
    });
  }
});

// PUT: Actualizar transacciones
app.put('/api/transactions/:id', async (req, res) => {
  const transactionId = Number(req.params.id);

  // Validar el identificador
  if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      message: 'El ID de la transacción no es válido',
    });
  }

  const { name, type, amount, category } = req.body;

  // Validar los datos recibidos
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 150 ||
    typeof type !== 'string' ||
    !['income', 'expense'].includes(type) ||
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof category !== 'string' ||
    !category.trim() ||
    category.trim().length > 100
  ) {
    return res.status(400).json({
      message: 'Los datos de la transacción no son válidos',
    });
  }

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET name = $1, type = $2, amount = $3, category = $4
       WHERE id = $5
       RETURNING *`,
      [name.trim(), type, amount, category.trim(), transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Transacción no encontrada',
      });
    }

    res.json({
      message: 'Transacción actualizada correctamente',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar transacción:', error);

    res.status(500).json({
      message: 'Error al actualizar la transacción',
    });
  }
});

// DELETE: Eliminar transacciones
app.delete('/api/transactions/:id', async (req, res) => {
  const transactionId = Number(req.params.id);

  // Validar el identificador
  if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      message: 'El ID de la transacción no es válido',
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM transactions
       WHERE id = $1
       RETURNING *`,
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Transacción no encontrada',
      });
    }

    res.json({
      message: 'Transacción eliminada correctamente',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);

    res.status(500).json({
      message: 'Error al eliminar la transacción',
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
