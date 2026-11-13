# FinanceTrack 💰

**FinanceTrack** es una aplicación web de gestión de finanzas personales que permite registrar, organizar y analizar ingresos y gastos mediante un panel de control interactivo.

El proyecto está desarrollado con una arquitectura Full Stack, utilizando React para la interfaz de usuario, Node.js y Express para el backend, y PostgreSQL para la persistencia de datos.

## 🚀 Características principales

- Registro de ingresos y gastos.
- Consulta del balance disponible.
- Edición y eliminación de transacciones.
- Búsqueda de transacciones por nombre.
- Filtrado por tipo de movimiento.
- Clasificación de gastos por categorías.
- Visualización de ingresos y gastos mediante gráficos.
- Persistencia de información en PostgreSQL.
- Validación de datos en el backend.
- API REST para la gestión de transacciones.

## 🛠️ Tecnologías utilizadas

### Frontend
- React 19
- JavaScript
- Vite
- HTML5
- CSS3

### Backend
- Node.js
- Express 5
- JavaScript
- API REST

### Base de datos
- PostgreSQL
- Librería `pg`

### Herramientas
- Git
- GitHub
- Visual Studio Code
- Prettier

## 🏗️ Arquitectura del proyecto

FinanceTrack utiliza una arquitectura cliente-servidor:

- **Frontend:** interfaz desarrollada en React.
- **Backend:** API REST construida con Node.js y Express.
- **Base de datos:** PostgreSQL para almacenar las transacciones.

### Estructura de carpetas

```text
financetrack/
│
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── test-db.js
│   ├── package.json
│   └── .env.example
│
├── src/
│   ├── services/
│   │   └── transactionService.js
│   ├── App.jsx
│   └── App.css
│
├── public/
├── index.html
├── package.json
└── README.md
```

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/estebanceballos1401/financetrack.git
```

### 2. Entrar en el proyecto

```bash
cd financetrack
```

### 3. Instalar dependencias del frontend

```bash
npm install
```

### 4. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 5. Configurar variables de entorno

Dentro de la carpeta `backend`, crear un archivo `.env` tomando como referencia `.env.example`.

Configurar las variables de conexión a PostgreSQL:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=financetrack
DB_PASSWORD=tu_contraseña
DB_PORT=5432
PORT=3000
```

**Importante:** reemplazar `tu_contraseña` por la contraseña local de PostgreSQL. No publicar el archivo `.env`.

### 6. Configurar la base de datos

Crear una base de datos llamada `financetrack` en PostgreSQL.

Después, ejecutar el script SQL ubicado en:

```text
database/schema.sql
```

Este script crea la tabla `transactions`, que almacena los ingresos y gastos registrados en la aplicación.

**Estructura de la tabla:**

- `id`: identificador único.
- `name`: nombre de la transacción.
- `type`: tipo de movimiento (`income` o `expense`).
- `amount`: importe de la transacción.
- `category`: categoría del movimiento.
- `created_at`: fecha de creación.

### 7. Iniciar el backend

Desde la carpeta `backend`:

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

### 8. Iniciar el frontend

Abrir otra terminal, regresar a la carpeta principal y ejecutar:

```bash
npm run dev
```

Vite estará disponible normalmente en:

```text
http://localhost:5173
```

## 🔌 API REST

La API permite gestionar las transacciones mediante los siguientes endpoints:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/transactions` | Consultar transacciones |
| POST | `/api/transactions` | Registrar una transacción |
| PUT | `/api/transactions/:id` | Actualizar una transacción |
| DELETE | `/api/transactions/:id` | Eliminar una transacción |

## 🧪 Validaciones implementadas

- Validación de campos obligatorios.
- Validación del tipo de transacción.
- Validación de importes positivos.
- Validación de identificadores.
- Control de registros inexistentes.
- Consultas SQL parametrizadas.

## 📌 Estado del proyecto

**En desarrollo.**

FinanceTrack es un proyecto de aprendizaje y portafolio profesional en constante evolución, enfocado en fortalecer habilidades de desarrollo Full Stack, integración de bases de datos y construcción de API REST.

## 👨‍💻 Autor

**Juan Esteban Ceballos Arévalo**

Ingeniero de Sistemas | Junior Full Stack Developer

- GitHub: https://github.com/estebanceballos1401