import { useState, useEffect } from 'react';
import './App.css';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './services/transactionService';

// Tarjetas financieras
function SummaryCard({ title, amount, description, symbol, color }) {
  return (
    <div className="summary-card">
      <div className="card-top">
        <span>{title}</span>
        <span className={`card-icon ${color}`}>{symbol}</span>
      </div>

      <h2>{amount}</h2>
      <p>{description}</p>
    </div>
  );
}

// Función para convertir números en pesos colombianos
function formatMoney(value) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function App() {
  // Estados de la aplicación

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Consultar transacciones desde el backend
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const transactionsData = await getTransactions();

        setTransactions(
          transactionsData.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount),
            date: new Date(transaction.created_at).toLocaleDateString('es-CO'),
          }))
        );
      } catch (error) {
        console.error('Error al consultar transacciones:', error);
        setError('No fue posible conectar con el servidor');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Alimentación');

  // Categorías disponibles según el tipo de movimiento
  const categories =
    type === 'income'
      ? ['Ingresos', 'Salario', 'Trabajo freelance', 'Otros']
      : ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Otros'];
  const [editingId, setEditingId] = useState(null);

  const [errors, setErrors] = useState({});

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Calcular ingresos
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0);

  // Calcular gastos
  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);

  // Calcular saldo disponible
  const balance = income - expenses;

  // Agrupar gastos por categoría
  const expensesByCategory = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      const category = transaction.category;

      accumulator[category] = (accumulator[category] || 0) + transaction.amount;

      return accumulator;
    }, {});

  // Convertir las categorías en una lista
  const categoryEntries = Object.entries(expensesByCategory);

  // Obtener el gasto más alto
  const maxCategoryExpense = Math.max(
    ...categoryEntries.map((item) => item[1]),
    1
  );

  // Calcular el valor máximo para la gráfica
  const maxValue = Math.max(income, expenses, 1);

  // Calcular porcentajes
  const incomePercentage = (income / maxValue) * 100;
  const expensesPercentage = (expenses / maxValue) * 100;

  // Filtrar movimientos
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || transaction.type === filterType;

    return matchesSearch && matchesType;
  });
  // Validar los datos del formulario
  function validateForm() {
    const newErrors = {};
    const numericAmount = Number(amount);

    if (!name.trim()) {
      newErrors.name = 'El concepto es obligatorio.';
    }

    if (!amount || !Number.isFinite(numericAmount)) {
      newErrors.amount = 'Ingresa un valor numérico válido.';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'El valor debe ser mayor que cero.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // Registrar o actualizar un movimiento
  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const numericAmount = Number(amount);
    const isEditing = editingId !== null;

    try {
      setError('');

      let savedTransaction;

      if (isEditing) {
        savedTransaction = await updateTransaction(editingId, {
          name: name.trim(),
          type,
          amount: numericAmount,
          category,
        });
      } else {
        savedTransaction = await createTransaction({
          name: name.trim(),
          type,
          amount: numericAmount,
          category,
        });
      }

      const normalizedTransaction = {
        ...savedTransaction,
        amount: Number(savedTransaction.amount),
        date: new Date(savedTransaction.created_at).toLocaleDateString('es-CO'),
      };

      if (isEditing) {
        setTransactions((previousTransactions) =>
          previousTransactions.map((transaction) =>
            String(transaction.id) === String(normalizedTransaction.id)
              ? normalizedTransaction
              : transaction
          )
        );
      } else {
        setTransactions((previousTransactions) => [
          normalizedTransaction,
          ...previousTransactions,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error('Error al guardar la transacción:', error);
      setError(error.message || 'No fue posible conectar con el servidor');
    }
  }

  // Limpiar el formulario
  function resetForm() {
    setName('');
    setAmount('');
    setType('expense');
    setCategory('Alimentación');
    setEditingId(null);
    setErrors({});
  }

  // Cargar los datos de una transacción
  function handleEdit(transaction) {
    setErrors({});
    setEditingId(transaction.id);
    setName(transaction.name);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setCategory(transaction.category);

    document.getElementById('nuevo')?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  // Eliminar un movimiento
  async function handleDelete(id) {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar este movimiento?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await deleteTransaction(id);

      setTransactions((previousTransactions) =>
        previousTransactions.filter(
          (transaction) => String(transaction.id) !== String(id)
        )
      );

      if (String(editingId) === String(id)) {
        resetForm();
      }
    } catch (error) {
      console.error('Error al eliminar el movimiento:', error);
      setError(error.message || 'No fue posible conectar con el servidor');
    }
  }

  return (
    <div className="dashboard">
      {/* Menú lateral */}
      <aside className="sidebar">
        <h2 className="logo">
          Finance<span>Track</span>
        </h2>

        <p className="menu-title">MENÚ PRINCIPAL</p>

        <nav>
          <a className="active" href="#inicio">
            ▦ Dashboard
          </a>
          <a href="#movimientos">↔ Movimientos</a>
          <a href="#nuevo">＋ Nuevo movimiento</a>
        </nav>

        <div className="sidebar-bottom">
          <p>Tu dinero, bajo control.</p>
          <span>FinanceTrack v1.0</span>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        {loading && <p>Cargando transacciones...</p>}
        {error && <p role="alert">{error}</p>}
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Bienvenido a tu panel financiero.</p>
          </div>

          <div className="user-profile">
            <div className="avatar">E</div>
            <span>Mi cuenta</span>
          </div>
        </header>

        <section className="welcome" id="inicio">
          <div>
            <h2>¡Hola! Bienvenido 👋</h2>
            <p>Este es el resumen de tus finanzas personales.</p>
          </div>

          <span className="date">
            {new Date().toLocaleDateString('es-CO', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </section>

        {/* Resumen financiero */}
        <section className="summary-grid">
          <SummaryCard
            title="Balance disponible"
            amount={formatMoney(balance)}
            description="Tu dinero disponible"
            symbol="$"
            color="purple"
          />

          <SummaryCard
            title="Ingresos"
            amount={formatMoney(income)}
            description="Total de ingresos"
            symbol="↗"
            color="green"
          />

          <SummaryCard
            title="Gastos"
            amount={formatMoney(expenses)}
            description="Total de gastos"
            symbol="↘"
            color="red"
          />
        </section>

        {/* Gráfica financiera */}
        <section className="transactions chart-section">
          <div className="section-header">
            <div>
              <h2>Ingresos vs. gastos</h2>
              <p>Comparación de tu actividad financiera.</p>
            </div>
          </div>

          <div className="chart-content">
            <div className="chart-item">
              <div className="chart-label">
                <span>Ingresos</span>
                <strong>{formatMoney(income)}</strong>
              </div>

              <div className="chart-track">
                <div
                  className="chart-bar income-bar"
                  style={{ width: `${incomePercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="chart-item">
              <div className="chart-label">
                <span>Gastos</span>
                <strong>{formatMoney(expenses)}</strong>
              </div>

              <div className="chart-track">
                <div
                  className="chart-bar expense-bar"
                  style={{ width: `${expensesPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Distribución de gastos por categoría */}
        <section className="transactions">
          <div className="section-header">
            <div>
              <h2>Gastos por categoría</h2>
              <p>Descubre en qué estás utilizando tu dinero.</p>
            </div>
          </div>

          <div className="category-chart">
            {categoryEntries.length === 0 ? (
              <p className="empty-message">
                Todavía no tienes gastos registrados.
              </p>
            ) : (
              categoryEntries
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                  const percentage = (amount / maxCategoryExpense) * 100;

                  return (
                    <div className="category-item" key={category}>
                      <div className="category-info">
                        <span>{category}</span>
                        <strong>{formatMoney(amount)}</strong>
                      </div>

                      <div className="category-track">
                        <div
                          className="category-bar"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </section>

        {/* Formulario de movimientos */}
        <section className="transactions" id="nuevo">
          <div className="section-header">
            <div>
              <h2>
                {editingId !== null
                  ? 'Editar movimiento'
                  : 'Registrar movimiento'}
              </h2>

              <p>
                {editingId !== null
                  ? 'Modifica los datos y guarda los cambios.'
                  : 'Agrega un nuevo ingreso o gasto.'}
              </p>
            </div>
          </div>

          <form className="movement-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Concepto</label>

              <input
                required
                type="text"
                placeholder="Ej. Compra de mercado"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    name: '',
                  }));
                }}
              />

              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label>Tipo de movimiento</label>

              <select
                value={type}
                onChange={(event) => {
                  const newType = event.target.value;

                  setType(newType);

                  setCategory(
                    newType === 'income' ? 'Ingresos' : 'Alimentación'
                  );
                }}
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>

            <div className="form-group">
              <label>Categoría</label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Valor en pesos</label>

              <input
                required
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 150000"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    amount: '',
                  }));
                }}
              />

              {errors.amount && (
                <p className="error-message">{errors.amount}</p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="add-button">
                {editingId !== null
                  ? 'Guardar cambios'
                  : '+ Agregar movimiento'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Tabla de movimientos */}
        <section className="transactions" id="movimientos">
          <div className="section-header">
            <div>
              <h2>Últimos movimientos</h2>
              <p>Consulta tus operaciones recientes.</p>
            </div>
          </div>

          {/* Buscador y filtros */}
          <div className="movement-filters">
            <input
              type="text"
              placeholder="Buscar movimiento..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              <option value="all">Todos los movimientos</option>
              <option value="income">Solo ingresos</option>
              <option value="expense">Solo gastos</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.name}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.date}</td>

                    <td>
                      <span className={`status ${transaction.type}`}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>

                    <td className={transaction.type}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatMoney(transaction.amount)}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(transaction)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
