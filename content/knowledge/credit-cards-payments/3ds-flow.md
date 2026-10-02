---
slug: "3ds-flow"
domain: "credit-cards-payments"
title: "The 3-D Secure flow"
summary: "How a card-not-present payment is authenticated and authorised, in five steps."
order: 4
steps: [{"title": "Transaction initiated", "detail": "The cardholder starts an online, card-not-present payment."}, {"title": "Authentication performed", "detail": "The issuer's Access Control Server (ACS) verifies the cardholder through 3-D Secure, for example with a one-time passcode or biometrics."}, {"title": "UCAF generated", "detail": "The authentication result is encoded into the Universal Cardholder Authentication Field (UCAF)."}, {"title": "Authorization request sent", "detail": "The merchant sends the transaction data, with the UCAF, to the card network."}, {"title": "Issuer decision", "detail": "The issuer reviews the UCAF and the other data, then approves or declines the transaction."}]
---

3-D Secure adds an authentication step to online card payments. The issuer confirms that the person paying is the cardholder before the payment is authorised, and the result travels with the authorisation request so the issuer can take it into account.
