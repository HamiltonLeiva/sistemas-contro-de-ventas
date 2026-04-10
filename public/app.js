const baseUrl = '';

const api = {
  async get(path) {
    const res = await fetch(baseUrl + path);
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json();
  },
  async send(path, method, body) {
    const res = await fetch(baseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await readErrorMessage(res) || 'Error en la operación');
    const contentType = res.headers.get('content-type') || '';
    return contentType.includes('application/json') ? res.json() : null;
  },
  delete(path) { return this.send(path, 'DELETE'); },
  // Clientes
  getClientes() { return this.get('/api/clientes'); },
  createCliente(data) { return this.send('/api/clientes', 'POST', data); },
  updateCliente(id, data) { return this.send(`/api/clientes/${id}`, 'PUT', data); },
  deleteCliente(id) { return this.delete(`/api/clientes/${id}`); },
  // Productos
  getProductos() { return this.get('/api/productos'); },
  createProducto(data) { return this.send('/api/productos', 'POST', data); },
  updateProducto(id, data) { return this.send(`/api/productos/${id}`, 'PUT', data); },
  deleteProducto(id) { return this.delete(`/api/productos/${id}`); },
  // Ventas
  getVentas() { return this.get('/api/ventas'); },
  createVenta(data) { return this.send('/api/ventas', 'POST', data); },
  // Stats
  getSummary() { return this.get('/api/stats/summary'); },
  getSalesByDay() { return this.get('/api/stats/sales-by-day'); },
  getPaymentBreakdown() { return this.get('/api/stats/payment-breakdown'); },
};

const state = {
  clientes: [],
  productos: [],
  ventas: [],
  detalleVenta: [],
  charts: { line: null, pie: null }
};

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const euro = (n) => `€${Number(n || 0).toFixed(2)}`;
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const readErrorMessage = async (res) => {
  try {
    const data = await res.json();
    return data.error || data.message || 'Error en la operación';
  } catch {
    try {
      return await res.text();
    } catch {
      return 'Error en la operación';
    }
  }
};
let busyRequests = 0;
const setBusy = (isBusy) => {
  busyRequests += isBusy ? 1 : -1;
  if (busyRequests < 0) busyRequests = 0;
  qs('body').classList.toggle('is-busy', busyRequests > 0);
};
const withBusy = async (task) => {
  setBusy(true);
  try {
    return await task();
  } finally {
    setBusy(false);
  }
};
const toast = (msg, isError = false) => {
  const el = qs('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.style.background = isError ? '#dc2626' : 'var(--primary)';
  setTimeout(() => el.classList.add('hidden'), 2500);
};

// Navegación
qsa('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    qsa('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    qs('#section-title').textContent = btn.textContent;
    qsa('.section').forEach(s => s.classList.remove('active'));
    qs(`#${section}`).classList.add('active');
  });
});

// Dashboard
async function loadDashboard() {
  try {
    const summary = await api.getSummary();
    qs('#kpi-ingresos').textContent = euro(summary.ingresos_totales);
    qs('#kpi-ventas').textContent = summary.total_ventas;
    qs('#kpi-productos').textContent = summary.total_productos;
    qs('#kpi-clientes').textContent = summary.total_clientes;

    const sales = await api.getSalesByDay();
    const labels = sales.map(r => new Date(r.fecha).toLocaleDateString());
    const data = sales.map(r => r.total);

    const payments = await api.getPaymentBreakdown();
    const pieLabels = payments.map(p => p.metodo_pago);
    const pieData = payments.map(p => p.total);

    renderLineChart(labels, data);
    renderPieChart(pieLabels, pieData);
  } catch (err) {
    console.error(err);
    qs('#kpi-ingresos').textContent = euro(0);
    qs('#kpi-ventas').textContent = '0';
    qs('#kpi-productos').textContent = '0';
    qs('#kpi-clientes').textContent = '0';
    toast('No se pudo cargar el dashboard', true);
  }
}

