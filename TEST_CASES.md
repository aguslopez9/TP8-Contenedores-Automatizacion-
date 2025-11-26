# Test Cases - TP8 Contenedores y Automatización

Este documento describe todos los test cases implementados en el proyecto, incluyendo tests unitarios y tests de integración.

## Resumen Ejecutivo

- **Tests Unitarios Backend**: 25 tests
- **Tests Unitarios Frontend**: 25 tests
- **Tests de Integración**: 7 tests
- **Total**: 57 tests

---

## Tests Unitarios - Backend

### Módulo: TodoStore (Storage) - 25 tests

#### Creación de Todos
1. **should create a todo with default values**
   - Verifica que se crea un todo con valores por defecto (completed: false, priority: medium)
   - Valida que se genera createdAt automáticamente
   - Verifica que completedAt es null inicialmente

2. **should create a todo with high priority**
   - Verifica creación con prioridad "high"

3. **should create a todo with low priority**
   - Verifica creación con prioridad "low"

4. **should normalize invalid priority to medium**
   - Valida que prioridades inválidas se normalizan a "medium"

5. **should create a completed todo with completedAt timestamp**
   - Verifica que al crear un todo completado, se establece completedAt

#### Listado de Todos
6. **should list all todos**
   - Verifica que se pueden listar todos los todos creados

#### Actualización de Todos
7. **should update todo text**
   - Verifica actualización del texto de un todo

8. **should update todo completed status**
   - Verifica cambio de estado completed
   - Valida que se establece completedAt al completar

9. **should set completedAt to null when uncompleting**
   - Verifica que al descompletar, completedAt se establece en null

10. **should update todo priority**
    - Verifica actualización de prioridad

11. **should return null when updating non-existent todo**
    - Valida manejo de error al actualizar todo inexistente

#### Eliminación de Todos
12. **should delete a todo**
    - Verifica eliminación correcta de un todo

13. **should return false when deleting non-existent todo**
    - Valida manejo de error al eliminar todo inexistente

#### Filtrado
14. **should filter todos by completed status**
    - Verifica filtrado por estado completado/pendiente

15. **should filter todos by priority**
    - Verifica filtrado por prioridad (low, medium, high)

16. **should filter todos by search text**
    - Verifica búsqueda por texto (case-insensitive)

17. **should combine multiple filters**
    - Verifica combinación de filtros (prioridad + estado)

#### Estadísticas
18. **should get statistics**
    - Verifica cálculo de estadísticas (total, completed, pending, byPriority)

#### Operaciones en Lote
19. **should mark all todos as completed**
    - Verifica que se marcan todos los todos como completados
    - Valida que se actualiza completedAt para todos

20. **should mark all todos as pending**
    - Verifica que se marcan todos los todos como pendientes

21. **should delete all completed todos**
    - Verifica eliminación masiva de todos completados

#### Validaciones y Edge Cases
22. **should trim text when creating todo**
    - Valida que se eliminan espacios en blanco al inicio/fin

23. **should trim text when updating todo**
    - Valida que se eliminan espacios al actualizar

24. **should not update with empty text**
    - Valida que no se actualiza con texto vacío

25. **should assign sequential IDs**
    - Verifica que los IDs se asignan secuencialmente

26. **should preserve createdAt when updating**
    - Valida que createdAt no cambia al actualizar

---

### Módulo: Server API - 25 tests

#### Endpoints Básicos
1. **GET /health should return ok status**
   - Verifica endpoint de health check

2. **GET /todos should return empty array initially**
   - Verifica que inicialmente retorna array vacío

#### Creación (POST)
3. **POST /todos should create a new todo**
   - Verifica creación de todo con valores por defecto

4. **POST /todos should create todo with priority**
   - Verifica creación con prioridad específica

5. **POST /todos should reject empty text**
   - Valida rechazo de texto vacío (400)

6. **POST /todos should reject missing text**
   - Valida rechazo cuando falta el campo text (400)

