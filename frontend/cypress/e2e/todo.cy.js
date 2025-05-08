describe('Todo Operations', () => {
  // Define test data variables
  let taskId
  let userId

  before(function () {
    // Create test user and task from fixtures
    cy.fixture('user1.json').then((user) => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((response) => {
        userId = response.body._id.$oid
        // Create test task
        cy.fixture('task.json').then((task) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            body: { ...task, userId }
          }).then((response) => {
            taskId = response.body._id.$oid
          })
        })
      })
    })
  })

  beforeEach(function () {
    // Navigate to task detail page
    cy.visit(`http://localhost:3000/tasks/${taskId}`)
    cy.wait(500) // Wait for page load
  })

  describe('Add Todo Item (R8UC1)', () => {
    it('should add valid todo item (R8UC1-TC1)', () => {
      cy.contains('div', 'Add Todo')
        .find('input[type=text]')
        .type('Study chapter 1')
      cy.get('form').submit()
      cy.contains('Study chapter 1').should('exist')
        .and('not.have.class', 'done')
    })

    it('should not allow empty todo (R8UC1-TC2)', () => {
      cy.get('form button[type=submit]')
        .should('be.disabled')
    })

    it('should handle maximum length todo (R8UC1-TC4)', () => {
      const maxLength = 'A'.repeat(255)
      cy.contains('div', 'Add Todo')
        .find('input[type=text]')
        .type(maxLength)
      cy.get('form').submit()
      cy.contains(maxLength).should('exist')
    })
  })

  describe('Toggle Todo Status (R8UC2)', () => {
    beforeEach(() => {
      // Create test todo item
      cy.contains('div', 'Add Todo')
        .find('input[type=text]')
        .type('Toggle test todo{enter}')
    })

    it('should toggle todo status (R8UC2-TC1)', () => {
      cy.contains('Toggle test todo')
        .parent()
        .find('[data-testid=toggle-button]')
        .click()
      cy.contains('Toggle test todo')
        .should('have.class', 'done')
    })
  })

  describe('Delete Todo Item (R8UC3)', () => {
    it('should delete todo item (R8UC3-TC1)', () => {
      // Create and delete todo
      cy.contains('div', 'Add Todo')
        .find('input[type=text]')
        .type('Delete test todo{enter}')
      cy.contains('Delete test todo')
        .parent()
        .find('[data-testid=delete-button]')
        .click()
      cy.contains('Delete test todo')
        .should('not.exist')
    })
  })

  after(function () {
    // Clean up: Delete test task and user
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/tasks/${taskId}`
    })
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${userId}`
    })
  })
})