function renderLineChart(labels, data) {
  const ctx = qs('#chart-line');
  if (state.charts.line) state.charts.line.destroy();
  state.charts.line = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Ventas', data, borderColor: '#6366f1', tension: 0.3 }] },
    options: { plugins: { legend: { display: false } } }
  });
}

function renderPieChart(labels, data) {
  const ctx = qs('#chart-pie');
  if (state.charts.pie) state.charts.pie.destroy();
  state.charts.pie = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: ['#2563eb', '#10b981', '#f59e0b'] }] }
  });
}

// Productos
async function loadProductos() {
  try {
    state.productos = await api.getProductos();
  } catch (err) {
    console.error(err);
    state.productos = [];
    toast('No se pudieron cargar los productos', true);
  }
  renderProductos();
  fillProductoSelect();
}

function renderProductos() {
  const term = qs('#buscar-producto').value?.toLowerCase() || '';
  const tbody = qs('#tabla-productos tbody');
  tbody.innerHTML = '';
  state.productos
    .filter(p => p.nombre.toLowerCase().includes(term) || (p.categoria || '').toLowerCase().includes(term))
    .forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(p.nombre)}</td>
        <td>${escapeHtml(p.categoria || '')}</td>
        <td>${euro(p.precio)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="secondary" data-action="edit" data-id="${p.id}">Editar</button>
          <button class="ghost" data-action="del" data-id="${p.id}">Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });
}

async function saveProducto() {
  const id = qs('#producto-id').value;
  const payload = {
    nombre: qs('#producto-nombre').value,
    descripcion: qs('#producto-descripcion').value,
    categoria: qs('#producto-categoria').value,
    precio: Number(qs('#producto-precio').value),
    stock: Number(qs('#producto-stock').value)
  };
  try {
    await withBusy(async () => {
      if (id) await api.updateProducto(id, payload); else await api.createProducto(payload);
      await loadProductos();
    });
    toast('Producto guardado');
    toggleProductoForm(true);
  } catch (err) {
    toast(err.message || 'No se pudo guardar el producto', true);
  }
}

function toggleProductoForm(hide = false) {
  const form = qs('#producto-form');
  if (hide) form.classList.add('hidden'); else form.classList.remove('hidden');
  if (hide) {
    qs('#producto-id').value = '';
    qs('#producto-nombre').value = '';
    qs('#producto-descripcion').value = '';
    qs('#producto-categoria').value = '';
    qs('#producto-precio').value = '';
    qs('#producto-stock').value = '';
  }
}

qs('#btn-nuevo-producto').addEventListener('click', () => toggleProductoForm());
qs('#btn-cancelar-producto').addEventListener('click', () => toggleProductoForm(true));
qs('#btn-guardar-producto').addEventListener('click', saveProducto);
qs('#buscar-producto').addEventListener('input', renderProductos);
qs('#tabla-productos').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const producto = state.productos.find(p => p.id == id);
  if (!producto) return;
  if (action === 'edit') {
    qs('#producto-id').value = producto.id;
    qs('#producto-nombre').value = producto.nombre;
    qs('#producto-descripcion').value = producto.descripcion || '';
    qs('#producto-categoria').value = producto.categoria || '';
    qs('#producto-precio').value = producto.precio;
    qs('#producto-stock').value = producto.stock;
    toggleProductoForm();
  } else if (action === 'del') {
    if (confirm('¿Eliminar producto?')) {
      try {
        await withBusy(async () => {
          await api.deleteProducto(id);
          await loadProductos();
        });
        toast('Producto eliminado');
      } catch (err) {
        toast(err.message || 'No se pudo eliminar el producto', true);
      }
    }
  }
});

function fillProductoSelect() {
  const sel = qs('#venta-producto');
  if (!state.productos.length) {
    sel.innerHTML = '<option value="">No hay productos disponibles</option>';
    qs('#btn-add-item').disabled = true;
    return;
  }

  qs('#btn-add-item').disabled = false;
  sel.innerHTML = state.productos.map(p => `<option value="${p.id}">${escapeHtml(p.nombre)} (Stock: ${p.stock})</option>`).join('');
}

