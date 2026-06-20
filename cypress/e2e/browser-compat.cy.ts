describe("browser compatibility smoke test", () => {
  it("loads core dashboard pages directly", () => {
    cy.visit("/");
    cy.contains(/Sentinel/i).should("be.visible");

    cy.visit("/metrics");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/metrics");
    cy.contains(/Metrics|Cost|Latency|API/i, { timeout: 15000 }).should(
      "be.visible"
    );

    cy.visit("/logs");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/logs");
    cy.contains(/Logs|API Call Logs/i, { timeout: 15000 }).should("be.visible");

    cy.visit("/analytics");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/analytics");
    cy.contains(/Analytics/i, { timeout: 15000 }).should("be.visible");

    cy.visit("/playground");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/playground");
    cy.contains(/Playground|Test AI Models|AI Playground/i, {
      timeout: 15000,
    }).should("be.visible");
  });

  it("navigates through sidebar links", () => {
    cy.visit("/");

    cy.get('a[href="/metrics"]').first().click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/metrics");

    cy.get('a[href="/logs"]').first().click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/logs");

    cy.get('a[href="/analytics"]').first().click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/analytics");

    cy.get('a[href="/playground"]').first().click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/playground");
  });

  it("runs playground prompt flow", () => {
    cy.visit("/playground");

    cy.contains(/Run Prompt/i, { timeout: 15000 }).should("be.disabled");

    cy.get("textarea", { timeout: 15000 }).type(
      "Explain AI governance in one sentence."
    );

    cy.contains(/Run Prompt/i).should("not.be.disabled").click();

    cy.contains(/Generating response/i).should("be.visible");

    cy.contains(/mock response|Success|Recent Tests/i, {
      timeout: 15000,
    }).should("be.visible");
  });
});