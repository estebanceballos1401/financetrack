const API_URL = 'http://localhost:3000/api/transactions';

// Obtener todas las transacciones
export async function getTransactions() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('No se pudieron obtener las transacciones');
  }

  const data = await response.json();

  return data.transactions;
}

// Crear una nueva transacción
export async function createTransaction(transaction) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error('No se pudo registrar la transacción');
  }

  const data = await response.json();

  return data.transaction;
}

// Actualizar una transacción existente
export async function updateTransaction(id, transaction) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error('No se pudo actualizar la transacción');
  }

  const data = await response.json();

  return data.transaction;
}

// Eliminar una transacción
export async function deleteTransaction(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('No se pudo eliminar la transacción');
  }

  return true;
}
