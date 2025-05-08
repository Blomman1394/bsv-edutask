describe('Todo Operations', () => {
  beforeEach(() => {
    // Setup: Navigate to task detail view
    cy.visit('/tasks/1')  // Adjust URL as needed
    cy.wait(1000)  // Wait for page load
  })

  // R8UC1 - Add Todo Tests
  describe('Add Todo Item (R8UC1)', () => {
    it('should add valid todo item (R8UC1-TC1)', () => {
      const todoText = 'Study chapter 1'
      cy.get('[data-testid="todo-input"]').type(todoText)
      cy.get('[data-testid="add-todo-button"]').click()
      cy.get('[data-testid="todo-list"]').contains(todoText)
      cy.get('[data-testid="todo-item"]').last().should('not.have.class', 'done')
    })

    it('should not allow empty todo (R8UC1-TC2)', () => {
      cy.get('[data-testid="add-todo-button"]').should('be.disabled')
    })

    it('should not allow whitespace-only todo (R8UC1-TC3)', () => {
      cy.get('[data-testid="todo-input"]').type('   ')
      cy.get('[data-testid="add-todo-button"]').should('be.disabled')
    })

    it('should handle maximum length todo (R8UC1-TC4)', () => {
      const maxLengthString = 'A'.repeat(255)
      cy.get('[data-testid="todo-input"]').type(maxLengthString)
      cy.get('[data-testid="add-todo-button"]').click()
      cy.get('[data-testid="todo-list"]').contains(maxLengthString)
    })
  })

  // R8UC2 - Toggle Todo Tests
  describe('Toggle Todo Item (R8UC2)', () => {
    beforeEach(() => {
      // Create a test todo item
      cy.get('[data-testid="todo-input"]').type('Test todo')
      cy.get('[data-testid="add-todo-button"]').click()
    })

    it('should toggle todo from active to done (R8UC2-TC1)', () => {
      cy.get('[data-testid="todo-toggle"]').last().click()
      cy.get('[data-testid="todo-item"]').last().should('have.class', 'done')
    })

    it('should toggle todo from done to active (R8UC2-TC2)', () => {
      cy.get('[data-testid="todo-toggle"]').last().click() // to done
      cy.get('[data-testid="todo-toggle"]').last().click() // back to active
      cy.get('[data-testid="todo-item"]').last().should('not.have.class', 'done')
    })

    it('should maintain state after multiple toggles (R8UC2-TC3)', () => {
      cy.get('[data-testid="todo-toggle"]').last().click().click()
      cy.get('[data-testid="todo-item"]').last().should('not.have.class', 'done')
    })
  })

  // R8UC3 - Delete Todo Tests
  describe('Delete Todo Item (R8UC3)', () => {
    it('should delete active todo from multiple items (R8UC3-TC1)', () => {
      // Create two todos
      cy.get('[data-testid="todo-input"]').type('Todo 1{enter}')
      cy.get('[data-testid="todo-input"]').type('Todo 2{enter}')
      cy.get('[data-testid="todo-delete"]').first().click()
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Todo 1')
    })

    it('should delete done todo from list (R8UC3-TC2)', () => {
      // Create and complete todo
      cy.get('[data-testid="todo-input"]').type('Done todo{enter}')
      cy.get('[data-testid="todo-toggle"]').click()
      cy.get('[data-testid="todo-delete"]').click()
      cy.get('[data-testid="todo-list"]').should('not.contain', 'Done todo')
    })

    it('should handle deleting last item (R8UC3-TC3)', () => {
      cy.get('[data-testid="todo-input"]').type('Last todo{enter}')
      cy.get('[data-testid="todo-delete"]').click()
      cy.get('[data-testid="todo-list"]').should('be.empty')
    })

    it('should handle empty list (R8UC3-TC4)', () => {
      cy.get('[data-testid="todo-list"]').should('be.empty')
    })
  })
})