// Clientes
async function loadClientes() {
  try {
    state.clientes = await api.getClientes();
  } catch (err) {
    console.error(err);
    state.clientes = [];
    toast('No se pudieron cargar los clientes', true);
  }
  renderClientes();
  fillClienteSelect();
}

function renderClientes() {
  const term = qs('#buscar-cliente').value?.toLowerCase() || '';
  const tbody = qs('#tabla-clientes tbody');
  tbody.innerHTML = '';
  state.clientes
    .filter(c => c.nombre.toLowerCase().includes(term) || (c.correo || '').toLowerCase().includes(term))
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(c.nombre)}</td>
        <td>${escapeHtml(c.correo || '')}</td>
        <td>${escapeHtml(c.telefono || '')}</td>
        <td>${escapeHtml(c.direccion || '')}</td>
        <td>
          <button class="secondary" data-action="edit" data-id="${c.id}">Editar</button>
          <button class="ghost" data-action="del" data-id="${c.id}">Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });
}

async function saveCliente() {
  const id = qs('#cliente-id').value;
  const payload = {
    nombre: qs('#cliente-nombre').value,
    correo: qs('#cliente-correo').value,
    telefono: qs('#cliente-telefono').value,
    direccion: qs('#cliente-direccion').value
  };
  try {
    await withBusy(async () => {
      if (id) await api.updateCliente(id, payload); else await api.createCliente(payload);
      await loadClientes();
    });
    toast('Cliente guardado');
    toggleClienteForm(true);
  } catch (err) {
    toast(err.message || 'No se pudo guardar el cliente', true);
  }
}

function toggleClienteForm(hide = false) {
  const form = qs('#cliente-form');
  if (hide) form.classList.add('hidden'); else form.classList.remove('hidden');
  if (hide) {
    qs('#cliente-id').value = '';
    qs('#cliente-nombre').value = '';
    qs('#cliente-correo').value = '';
    qs('#cliente-telefono').value = '';
    qs('#cliente-direccion').value = '';
  }
}

qs('#btn-nuevo-cliente').addEventListener('click', () => toggleClienteForm());
qs('#btn-cancelar-cliente').addEventListener('click', () => toggleClienteForm(true));
qs('#btn-guardar-cliente').addEventListener('click', saveCliente);
qs('#buscar-cliente').addEventListener('input', renderClientes);
qs('#tabla-clientes').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const cliente = state.clientes.find(c => c.id == id);
  if (!cliente) return;
  if (action === 'edit') {
    qs('#cliente-id').value = cliente.id;
    qs('#cliente-nombre').value = cliente.nombre;
    qs('#cliente-correo').value = cliente.correo || '';
    qs('#cliente-telefono').value = cliente.telefono || '';
    qs('#cliente-direccion').value = cliente.direccion || '';
    toggleClienteForm();
  } else if (action === 'del') {
    if (confirm('¿Eliminar cliente?')) {
      try {
        await withBusy(async () => {
          await api.deleteCliente(id);
          await loadClientes();
        });
        toast('Cliente eliminado');
      } catch (err) {
        toast(err.message || 'No se pudo eliminar el cliente', true);
      }
    }
  }
});

function fillClienteSelect() {
  const sel = qs('#venta-cliente');
  if (!state.clientes.length) {
    sel.innerHTML = '<option value="">No hay clientes disponibles</option>';
    return;
  }

  sel.innerHTML = '<option value="">Selecciona un cliente</option>' +
    state.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
}

// Ventas
async function loadVentas() {
  try {
    state.ventas = await api.getVentas();
  } catch (err) {
    console.error(err);
    state.ventas = [];
    toast('No se pudieron cargar las ventas', true);
  }
  renderVentas();
}

