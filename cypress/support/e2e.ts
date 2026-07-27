const API_URL = 'http://localhost:3000'; // o el puerto que uses

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/auth/login`,
    body: { email, password },
  }).then((resp) => {
    expect(resp.status).to.eq(201);
    const { access_token, user } = resp.body.data;
    window.localStorage.setItem('token', access_token);
    window.localStorage.setItem('user', JSON.stringify(user));
  });
  cy.visit('/dashboard');
});

Cypress.Commands.add('cleanupTestData', () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  cy.request({
    method: 'GET',
    url: `${API_URL}/materiales?search=E2E_TEST`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((resp) => {
    if (resp.status === 200 && resp.body?.data) {
      resp.body.data.forEach((m: { id: number }) => {
        cy.request({
          method: 'DELETE',
          url: `${API_URL}/materiales/${m.id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      cleanupTestData(): Chainable<void>;
    }
  }
}