export const setupTestUser = () => {
  let userId;
  return cy.fixture('user1.json').then((user) => {
    return cy.request({
      method: 'POST',
      url: 'http://localhost:5000/users/create',
      form: true,
      body: user
    }).then((response) => {
      userId = response.body._id.$oid;
      cy.log(`Test user created with ID: ${userId}`);
      return { userId, user };
    });
  });
};

export const loginTestUser = (email) => {
  cy.visit('http://localhost:3000');
  cy.contains('div', 'Email Address')
    .find('input[type=text]')
    .type(email);
  cy.get('form').submit();
  cy.get('h1').should('contain.text', 'Your tasks');
};

export const createTestTask = (userId) => {
  return cy.fixture('task.json').then((task) => {
    return cy.request({
      method: 'POST',
      url: 'http://localhost:5000/tasks/create',
      body: { ...task, userId }
    }).then((response) => {
      const taskId = response.body._id.$oid;
      cy.log(`Test task created with ID: ${taskId}`);
      return taskId;
    });
  });
};