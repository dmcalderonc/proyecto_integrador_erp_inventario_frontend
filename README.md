# StocKly — Frontend

Sistema ERP de Inventario construido como Proyecto Integrador de la Universidad.

## Integrantes

- **Calderón Diego**
- **Mosquera Karla**
- **Rivera Lizandro**

---

## Descripción Funcional

StocKly es un sistema ERP para la gestión de inventario que permite a organizaciones controlar sus bodegas, materiales, proveedores, compras, movimientos de inventario y más. El sistema cuenta con cuatro roles de usuario:

- **ADMIN**: Gestión completa de usuarios, bodegas, proyectos y configuración del sistema.
- **SOLICITANTE**: Creación de requerimientos y solicitudes de compra.
- **BODEGUERO**: Gestión de movimientos, ajustes y despachos de inventario.
- **COMPRADOR**: Gestión de cotizaciones, órdenes de compra y seguimiento de proveedores.

El frontend expone 17 módulos funcionales con CRUD completo, dashboards con gráficas interactivas, catálogo público de materiales y autenticación JWT con soporte para Google OAuth.

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/proyecto_integrador_erp_inventario_frontend.git
cd proyecto_integrador_erp_inventario_frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

> En producción, la variable `VITE_API_URL` apunta al backend desplegado.

### 4. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.x | Framework de UI |
| **Vite** | 8.x | Bundler y dev server |
| **TypeScript** | 6.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos utilitarios |
| **React Router DOM** | 7.x | Enrutamiento SPA |
| **Axios** | 1.x | Cliente HTTP |
| **TanStack React Query** | 5.x | Gestión de estado del servidor |
| **React Hook Form** | 7.x | Formularios |
| **Zod** | 4.x | Validación de esquemas |
| **Recharts** | 3.x | Gráficas para dashboards |
| **Lucide React** | 1.x | Iconografía |
| **React Hot Toast** | 2.x | Notificaciones |
| **date-fns** | 4.x | Manejo de fechas |

---

## Estructura del Proyecto

```
src/
├── api/                    # Servicios HTTP (Axios)
├── assets/                 # Imágenes y recursos estáticos
├── components/             # Componentes reutilizables (DataTable, Modal, Button, etc.)
├── contexts/               # React Context (AuthContext)
├── guards/                 # ProtectedRoute (rutas autenticadas)
├── layouts/                # DashboardLayout (sidebar + header)
├── lib/                    # Utilidades (axios instance, helpers)
├── pages/
│   ├── public/             # Páginas sin autenticación
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── GoogleCallbackPage.tsx
│   │   ├── PublicMaterialesPage.tsx
│   │   ├── PublicMaterialDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   └── private/            # Páginas autenticadas
│       ├── DashboardPage.tsx
│       ├── UsersPage.tsx
│       ├── BodegasPage.tsx
│       ├── CategoriasPage.tsx
│       ├── UnidadesMedidaPage.tsx
│       ├── MaterialesPage.tsx
│       ├── ProyectosPage.tsx
│       ├── ProveedoresPage.tsx
│       ├── RequirementsPage.tsx
│       ├── SolicitudesPage.tsx
│       ├── ComprasPage.tsx
│       ├── CotizacionesPage.tsx
│       ├── MovimientosPage.tsx
│       ├── InventarioPage.tsx
│       ├── AjustesPage.tsx
│       ├── DespachosPage.tsx
│       └── ProfilePage.tsx
├── router/                 # Definición de rutas (public/private)
├── store/                  # Estado local
├── types/                  # Interfaces y tipos TypeScript
├── App.tsx
└── main.tsx
```

---

## Uso

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL del backend API | `http://localhost:3000` o `https://calderon-erp.uaeftt-ute.site` |

### Inicio de Sesión

1. Navega a `/login`.
2. Ingresa tu email y contraseña.
3. Alternativamente, haz clic en **"Continuar con Google"** para autenticarte con tu cuenta de Google.
4. Al autenticarte exitosamente, serás redirigido al dashboard.

### Registro

1. Navega a `/register`.
2. Completa los campos: nombre, email, contraseña.
3. Selecciona tu proyecto.
4. El registro crea una cuenta con rol **SOLICITANTE** por defecto.

