import { test, expect } from '@playwright/test';

test.describe('Todo Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería cargar la aplicación correctamente', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('To-Do');
    await expect(page.locator('#todo-form')).toBeVisible();
    await expect(page.locator('#todo-input')).toBeVisible();
  });

  test('debería crear un nuevo todo', async ({ page }) => {
    const todoText = 'Nueva tarea E2E';
    
    await page.fill('#todo-input', todoText);
    await page.selectOption('#priority-select', 'high');
    await page.click('button[type="submit"]');
    
    // Filtrar el elemento específico por texto (Playwright best practice)
    const newTodo = page.locator('.todo-item').filter({ hasText: todoText });
    await expect(newTodo).toBeVisible();
    await expect(newTodo).toHaveClass(/priority-high/);
  });

  test('debería crear un todo con prioridad media', async ({ page }) => {
    await page.fill('#todo-input', 'Tarea media');
    await page.selectOption('#priority-select', 'medium');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.todo-item.priority-medium')).toBeVisible();
  });

  test('debería crear un todo con prioridad baja', async ({ page }) => {
    await page.fill('#todo-input', 'Tarea baja');
    await page.selectOption('#priority-select', 'low');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.todo-item.priority-low')).toBeVisible();
  });

  test('debería marcar un todo como completado', async ({ page }) => {
    await page.fill('#todo-input', 'Tarea para completar');
    await page.click('button[type="submit"]');
    
    const checkbox = page.locator('.todo-item input[type="checkbox"]').first();
    await checkbox.check();
    
    await expect(page.locator('.todo-item.completed')).toBeVisible();
  });

  test('debería eliminar un todo', async ({ page }) => {
    await page.fill('#todo-input', 'Tarea para eliminar');
    await page.click('button[type="submit"]');
    
    const initialCount = await page.locator('.todo-item').count();
    
    await page.click('.todo-item .remove-btn').first();
    
    const finalCount = await page.locator('.todo-item').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('debería filtrar todos por estado completado', async ({ page }) => {
    // Crear y completar un todo
    await page.fill('#todo-input', 'Tarea completada');
    await page.click('button[type="submit"]');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    
    // Crear un todo pendiente
    await page.fill('#todo-input', 'Tarea pendiente');
    await page.click('button[type="submit"]');
    
    // Filtrar por completados
    await page.click('button[data-filter="completed"]');
    
    const completedTodos = page.locator('.todo-item.completed');
    await expect(completedTodos.first()).toBeVisible();
    await expect(completedTodos.first()).toContainText('Tarea completada');
  });

  test('debería filtrar todos por estado pendiente', async ({ page }) => {
    // Crear un todo y completarlo
    await page.fill('#todo-input', 'Tarea completada');
    await page.click('button[type="submit"]');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    
    // Crear un todo pendiente
    await page.fill('#todo-input', 'Tarea pendiente');
    await page.click('button[type="submit"]');
    
    // Filtrar por pendientes
    await page.click('button[data-filter="pending"]');
    
    const pendingTodos = page.locator('.todo-item:not(.completed)');
    await expect(pendingTodos.first()).toBeVisible();
  });

  test('debería buscar todos por texto', async ({ page }) => {
    await page.fill('#todo-input', 'Tarea de búsqueda');
    await page.click('button[type="submit"]');
    
    await page.fill('#todo-input', 'Otra tarea diferente');
    await page.click('button[type="submit"]');
    
    await page.fill('#search-input', 'búsqueda');
    
    // Filtrar el elemento específico por texto
    const filteredTodo = page.locator('.todo-item').filter({ hasText: 'Tarea de búsqueda' });
    await expect(filteredTodo).toBeVisible();
  });

  test('debería mostrar estadísticas correctamente', async ({ page }) => {
    // Crear algunos todos
    await page.fill('#todo-input', 'Tarea 1');
    await page.click('button[type="submit"]');
    
    await page.fill('#todo-input', 'Tarea 2');
    await page.click('button[type="submit"]');
    
    // Verificar que las estadísticas se muestren
    await expect(page.locator('#stats-bar')).toBeVisible();
    await expect(page.locator('#stats-bar')).toContainText('Total:');
  });

  test('debería marcar todos como completados', async ({ page }) => {
    await page.fill('#todo-input', 'Tarea 1');
    await page.click('button[type="submit"]');
    
    await page.fill('#todo-input', 'Tarea 2');
    await page.click('button[type="submit"]');
    
    await page.click('#mark-all-completed');
    
    const checkboxes = page.locator('.todo-item input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('debería eliminar todos los completados', async ({ page }) => {
    // Crear y completar un todo
    await page.fill('#todo-input', 'Tarea completada');
    await page.click('button[type="submit"]');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    
    // Crear un todo pendiente
    await page.fill('#todo-input', 'Tarea pendiente');
    await page.click('button[type="submit"]');
    
    const initialCount = await page.locator('.todo-item').count();
    
    await page.click('#delete-completed');
    
    // Confirmar el diálogo si aparece
    page.on('dialog', dialog => dialog.accept());
    
    await page.waitForTimeout(500);
    
    const finalCount = await page.locator('.todo-item').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('debería validar que no se puede crear un todo vacío', async ({ page }) => {
    const initialCount = await page.locator('.todo-item').count();
    
    // Intentar enviar el formulario vacío
    await page.click('button[type="submit"]');
    
    // El formulario debería requerir el campo
    const finalCount = await page.locator('.todo-item').count();
    expect(finalCount).toBe(initialCount);
  });
});

