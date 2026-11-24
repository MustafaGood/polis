/**
 * Alpha client: Treevite (invite codes) gating
 *
 * This feature is new (no legacy test).
 * Assertions focus on participant UI gating only:
 * - When treevite is enabled, invite/login code form is shown
 * - Voting is blocked until invite-code or login-code auth
 * - Commenting is blocked until invite-code or login-code auth
 * Set CYPRESS_TREEVITE_CONVERSATION_ID to reuse an isolated invite-gated conversation.
 */

import { setupTestConversation } from '../../support/conversation-helpers.js'

function logViolations(violations) {
  cy.task(
    'log',
    JSON.stringify(
      violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
      })),
    ),
  )
}

describe('Alpha Client: Invite codes (Treevite)', function () {
  let conversationId

  before(function () {
    conversationId = Cypress.env('TREEVITE_CONVERSATION_ID')
    if (conversationId) return

    setupTestConversation({
      topic: 'Alpha Treevite gating',
      description: 'Treevite enabled: participants must enter invite/login code',
      treeviteEnabled: true,
      comments: ['Seed statement 1', 'Seed statement 2', 'Seed statement 3'],
    }).then((result) => {
      conversationId = result.conversationId
      cy.log(`✅ Test conversation created (treevite enabled): ${conversationId}`)
    })
  })

  beforeEach(function () {
    cy.clearAllLocalStorage()
  })

  it('shows invite code submission form and blocks voting + commenting', function () {
    cy.visit(`/alpha/${conversationId}`)

    // Invite gate visible
    cy.get('.invite-code-submission-form').should('be.visible')
    cy.get('.invite-code-submission-form-container input[type="text"]').should('have.length', 2)

    // Buttons should be disabled until codes are entered
    cy.get('.invite-code-submission-form-container button').first().should('be.disabled')
    cy.get('.invite-code-submission-form-container button').last().should('be.disabled')

    // Voting UI should not be available
    cy.get('[data-testid="vote-agree"]').should('not.exist')
    cy.get('[data-testid="vote-disagree"]').should('not.exist')
    cy.get('[data-testid="vote-pass"]').should('not.exist')

    // Comment submission UI should not be available
    cy.get('.submit-form').should('not.exist')
    cy.get('.submit-form textarea').should('not.exist')

    cy.get('#invite-code-input').closest('astro-island').should('not.have.attr', 'ssr')
    cy.injectAxe()
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)
  })

  it('submits an invite using simulated Enter and associates an invalid-code error', function () {
    cy.intercept('POST', '**/api/v3/treevite/acceptInvite*', {
      statusCode: 400,
      body: 'polis_err_treevite_invalid_or_used_invite',
    }).as('acceptInvite')
    cy.visit(`/alpha/${conversationId}?ui_lang=en`)
    cy.get('#invite-code-input').closest('astro-island').should('not.have.attr', 'ssr')
    cy.get('#invite-code-input').type('invalid-invite')
    cy.get('#invite-code-input').closest('form').find('button').should('be.enabled').focus()
    // cy.press(Enter) does not activate native submit buttons in the tested Chromium setup.
    cy.focused().type('{enter}')
    cy.wait('@acceptInvite').its('response.statusCode').should('eq', 400)
    cy.get('#invite-code-error').should('be.visible').and('have.attr', 'role', 'alert')
    cy.get('#invite-code-input')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.attr', 'aria-describedby', 'invite-code-error')
    cy.get('#invite-code-input')
      .closest('form')
      .find('button')
      .should('not.have.attr', 'aria-disabled')
    cy.injectAxe()
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)
  })

  it('submits a login code using simulated Enter and associates an invalid-code error', function () {
    cy.intercept('POST', '**/api/v3/treevite/login*', {
      statusCode: 401,
      body: 'polis_err_treevite_login_code_invalid',
    }).as('login')
    cy.visit(`/alpha/${conversationId}?ui_lang=en`)
    cy.get('#login-code-input').closest('astro-island').should('not.have.attr', 'ssr')
    cy.get('#login-code-input').type('invalid-login')
    cy.get('#login-code-input').closest('form').find('button').should('be.enabled').focus()
    cy.focused().type('{enter}')
    cy.wait('@login').its('response.statusCode').should('eq', 401)
    cy.get('#invite-code-error').should('be.visible').and('have.attr', 'role', 'alert')
    cy.get('#login-code-input')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.attr', 'aria-describedby', 'invite-code-error')
    cy.get('#login-code-input')
      .closest('form')
      .find('button')
      .should('not.have.attr', 'aria-disabled')
    cy.injectAxe()
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)
  })

  it('reports invite and login service errors without marking the codes invalid', function () {
    ;[
      { endpoint: 'acceptInvite', input: '#invite-code-input' },
      { endpoint: 'login', input: '#login-code-input' },
    ].forEach(({ endpoint, input }) => {
      cy.intercept('POST', `**/api/v3/treevite/${endpoint}*`, {
        statusCode: 503,
        body: 'unavailable',
      }).as('failedCode')
      cy.visit(`/alpha/${conversationId}?ui_lang=en`)
      cy.get(input).closest('astro-island').should('not.have.attr', 'ssr')
      cy.get(input).type('test-code')
      cy.get(input).closest('form').find('button').should('be.enabled').click()
      cy.wait('@failedCode').its('response.statusCode').should('eq', 503)
      cy.get('#invite-code-error[role="alert"]').should('be.visible')
      cy.get(input)
        .should('have.value', 'test-code')
        .and('have.attr', 'aria-invalid', 'false')
        .and('have.attr', 'aria-describedby', 'invite-code-error')
      cy.injectAxe()
      cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)
    })
  })

  it('scans simulated successful invite and login transitions', function () {
    ;[
      {
        endpoint: 'acceptInvite',
        input: '#invite-code-input',
        status: 201,
        message: 'Invite accepted.',
      },
      {
        endpoint: 'login',
        input: '#login-code-input',
        status: 200,
        message: 'Success! You are now logged in.',
      },
    ].forEach(({ endpoint, input, status, message }) => {
      cy.intercept('POST', `**/api/v3/treevite/${endpoint}*`, {
        statusCode: status,
        body: { status: 'ok' },
      }).as('successfulCode')
      cy.visit(`/alpha/${conversationId}?ui_lang=en`)
      cy.get(input).closest('astro-island').should('not.have.attr', 'ssr')
      cy.get(input).type('test-code')
      cy.get(input).closest('form').find('button').should('be.enabled').click()
      cy.wait('@successfulCode').its('response.statusCode').should('eq', status)
      cy.get('[role="status"]').contains(message).should('be.visible')
      cy.get('.invite-code-submission-form').should('not.exist')
      cy.injectAxe()
      cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)
    })
  })

  it('keeps the pending invite state accessible while the request is in flight', function () {
    let releaseResponse
    cy.intercept('POST', '**/api/v3/treevite/acceptInvite*', (request) => {
      return new Cypress.Promise((resolve) => {
        releaseResponse = () => {
          request.reply({ statusCode: 400, body: 'polis_err_treevite_invalid_or_used_invite' })
          resolve()
        }
      })
    }).as('acceptInvite')
    cy.visit(`/alpha/${conversationId}?ui_lang=en`)
    cy.get('#invite-code-input').closest('astro-island').should('not.have.attr', 'ssr')
    cy.get('#invite-code-input').type('invalid-invite')
    cy.get('#invite-code-input').closest('form').find('button').should('be.enabled').focus()
    cy.focused().type('{enter}')
    cy.get('#invite-code-input')
      .closest('form')
      .find('button')
      .should('have.attr', 'aria-disabled', 'true')

    cy.injectAxe()
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)
    cy.then(() => {
      expect(releaseResponse).to.be.a('function')
      releaseResponse()
    })
    cy.wait('@acceptInvite')
    cy.get('#invite-code-error').should('be.visible')
  })

  it('keeps keyboard focus in the login-code dialog and scans it with axe', function () {
    cy.intercept('POST', '**/api/v3/treevite/acceptInvite*', {
      statusCode: 201,
      body: { status: 'ok', login_code: 'test-login-code' },
    }).as('acceptInvite')
    cy.visit(`/alpha/${conversationId}?ui_lang=en`)
    cy.get('#invite-code-input').closest('astro-island').should('not.have.attr', 'ssr')
    cy.get('astro-island[component-url*="TreeviteLoginCodeModal"]').should('not.have.attr', 'ssr')
    cy.get('#invite-code-input').type('test-invite')
    cy.get('#invite-code-input').closest('form').find('button').should('be.enabled').focus()
    cy.focused().type('{enter}')
    cy.wait('@acceptInvite')
    cy.get('[role="dialog"]').should('be.visible')
    cy.focused().should('have.class', 'tv-primary')
    cy.press(Cypress.Keyboard.Keys.TAB)
    cy.focused().should('have.class', 'tv-copy')
    cy.press(Cypress.Keyboard.Keys.TAB)
    cy.focused().should('have.class', 'tv-primary')

    cy.injectAxe()
    cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] }, logViolations)

    cy.press(Cypress.Keyboard.Keys.ESC)
    cy.get('[role="dialog"]').should('not.exist')
    cy.focused().should('have.attr', 'data-participation-content')
  })
})