### Navegación Pública y Privada

**Rutas públicas** (sin autenticación):
- `/` — Landing page con catálogo de materiales
- `/login` — Inicio de sesión
- `/register` — Registro de usuario
- `/auth/google/callback` — Callback de Google OAuth
- `/materials` — Catálogo público de materiales
- `/materials/:id` — Detalle de material público

**Rutas privadas** (requieren autenticación):
- `/private/dashboard` — Panel principal con KPIs y gráficas
- `/private/users` — Gestión de usuarios (ADMIN)
- `/private/bodegas` — Gestión de bodegas
- `/private/categorias` — Gestión de categorías
- `/private/unidades-medida` — Gestión de unidades de medida
- `/private/materials` — Gestión de materiales (Kanban)
- `/private/proyectos` — Gestión de proyectos
- `/private/proveedores` — Gestión de proveedores
- `/private/requirements` — Requerimientos
- `/private/solicitudes` — Solicitudes de compra
- `/private/compras` — Órdenes de compra
- `/private/cotizaciones` — Cotizaciones
- `/private/movimientos` — Movimientos de inventario
- `/private/inventario` — Inventario consolidado
- `/private/ajustes` — Ajustes de inventario
- `/private/despachos` — Despachos
- `/private/profile` — Perfil de usuario

### Ejemplos de Uso

**Crear un material:**
1. Navega a Materiales → Kanban.
2. Haz clic en **"+ Nuevo Material"**.
3. Completa el formulario (nombre, SKU, categoría, unidad de medida, etc.).
4. Puedes subir una imagen (base64) o pegar una URL externa.
5. Haz clic en **"Crear"**.

**Crear una solicitud de compra:**
1. Navega a Solicitudes de Compra.
2. Haz clic en **"+ Nueva Solicitud"**.
3. Selecciona proyecto y prioridad.
4. Agrega materiales con cantidades requeridas.
5. Haz clic en **"Crear Solicitud"**.

**Generar una orden de compra (PDF):**
1. Navega a Compras.
2. Haz clic en **"+ Nueva Compra"** o edita una existente.
3. Agrega detalles (material, cantidad, precio unitario).
4. Haz clic en **"PDF"** para descargar la orden de compra generada con pdfmake.

**Dashboard:**
1. Navega a Dashboard.
2. Visualiza los KPIs: total materiales, bodegas, usuarios activos, movimientos recientes.
3. Interactúa con las gráficas: movimientos por tipo, distribución por categoría.

---

## Despliegue

### Procedimiento de Despliegue

El proyecto utiliza **GitHub Actions** para CI/CD. El despliegue es automático:

1. Se hace push a la rama `main`.
2. GitHub Actions ejecuta el workflow `deploy.yml`.
3. Se instalan dependencias (`npm ci`).
4. Se construye el proyecto (`npm run build`).
5. Se suben los archivos `dist/` al VPS mediante SCP.
6. Se reemplazan los archivos en `/var/www/proyecto_integrador_erp_inventario_frontend/`.
7. Se recarga nginx para servir los archivos actualizados.

### Variables de Entorno Requeridas (GitHub Secrets)

| Secret | Descripción |
|---|---|
| `VPS_HOST` | Dirección IP o dominio del servidor VPS |
| `VPS_USER` | Usuario SSH del servidor |
| `VPS_KEY` | Clave SSH privada para conexión |

### Variables de Entorno en Build

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://calderon-erp.uaeftt-ute.site` |
| `VITE_APP_NAME` | `StockLy` |

### Configuración del Servidor

- **Servidor**: VPS con Ubuntu
- **Servidor web**: nginx
- **Directorio de deployment**: `/var/www/proyecto_integrador_erp_inventario_frontend/`
- **Dominio frontend**: `stockly.uaeftt-ute.site`
- **Dominio backend**: `calderon-erp.uaeftt-ute.site`
- **SSL**: Habilitado vía certificados Let's Encrypt

### Scripts Disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Construcción para producción
npm run preview  # Vista previa de la construcción
npm run lint     # Análisis de código con oxlint
```