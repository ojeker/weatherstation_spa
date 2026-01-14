describe("Weather Dashboard", () => {
  const API_BASE = "https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn";

  beforeEach(() => {
    // Set a fixed date for consistent testing
    cy.clock(new Date("2026-01-11T14:00:00Z").getTime());
  });

  describe("Happy Path", () => {
    beforeEach(() => {
      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_t_now.csv`, {
        fixture: "current-valid.csv",
      }).as("getCurrentData");

      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_h_now.csv`, {
        fixture: "hourly-valid.csv",
      }).as("getHourlyData");
    });

    it("displays loading state initially", () => {
      cy.visit("/");
      cy.contains("Loading").should("be.visible");
    });

    it("loads and displays weather data", () => {
      cy.visit("/");

      cy.wait(["@getCurrentData", "@getHourlyData"]);

      // Station header
      cy.contains("GOE").should("be.visible");

      // Current temperature
      cy.contains("12.3°C").should("be.visible");

      // Sunshine and precipitation icons
      cy.contains("☀").should("be.visible");
      cy.contains("💧").should("be.visible");
    });

    it("displays chart with hourly data", () => {
      cy.visit("/");

      cy.wait(["@getCurrentData", "@getHourlyData"]);

      // Check for chart canvas and legend hints
      cy.get("canvas").should("be.visible");
      cy.get(".legend-hint").should("be.visible");
      cy.get(".legend-hint").contains("%").should("be.visible");
      cy.get(".legend-hint").contains("mm").should("be.visible");
    });
  });

  describe("Schema Error", () => {
    beforeEach(() => {
      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_t_now.csv`, {
        fixture: "missing-column.csv",
      }).as("getCurrentData");

      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_h_now.csv`, {
        fixture: "hourly-valid.csv",
      }).as("getHourlyData");
    });

    it("displays error state for schema mismatch", () => {
      cy.visit("/");

      cy.wait(["@getCurrentData", "@getHourlyData"]);

      cy.contains("Missing required columns").should("be.visible");
      cy.contains("Try again").should("be.visible");
    });
  });

  describe("Network Error", () => {
    beforeEach(() => {
      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_t_now.csv`, {
        forceNetworkError: true,
      }).as("getCurrentDataFail");

      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_h_now.csv`, {
        forceNetworkError: true,
      }).as("getHourlyDataFail");
    });

    it("displays error state for network failure", () => {
      cy.visit("/");

      cy.contains("Try again").should("be.visible");
    });

    it("retries on button click", () => {
      cy.visit("/");

      cy.contains("Try again").should("be.visible");

      // Set up successful response for retry
      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_t_now.csv`, {
        fixture: "current-valid.csv",
      }).as("getCurrentDataRetry");

      cy.intercept("GET", `${API_BASE}/goe/ogd-smn_goe_h_now.csv`, {
        fixture: "hourly-valid.csv",
      }).as("getHourlyDataRetry");

      cy.contains("Try again").click();

      cy.wait(["@getCurrentDataRetry", "@getHourlyDataRetry"]);

      cy.contains("12.3°C").should("be.visible");
    });
  });
});
