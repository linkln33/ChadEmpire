describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the hero section', () => {
    cy.get('h1').contains('CHAD Empire', { matchCase: false }).should('be.visible');
    cy.get('button').contains('Connect Wallet', { matchCase: false }).should('be.visible');
  });

  it('should navigate to different sections', () => {
    cy.get('a[href="#features"]').click();
    cy.hash().should('eq', '#features');
    
    cy.get('a[href="#tokenomics"]').click();
    cy.hash().should('eq', '#tokenomics');
    
    cy.get('a[href="#roadmap"]').click();
    cy.hash().should('eq', '#roadmap');
  });
});
