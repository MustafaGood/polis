/**
 * Alpha client accessibility smoke (cypress-axe)
 *
 * Checks critical/serious axe violations on the participation voting UI.
 * Creates a seeded conversation unless CYPRESS_A11Y_CONVERSATION_ID is set.
 */

import {
  createTestConversation,
  addCommentToConversation,
} from '../../support/conversation-helpers.js'

function logViolations(violations) {
  cy.task(
    'log',
    JSON.stringify(
      violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map(({ target }) => target),
      })),
    ),
  )
}

describe('Alpha Client: Accessibility smoke', function () {
  let conversationId

  before(function () {
    conversationId = Cypress.env('A11Y_CONVERSATION_ID')
    if (conversationId) return

    createTestConversation({
      topic: 'Accessibility smoke test',
      description: 'Seeded conversation for accessibility tests',
    }).then((id) => {
      conversationId = id
      return addCommentToConversation(id, 'A statement for accessibility testing')
    })
  })

  beforeEach(function () {
    cy.clearAllLocalStorage()
    cy.intercept({ method: 'GET', url: '**/api/v3/nextComment*' }).as('nextComment')
    cy.visit(`/alpha/${conversationId}`)
    cy.wait('@nextComment', { requestTimeout: 30000, responseTimeout: 30000 })
  })

  it('has no critical or serious axe violations on the statement voting card', function () {
    cy.get('[data-testid="vote-agree"]', { timeout: 15000 }).should('be.visible')

    cy.injectAxe()
    cy.checkA11y('.statement-card', { includedImpacts: ['critical', 'serious'] }, logViolations)
  })

  it('has no critical or serious axe violations on the comment submission form', function () {
    cy.get('.submit-form', { timeout: 15000 }).should('be.visible')

    cy.injectAxe()
    cy.checkA11y('.submit-form', { includedImpacts: ['critical', 'serious'] }, logViolations)
  })

  it('moves focus between voting controls with the keyboard', function () {
    cy.get('[data-testid="vote-agree"]', { timeout: 15000 }).should('be.visible')
    cy.get('[data-testid="vote-agree"]').focus()

    cy.press(Cypress.Keyboard.Keys.TAB)
    cy.focused().should('have.attr', 'data-testid', 'vote-disagree')
    cy.press(Cypress.Keyboard.Keys.TAB)
    cy.focused().should('have.attr', 'data-testid', 'vote-pass')
  })

  it('associates a duplicate submission error with the field', function () {
    cy.intercept('POST', '**/api/v3/comments*', {
      statusCode: 409,
      body: { error: 'polis_err_post_comment_duplicate' },
    }).as('duplicateComment')

    cy.get('#comment-textarea', { timeout: 30000 })
      .should('be.visible')
      .closest('astro-island')
      .should('not.have.attr', 'ssr')
    cy.get('#comment-textarea').type('Test statement')
    cy.get('.submit-form button[type="submit"]').click()
    cy.wait('@duplicateComment').its('response.statusCode').should('eq', 409)

    cy.get('#survey-form-error').should('be.visible').and('have.attr', 'role', 'alert')
    cy.get('#comment-textarea')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.attr', 'aria-describedby')
      .and('contain', 'survey-form-error')
    cy.get('#comment-textarea').should('have.value', 'Test statement')

    cy.injectAxe()
    cy.checkA11y('.submit-form', { includedImpacts: ['critical', 'serious'] }, logViolations)
  })
})
