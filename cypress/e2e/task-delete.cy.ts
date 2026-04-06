describe('TaskFlow E2E - create and delete task', () => {
  it('logs in, creates a task, and deletes it', () => {
    const taskTitle = `Delete Me ${Date.now()}`

    cy.visit('/login')

    cy.get('[data-testid="email-input"]').type('taskflow.test1@gmail.com')
    cy.get('[data-testid="password-input"]').type('123456')
    cy.get('[data-testid="login-button"]').click()

    cy.url().should('include', '/dashboard')

    cy.visit('/projects')

    cy.get('[data-testid="project-card"]').first().click()

    cy.url().should('include', '/projects/')

    cy.get('[data-testid="add-task-button"]').click()

    cy.get('[data-testid="task-title-input"]').type(taskTitle)
    cy.get('[data-testid="create-task-submit"]').click()

    cy.get('[data-testid="task-card"]').contains(taskTitle).should('exist')

    cy.contains('[data-testid="task-card"]', taskTitle).click()

    cy.on('window:confirm', () => true)

    cy.contains('button', 'Delete Task').click()

    cy.contains('[data-testid="task-card"]', taskTitle).should('not.exist')
  })
})