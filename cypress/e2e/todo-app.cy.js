describe('Todo Application E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debería cargar la aplicación correctamente', () => {
    cy.get('h1').should('contain.text', 'To-Do');
    cy.get('#todo-form').should('be.visible');
    cy.get('#todo-input').should('be.visible');
  });

  it('debería crear un nuevo todo', () => {
    const todoText = 'Nueva tarea E2E';
    
    cy.get('#todo-input').type(todoText);
    cy.get('#priority-select').select('high');
    cy.get('button[type="submit"]').click();
    
    // Buscar el elemento específico por texto
    cy.contains('.todo-item', todoText).should('be.visible');
    cy.contains('.todo-item', todoText).should('have.class', 'priority-high');
  });

  it('debería marcar un todo como completado', () => {
    cy.get('#todo-input').type('Tarea para completar');
    cy.get('button[type="submit"]').click();
    
    cy.get('.todo-item input[type="checkbox"]').first().check();
    
    cy.get('.todo-item.completed').should('be.visible');
  });

  it('debería eliminar un todo', () => {
    cy.get('#todo-input').type('Tarea para eliminar');
    cy.get('button[type="submit"]').click();
    
    cy.get('.todo-item').then(($items) => {
      const initialCount = $items.length;
      
      cy.get('.todo-item .remove-btn').first().click();
      
      cy.get('.todo-item').should('have.length', initialCount - 1);
    });
  });

  it('debería filtrar todos por estado completado', () => {
    const completedTodoText = 'Tarea completada E2E';
    const pendingTodoText = 'Tarea pendiente E2E';
    
    // Crear y completar un todo
    cy.get('#todo-input').type(completedTodoText);
    cy.get('button[type="submit"]').click();
    
    // Buscar el todo específico que acabamos de crear y marcarlo como completado
    cy.contains('.todo-item', completedTodoText).within(() => {
      cy.get('input[type="checkbox"]').check();
    });
    
    // Crear un todo pendiente
    cy.get('#todo-input').type(pendingTodoText);
    cy.get('button[type="submit"]').click();
    
    // Filtrar por completados
    cy.get('button[data-filter="completed"]').click();
    
    // Verificar que el todo completado está visible
    cy.contains('.todo-item.completed', completedTodoText).should('be.visible');
  });

  it('debería buscar todos por texto', () => {
    cy.get('#todo-input').type('Tarea de búsqueda');
    cy.get('button[type="submit"]').click();
    
    cy.get('#todo-input').type('Otra tarea diferente');
    cy.get('button[type="submit"]').click();
    
    cy.get('#search-input').type('búsqueda');
    
    cy.contains('.todo-item', 'Tarea de búsqueda').should('be.visible');
  });

  it('debería mostrar estadísticas correctamente', () => {
    // Crear algunos todos
    cy.get('#todo-input').type('Tarea 1');
    cy.get('button[type="submit"]').click();
    
    cy.get('#todo-input').type('Tarea 2');
    cy.get('button[type="submit"]').click();
    
    // Verificar que las estadísticas se muestren
    cy.get('#stats-bar').should('be.visible');
    cy.get('#stats-bar').should('contain.text', 'Total:');
  });

  it('debería marcar todos como completados', () => {
    cy.get('#todo-input').type('Tarea 1');
    cy.get('button[type="submit"]').click();
    
    cy.get('#todo-input').type('Tarea 2');
    cy.get('button[type="submit"]').click();
    
    cy.get('#mark-all-completed').click();
    
    cy.get('.todo-item input[type="checkbox"]').each(($checkbox) => {
      cy.wrap($checkbox).should('be.checked');
    });
  });
});
