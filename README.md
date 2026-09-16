# 📊 Sistema de Gestión para Comercios (SisGesCo)

Sistema de gestión comercial e impositivo fullstack diseñado para la administración integral de ventas, compras, cuentas corrientes, control de stock y reportes financieros/fiscales.

---

## 🛠️ Tecnologías utilizadas

### **Frontend**
* **Framework:** Angular (Standalone Components)
* **Lenguaje:** TypeScript
* **Estilos:** CSS3 / Flexbox (Responsive Design)

### **Backend**
* **Runtime & Framework:** Node.js + Express
* **ORM:** Prisma ORM
* **Validación de esquemas:** Zod
* **Base de Datos:** MySQL 8.0

---

## 🚀 Funcionalidades principales

* 🛒 **Módulo de Ventas:**
  * Buscador rápido de clientes y productos.
  * Cálculo automático de precios según categoría impositiva del cliente (*Resp. Inscripto, Consumidor Final, Cliente c/ Cta. Cte.*).
  * Control de stock en tiempo real y registro de formas de pago.

* 💵 **Cuentas Corrientes:**
  * Historial acumulado de movimientos (*Debe / Haber / Saldo*).
  * Registro de cobros y entregas parciales sin perder la trazabilidad del cliente.

* 📋 **Módulo de Compras:**
  * Registro de Facturas de Mercadería, Notas de Débito y Notas de Crédito.
  * Alta rápida de proveedores y productos directamente desde el flujo de compra.
  * Validación automática entre el Neto de la factura y los subtotales de materiales cargados.

* 📦 **Gestión de Productos & Stock:**
  * Administración de costos, stock inicial y reglas de margen (multiplicadores).
  * Búsqueda por rubro, tipo y nombre.

* 📊 **Reportes & Exportación:**
  * **Reporte Impositivo (IVA):** Distinción entre Débito Fiscal (ventas) y Crédito Fiscal (compras) para cálculo de saldo a favor o a pagar.
  * **Reporte Operativo:** Resultado bruto/neto del período y Costo de Mercadería Vendida (CMV).
  * **Exportación a CSV:** Compatibilidad nativa con Microsoft Excel (BOM UTF-8 y delimitador `;`).

---

## 📋 Requisitos previos

Asegurate de tener instalado en tu equipo:
* [Node.js](https://nodejs.org/) (versión 18 o superior)
* MySQL Server 8.0 y MySQL Workbench
* [Angular CLI](https://angular.dev/) (`npm install -g @angular/cli`)

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/sisges.git](https://github.com/tu-usuario/sisges.git)
cd sisges
