describe('Todo Operations', () => {
  let taskId;
  let userId;
  let email;
  let name;

  before(function () {
    // Create test user and login
    cy.fixture('user.json').then((user) => {
      // Create user
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((response) => {
        userId = response.body._id.$oid;
        email = user.email;
        name = user.firstName + ' ' + user.lastName;

        // Login
        cy.visit('http://localhost:3000');
        cy.contains('div', 'Email Address')
          .find('input[type=text]')
          .type(email);
        cy.get('form').submit();

        // Create a new task
        cy.get('#title').type('Test Task');
        cy.get('#url').type('dQw4w9WgXcQ');
        cy.get('form.submit-form').submit();

        // Wait for task to be created and click on it
        cy.get('.container-element').first().click();
        cy.wait(1000);
      });
    });
  });

  describe('Add Todo Item (R8UC1)', () => {
    beforeEach(() => {
      // Ensure we're in task detail view
      cy.contains('Test Task').should('be.visible').click();
      cy.wait(500); // Wait for detail view to load
    });

    it('should add valid todo item', () => {
      // Add new todo
      cy.get('input[placeholder="Add a new todo item"]')
        .should('be.visible')
        .type('Study chapter 1');
      cy.contains('Add').click();
      
      // Verify todo was added
      cy.contains('Study chapter 1').should('be.visible');
    });

    it('should not allow empty todo', () => {
      cy.get('.inline-form input[type="submit"]')
        .should('be.disabled');
    });
  });

  describe('Toggle Todo Status (R8UC2)', () => {
    it('should toggle todo status', () => {
      // Click the checker span to toggle status
      cy.get('.todo-item .checker')
        .first()
        .click();

      // Verify todo is marked as done
      cy.get('.todo-item')
        .first()
        .find('.checker')
        .should('have.class', 'checked');
    });
  });

  describe('Delete Todo (R8UC3)', () => {
    it('should delete todo item', () => {
      // Click the remover span (x) to delete
      cy.get('.todo-item .remover')
        .first()
        .click();

      // Verify todo was removed
      cy.get('.todo-item')
        .should('have.length.lessThan', 2); // Including the add todo form
    });
  });

  after(function () {
    // Cleanup
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${userId}`
    });
  });
});