# 🔧 Modificaciones para index.html

## Cambios Necesarios en tu index.html actual

### 1. Panel Admin - Stats (Línea ~166)

**REEMPLAZAR:**
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
```

**POR:**
```html
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
```

### 2. Panel Admin - Añadir Nueva Tarjeta de Total Consultas (Después de línea ~176)

**AÑADIR después de la tarjeta "Ingresos Mensuales":**
```html
<div class="bg-purple-600/20 p-6 rounded-xl border border-purple-500/20">
  <div class="text-3xl mb-2">💬</div>
  <div class="text-gray-400 text-sm">Total Consultas</div>
  <div class="text-3xl font-bold" id="totalConsultations">0</div>
</div>
```

### 3. Panel Admin - Tabla Header (Línea ~189)

**REEMPLAZAR:**
```html
<thead>
  <tr class="border-b border-purple-500/20">
    <th class="py-3 px-6 text-left">Usuario</th>
    <th class="py-3 px-6 text-center">Plan</th>
    <th class="py-3 px-6 text-left">Agentes Bonus</th>
    <th class="py-3 px-6 text-center">Verificado</th>
    <th class="py-3 px-6 text-right">Acciones</th>
  </tr>
</thead>
```

**POR:**
```html
<thead>
  <tr class="border-b border-purple-500/20">
    <th class="py-3 px-6 text-left">Usuario</th>
    <th class="py-3 px-6 text-center">Plan</th>
    <th class="py-3 px-6 text-center">Consultas</th>
    <th class="py-3 px-6 text-left">Agentes Bonus</th>
    <th class="py-3 px-6 text-center">Verificado</th>
    <th class="py-3 px-6 text-right">Acciones</th>
  </tr>
</thead>
```

---

## ✅ Archivo Completo Recomendado

Si prefieres no hacer las modificaciones manualmente, aquí está el bloque completo del Panel Admin:

```html
<!-- SECCIÓN ADMIN -->
<section id="adminSection" class="hidden container mx-auto px-4 py-12">
  <div class="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-8 border border-purple-500/20">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold">Panel de Administración</h2>
      <button onclick="exportEmails()" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold transition-all">
        📧 Exportar Emails
      </button>
    </div>
    
    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-purple-600/20 p-6 rounded-xl border border-purple-500/20">
        <div class="text-3xl mb-2">👥</div>
        <div class="text-gray-400 text-sm">Total Usuarios</div>
        <div class="text-3xl font-bold" id="totalUsers">0</div>
      </div>
      <div class="bg-purple-600/20 p-6 rounded-xl border border-purple-500/20">
        <div class="text-3xl mb-2">💬</div>
        <div class="text-gray-400 text-sm">Total Consultas</div>
        <div class="text-3xl font-bold" id="totalConsultations">0</div>
      </div>
      <div class="bg-purple-600/20 p-6 rounded-xl border border-purple-500/20">
        <div class="text-3xl mb-2">💰</div>
        <div class="text-gray-400 text-sm">Ingresos Mensuales</div>
        <div class="text-3xl font-bold" id="totalCredits">€0</div>
      </div>
      <div class="bg-purple-600/20 p-6 rounded-xl border border-purple-500/20">
        <div class="text-3xl mb-2">📊</div>
        <div class="text-gray-400 text-sm">Usuarios Activos</div>
        <div class="text-3xl font-bold" id="activeUsers">0</div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-purple-500/20">
            <th class="py-3 px-6 text-left">Usuario</th>
            <th class="py-3 px-6 text-center">Plan</th>
            <th class="py-3 px-6 text-center">Consultas</th>
            <th class="py-3 px-6 text-left">Agentes Bonus</th>
            <th class="py-3 px-6 text-center">Verificado</th>
            <th class="py-3 px-6 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody id="usersTable">
          <!-- Se llena dinámicamente -->
        </tbody>
      </table>
    </div>
  </div>
</section>
```

---

## 📝 Resumen de Cambios

1. **Stats:** Cambiar de 3 a 4 columnas (md:grid-cols-4)
2. **Nueva Tarjeta:** Añadir "Total Consultas" con id="totalConsultations"
3. **Botón Exportar:** Añadir botón "📧 Exportar Emails" en el header
4. **Tabla:** Añadir columna "Consultas" entre "Plan" y "Agentes Bonus"

---

## ⚠️ Importante

El archivo **app_completo.js** ya incluye toda la lógica para:
- Llenar el campo `totalConsultations`
- Mostrar consultas por usuario en la tabla
- Funcionalidad del botón "Exportar Emails"
- Funcionalidad del botón "Exportar PDF" en el chat (se añade automáticamente)

Solo necesitas hacer estos pequeños cambios en el HTML y reemplazar tu `app.js` actual con `app_completo.js`.
