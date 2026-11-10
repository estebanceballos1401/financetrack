import { useState, useEffect } from 'react';
import './App.css';

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

// Datos iniciales
const initialTransactions = [
  {
    id: 1,
    name: 'Salario',
    category: 'Ingresos',
    date: '09 Nov 2026',
    amount: 2500000,
    type: 'income',
  },
  {
    id: 2,
    name: 'Alimentación',
    category: 'Comida',
    date: '08 Nov 2026',
    amount: 150000,
    type: 'expense',
  },
  {
    id: 3,
    name: 'Transporte',
    category: 'Movilidad',
    date: '07 Nov 2026',
    amount: 80000,
    type: 'expense',
  },
  {
    id: 4,
    name: 'Trabajo freelance',
    category: 'Ingresos',
    date: '06 Nov 2026',
    amount: 450000,
    type: 'income',
  },
];

function App() {
  // Estados de la aplicación
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');

    return savedTransactions
      ? JSON.parse(savedTransactions)
      : initialTransactions;
  });

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Alimentación');

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

  // Guardar movimientos automáticamente
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Registrar un nuevo movimiento
  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || Number(amount) <= 0) {
      alert('Ingresa un concepto y un valor válido.');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      name: name.trim(),
      category: category,
      date: new Date().toLocaleDateString('es-CO'),
      amount: Number(amount),
      type: type,
    };

    setTransactions((previousTransactions) => [
      newTransaction,
      ...previousTransactions,
    ]);

    // Limpiar el formulario
    setName('');
    setAmount('');
    setType('expense');
    setCategory('Alimentación');
  }

  // Eliminar un movimiento
  function handleDelete(id) {
    const confirmDelete = window.confirm(
      '¿Estás seguro de eliminar este movimiento?'
    );

    if (!confirmDelete) {
      return;
    }

    setTransactions((previousTransactions) =>
      previousTransactions.filter((transaction) => transaction.id !== id)
    );
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
              <h2>Registrar movimiento</h2>
              <p>Agrega un nuevo ingreso o gasto.</p>
            </div>
          </div>

          <form className="movement-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Concepto</label>

              <input
                type="text"
                placeholder="Ej. Compra de mercado"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tipo de movimiento</label>

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
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
                <option>Alimentación</option>
                <option>Transporte</option>
                <option>Vivienda</option>
                <option>Entretenimiento</option>
                <option>Salario</option>
                <option>Otros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valor en pesos</label>

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 150000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>

            <button type="submit" className="add-button">
              + Agregar movimiento
            </button>
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
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Eliminar
                      </button>
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