#### Lectura con Filtros (GET)
7. **GET /todos?completed=true should filter completed**
   - Verifica filtrado por estado completado

8. **GET /todos?priority=high should filter by priority**
   - Verifica filtrado por prioridad

9. **GET /todos?search=test should filter by search**
   - Verifica búsqueda por texto

#### Actualización (PATCH)
10. **PATCH /todos/:id should update todo**
    - Verifica actualización de texto

11. **PATCH /todos/:id should update completed status**
    - Verifica actualización de estado completed
    - Valida que se establece completedAt

12. **PATCH /todos/:id should update priority**
    - Verifica actualización de prioridad

13. **PATCH /todos/:id should return 404 for non-existent todo**
    - Valida manejo de error 404

#### Eliminación (DELETE)
14. **DELETE /todos/:id should delete todo**
    - Verifica eliminación correcta

15. **DELETE /todos/:id should return 404 for non-existent todo**
    - Valida manejo de error 404

#### Endpoints Adicionales
16. **GET /todos/stats should return statistics**
    - Verifica endpoint de estadísticas

17. **POST /todos/bulk/mark-completed should mark all as completed**
    - Verifica operación en lote para marcar todos como completados

18. **DELETE /todos/bulk/completed should delete completed todos**
    - Verifica eliminación masiva de completados

#### Manejo de Errores
19. **should return 404 for unknown routes**
    - Valida manejo de rutas desconocidas

20. **should return 405 for method not allowed**
    - Valida manejo de métodos HTTP no permitidos

21. **should handle CORS headers**
    - Verifica que se incluyen headers CORS

22. **should handle OPTIONS request**
    - Verifica manejo de preflight requests

23. **should reject invalid JSON in POST**
    - Valida rechazo de JSON inválido (400)

24. **should reject invalid JSON in PATCH**
    - Valida rechazo de JSON inválido en actualización (400)

25. **PATCH should reject empty update**
    - Valida rechazo de actualización vacía (400)

---

## Tests Unitarios - Frontend

### Módulo: App Functions - 25 tests

#### Filtrado y Búsqueda
1. **getFilteredTodos should filter by completed status**
   - Verifica filtrado por estado pendiente

2. **getFilteredTodos should filter by completed**
   - Verifica filtrado por estado completado

3. **getFilteredTodos should filter by search text**
   - Verifica búsqueda por texto

4. **should combine filter and search**
   - Verifica combinación de filtro y búsqueda

5. **should handle empty search string**
   - Valida manejo de búsqueda vacía

#### Funciones de Prioridad
6. **getPriorityClass should return correct class**
   - Verifica generación de clases CSS por prioridad

7. **getPriorityLabel should return correct label**
   - Verifica etiquetas de prioridad en español

8. **should validate priority values**
   - Valida valores de prioridad permitidos

#### Validación de DOM
9. **should handle filter button clicks**
   - Verifica presencia y estado de botones de filtro

10. **should have search input**
    - Verifica presencia del campo de búsqueda

11. **should have priority select**
    - Verifica presencia del selector de prioridad

12. **should have bulk action buttons**
    - Verifica presencia de botones de operaciones en lote

13. **should render empty state when no todos**
    - Verifica renderizado de estado vacío

14. **should have todo form**
    - Verifica presencia del formulario

#### Llamadas HTTP (Mocked)
15. **loadTodos should make GET request to /todos**
    - Verifica llamada GET para cargar todos

16. **loadTodos with filter should include query params**
    - Verifica inclusión de parámetros de consulta

17. **addTodo should make POST request with text and priority**
    - Verifica llamada POST con texto y prioridad

18. **toggleTodo should make PATCH request**
    - Verifica llamada PATCH para actualizar estado

19. **removeTodo should make DELETE request**
    - Verifica llamada DELETE para eliminar

20. **getStats should make GET request to /todos/stats**
    - Verifica llamada GET para estadísticas

