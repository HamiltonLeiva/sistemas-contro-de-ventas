const API_URL = 'http://localhost:3000/herramientas';

let editandoId = null;
const tablaBody = document.querySelector('#tablaHerramientas tbody');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const inputs = {
  nombre: document.getElementById('nombre'),
  precio: document.getElementById('precio'),
  marca: document.getElementById('marca'),
  stock: document.getElementById('stock')
};

cargarHerramientas();

btnGuardar.addEventListener('click', guardarHerramienta);
btnCancelar.addEventListener('click', cancelarEdicion);

async function cargarHerramientas() {
  try {
    const response = await fetch(API_URL);
    const herramientas = await response.json();
    mostrarHerramientas(herramientas);
  } catch (error) {
    console.error('Error al cargar:', error);
  }
}

function mostrarHerramientas(herramientas) {
  tablaBody.innerHTML = '';
  herramientas.forEach(herramienta => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${herramienta.id}</td>
      <td>${herramienta.nombre}</td>
      <td>${herramienta.precio}</td>
      <td>${herramienta.marca}</td>
      <td>${herramienta.stock}</td>
      <td class="acciones">
        <button onclick="editarHerramienta(${herramienta.id})">Editar</button>
        <button class="eliminar" onclick="eliminarHerramienta(${herramienta.id})">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });
}

async function guardarHerramienta() {
  const datos = {
    nombre: inputs.nombre.value,
    precio: parseFloat(inputs.precio.value),
    marca: inputs.marca.value,
    stock: parseInt(inputs.stock.value)
  };
  try {
    let response;
    if (editandoId === null) {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    } else {
      response = await fetch(`${API_URL}/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    }
    if (response.ok) {
      limpiarFormulario();
      cargarHerramientas();
    } else {
      alert('Error al guardar');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function editarHerramienta(id) {
  const filas = document.querySelectorAll('#tablaHerramientas tbody tr');
  let herramienta = null;
  for (let fila of filas) {
    if (parseInt(fila.cells[0].textContent) === id) {
      herramienta = {
        nombre: fila.cells[1].textContent,
        precio: fila.cells[2].textContent,
        marca: fila.cells[3].textContent,
        stock: fila.cells[4].textContent
      };
      break;
    }
  }
  if (herramienta) {
    inputs.nombre.value = herramienta.nombre;
    inputs.precio.value = herramienta.precio;
    inputs.marca.value = herramienta.marca;
    inputs.stock.value = herramienta.stock;
    editandoId = id;
    btnGuardar.textContent = 'Actualizar';
    btnCancelar.style.display = 'inline-block';
  }
}

function cancelarEdicion() {
  limpiarFormulario();
  editandoId = null;
  btnGuardar.textContent = 'Guardar';
  btnCancelar.style.display = 'none';
}

function limpiarFormulario() {
  inputs.nombre.value = '';
  inputs.precio.value = '';
  inputs.marca.value = '';
  inputs.stock.value = '';
}

async function eliminarHerramienta(id) {
  if (!confirm('¿Eliminar esta herramienta?')) return;
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) {
      cargarHerramientas();
    } else {
      alert('Error al eliminar');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}