function renderVentas() {
  const tbody = qs('#tabla-ventas tbody');
  tbody.innerHTML = '';
  state.ventas.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.id}</td>
      <td>${new Date(v.fecha).toLocaleDateString()}</td>
      <td>${escapeHtml(v.cliente_nombre || '')}</td>
      <td>${euro(v.total)}</td>
      <td>${escapeHtml(v.metodo_pago)}</td>
      <td><span class="badge ${badgeClass(v.estado)}">${escapeHtml(v.estado)}</span></td>`;
    tbody.appendChild(tr);
  });
}

function badgeClass(estado) {
  if (estado === 'Completada') return 'success';
  if (estado === 'Pendiente') return 'warning';
  return 'danger';
}

// Nueva venta
qs('#btn-nueva-venta').addEventListener('click', () => toggleVentaForm());
qs('#btn-cancelar-venta').addEventListener('click', () => toggleVentaForm(true));
qs('#btn-add-item').addEventListener('click', addItemVenta);
qs('#btn-guardar-venta').addEventListener('click', saveVenta);

function toggleVentaForm(hide = false) {
  const form = qs('#venta-form');
  if (hide) {
    form.classList.add('hidden');
    state.detalleVenta = [];
    qs('#venta-cliente').value = '';
    qs('#venta-metodo').value = 'Efectivo';
    qs('#venta-estado').value = 'Completada';
    renderDetalleVenta();
  } else {
    form.classList.remove('hidden');
  }
}

function addItemVenta() {
  const productoId = Number(qs('#venta-producto').value);
  const cantidad = Number(qs('#venta-cantidad').value || 1);
  const prod = state.productos.find(p => p.id === productoId);
  if (!prod) return toast('Selecciona un producto', true);
  if (cantidad <= 0) return toast('Cantidad inválida', true);
  if (cantidad > Number(prod.stock || 0)) return toast('Cantidad supera el stock disponible', true);

  const existente = state.detalleVenta.find(d => d.producto_id === prod.id);
  if (existente) {
    const nuevaCantidad = existente.cantidad + cantidad;
    if (nuevaCantidad > Number(prod.stock || 0)) return toast('Cantidad supera el stock disponible', true);
    existente.cantidad = nuevaCantidad;
    existente.subtotal = prod.precio * nuevaCantidad;
  } else {
    state.detalleVenta.push({ producto_id: prod.id, nombre: prod.nombre, cantidad, subtotal: prod.precio * cantidad });
  }
  renderDetalleVenta();
}

function renderDetalleVenta() {
  const tbody = qs('#tabla-detalle tbody');
  tbody.innerHTML = '';
  let total = 0;
  state.detalleVenta.forEach((d, idx) => {
    total += d.subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(d.nombre)}</td>
      <td>${d.cantidad}</td>
      <td>${euro(d.subtotal)}</td>
      <td><button type="button" class="ghost" data-remove="${idx}">✕</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.remove);
      state.detalleVenta.splice(i, 1);
      renderDetalleVenta();
    });
  });
  qs('#venta-total').textContent = euro(total);
}

async function saveVenta() {
  const cliente_id = Number(qs('#venta-cliente').value);
  const metodo_pago = qs('#venta-metodo').value;
  const estado = qs('#venta-estado').value;
  if (!cliente_id) return toast('Selecciona un cliente', true);
  if (state.detalleVenta.length === 0) return toast('Agrega productos', true);
  const payload = {
    cliente_id,
    metodo_pago,
    estado,
    detalles: state.detalleVenta.map(d => ({ producto_id: d.producto_id, cantidad: d.cantidad }))
  };
  try {
    await withBusy(async () => {
      await api.createVenta(payload);
      await loadVentas();
      await loadDashboard();
      await loadProductos(); // para reflejar stock
    });
    toast('Venta registrada');
    toggleVentaForm(true);
  } catch (err) {
    toast(err.message || 'No se pudo registrar la venta', true);
  }
}

// Inicialización
(async function init() {
  await withBusy(async () => {
    await Promise.all([loadProductos(), loadClientes(), loadVentas(), loadDashboard()]);
  });
})();
