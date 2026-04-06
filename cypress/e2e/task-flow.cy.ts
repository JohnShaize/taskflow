describe('TaskFlow E2E - basic task flow', () => {
  it('logs in, opens a project, and creates a task', () => {
    const taskTitle = `My Cypress Task ${Date.now()}`

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
  })
})