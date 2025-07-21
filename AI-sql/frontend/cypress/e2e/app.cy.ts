
describe('App E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should display the login form and allow successful login', () => {
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.contains('Login successful!').should('be.visible');
    cy.contains('Welcome to the Visual Database Query System').should('be.visible');
  });

  it('should display database explorer and allow dragging tables', () => {
    // Login first
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.contains('Login successful!').should('be.visible');

    // Ensure database explorer is visible and contains demo_db
    cy.contains('Demo SQLite DB').should('be.visible');
    cy.contains('products').should('be.visible');

    // Drag 'products' table to query canvas
    const dataTransfer = new DataTransfer();
    cy.contains('products')
      .trigger('dragstart', {
        dataTransfer,
      });

    cy.get('[style*="height: 400px"]') // Assuming this is the query canvas
      .trigger('drop', {
        dataTransfer,
      });

    cy.get('[style*="height: 400px"]').contains('products').should('be.visible');
  });
});