21. **markAllCompleted should make POST to bulk endpoint**
    - Verifica llamada POST para operación en lote

22. **deleteCompleted should make DELETE to bulk endpoint**
    - Verifica llamada DELETE para eliminación masiva

#### Manejo de Errores
23. **should handle fetch errors gracefully**
    - Valida manejo de errores de red

24. **should handle non-ok responses**
    - Valida manejo de respuestas HTTP de error

#### Funcionalidades Adicionales
25. **should filter todos by priority in UI**
    - Verifica filtrado por prioridad en la interfaz

---

## Tests de Integración

### Ambiente: QA (Post-Deploy)

Los tests de integración se ejecutan automáticamente después del deploy a QA y validan el funcionamiento end-to-end del sistema.

1. **Health Endpoint**
   - Verifica que el endpoint `/health` responde correctamente
   - Valida estructura de respuesta: `{"status":"ok"}`

2. **Create Todo**
   - Crea un todo de prueba con prioridad alta
   - Valida que se retorna el todo creado con ID
   - Verifica estructura completa del objeto retornado

3. **Get Todos**
   - Verifica que se pueden obtener todos los todos
   - Valida estructura de respuesta con array de todos

4. **Update Todo**
   - Actualiza el todo creado (marca como completado)
   - Verifica que la actualización se refleja correctamente
   - Valida que se establece completedAt

5. **Get Stats**
   - Verifica endpoint de estadísticas
   - Valida estructura de respuesta con totales y distribución

6. **Filter by Priority**
   - Verifica filtrado por prioridad mediante query params
   - Valida que solo se retornan todos con la prioridad especificada

7. **Delete Todo**
   - Elimina el todo creado durante los tests
   - Verifica que la eliminación se realiza correctamente (204)

---

## Ejecución de Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

### En CI/CD
Los tests se ejecutan automáticamente en GitHub Actions:
- **Tests unitarios**: Se ejecutan en el workflow `CI` antes del build
- **Tests de integración**: Se ejecutan en el workflow `Deploy` después del deploy a QA

---

## Cobertura de Tests

### Backend
- ✅ Creación de todos (con y sin prioridad)
- ✅ Lectura y listado
- ✅ Actualización (texto, estado, prioridad)
- ✅ Eliminación
- ✅ Filtrado (por estado, prioridad, búsqueda)
- ✅ Estadísticas
- ✅ Operaciones en lote
- ✅ Validaciones y manejo de errores
- ✅ Endpoints HTTP (GET, POST, PATCH, DELETE)
- ✅ CORS y OPTIONS

### Frontend
- ✅ Funciones de filtrado
- ✅ Funciones de búsqueda
- ✅ Funciones de prioridad
- ✅ Validación de DOM
- ✅ Llamadas HTTP (mock)
- ✅ Manejo de errores
- ✅ Operaciones en lote

### Integración
- ✅ Health check
- ✅ CRUD completo
- ✅ Filtros
- ✅ Estadísticas
- ✅ Operaciones en lote

---

## Notas Importantes

1. **Tests Unitarios Backend**: Requieren que el servidor esté corriendo en el puerto especificado (por defecto 3001)

2. **Tests Unitarios Frontend**: Usan Jest con jsdom para simular el entorno del navegador

3. **Tests de Integración**: Se ejecutan contra el ambiente QA real después del deploy

4. **Aislamiento**: Cada test se ejecuta con datos limpios (se resetea la base de datos antes de cada test)

5. **Validación de Fallos**: Si cualquier test falla, el pipeline se detiene automáticamente (`continue-on-error: false`)

---

## Mejoras Futuras

- [ ] Agregar tests de performance
- [ ] Agregar tests de seguridad
- [ ] Aumentar cobertura de edge cases
- [ ] Agregar tests E2E con Playwright/Cypress
- [ ] Implementar reportes de cobertura de código

