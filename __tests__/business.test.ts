import { describe, it, expect } from "vitest";
import {
  calculatePersonalCommission,
  calculateDirectOverride,
  calculateBpOnBp,
  classifyAlpEventContext,
  splitAndClassifyAlpTransaction,
  createInitialSchemeData,
  calculateScenarioIncome,
  DEFAULT_BUSINESS_RULES,
  AlpEvent,
  PromotionEvent,
  Person,
  getPersonPersonalAlp,
} from "../lib/business";

describe("Insurance Agency Business Compensation Engine", () => {
  // 1. BE Rp300m personal -> Rp5,812,500/month
  it("Test 1: BE Rp300m personal produces exactly Rp5,812,500/month", () => {
    const res = calculatePersonalCommission(300_000_000);
    expect(res.monthlyCommission).toBe(5_812_500);
    expect(res.total24Months).toBe(5_812_500 * 24);
  });

  // 2. BE Rp100m personal -> Rp1,937,500/month
  it("Test 2: BE Rp100m personal produces exactly Rp1,937,500/month", () => {
    const res = calculatePersonalCommission(100_000_000);
    expect(res.monthlyCommission).toBe(1_937_500);
  });

  // 3. BE receives zero overriding
  it("Test 3: Parent with BE status receives ZERO overriding from child production", () => {
    const contextBeChild = classifyAlpEventContext("BE", "BE");
    expect(contextBeChild.parentRate).toBe(0);
    expect(contextBeChild.classification).toBe("NO_OVERRIDE");

    const contextBpChild = classifyAlpEventContext("BP", "BE");
    expect(contextBpChild.parentRate).toBe(0);
    expect(contextBpChild.classification).toBe("NO_OVERRIDE");
  });

  // 4. BP receives 12.7875% on eligible BE production
  it("Test 4: BP parent receives 12.7875% Direct BP OR on eligible BE production", () => {
    const context = classifyAlpEventContext("BE", "BP");
    expect(context.parentRate).toBe(0.127875);
    expect(context.classification).toBe("DIRECT_BP_OVERRIDE");

    const directOr = calculateDirectOverride(200_000_000);
    expect(directOr.monthlyOverride).toBe(2_131_250);
  });

  // 5. BP-on-BP = 4.65%
  it("Test 5: BP parent receives 4.65% BP-on-BP OR on post-BP production", () => {
    const context = classifyAlpEventContext("BP", "BP");
    expect(context.parentRate).toBe(0.0465);
    expect(context.classification).toBe("BP_ON_BP");

    const bpOnBp = calculateBpOnBp(100_000_000);
    expect(bpOnBp.monthlyOverride).toBe(387_500);
  });

  // 6. Historical transactions do not retroactively change classification
  it("Test 6: Historical transactions never change classification when parent or child promotes", () => {
    // Initial: Parent BE, Child produces 100m
    const initialEvents: AlpEvent[] = [
      {
        id: "evt-1",
        personId: "child-A",
        amount: 100_000_000,
        date: "2026-01-15",
        producerStatusAtEvent: "BE",
        parentStatusAtEvent: "BE",
        classification: "NO_OVERRIDE",
        rateApplied: 0,
        monthlyIncomeToProducer: 1_937_500,
        monthlyIncomeToParent: 0,
      },
    ];

    // Later: Parent becomes BP
    const people: Person[] = [
      { id: "parent-main", name: "Main", initialStatus: "BE", createdAt: "2026-01-01" },
      { id: "child-A", name: "A", parentId: "parent-main", initialStatus: "BE", createdAt: "2026-01-01" },
    ];
    const promotions: PromotionEvent[] = [
      { id: "promo-1", personId: "parent-main", from: "BE", to: "BP", date: "2026-02-01", triggerAlpTotal: 300_000_000 },
    ];

    // Historical evt-1 STILL has classification "NO_OVERRIDE" and monthlyIncomeToParent 0
    const summary = calculateScenarioIncome("parent-main", people, initialEvents, promotions);
    expect(summary.directBpOverrideMonthly).toBe(0);
    expect(summary.bpOnBpOverrideMonthly).toBe(0);
    expect(summary.breakdown.noOverride.length).toBe(1);
    expect(summary.breakdown.noOverride[0].alp).toBe(100_000_000);
  });

  // 7. Scheme 3 qualification
  it("Test 7: Scheme 3 qualification (100m + 100m + 100m) initializes correctly", () => {
    const scheme3Data = createInitialSchemeData("SCHEME_3", "Saya");
    expect(scheme3Data.people.length).toBe(3); // Main + Mitra A + Mitra B
    expect(scheme3Data.promotionEvents.length).toBe(1);
    expect(scheme3Data.promotionEvents[0].to).toBe("BP");

    const summary = calculateScenarioIncome(
      scheme3Data.mainPerson.id,
      scheme3Data.people,
      scheme3Data.alpEvents,
      scheme3Data.promotionEvents
    );

    // Main person personal commission = 100m * 23.25% / 12 = Rp 1,937,500
    expect(summary.personalAlp).toBe(100_000_000);
    expect(summary.personalCommissionMonthly).toBe(1_937_500);

    // Initial A and B production gives Rp 0 overriding
    expect(summary.directBpOverrideMonthly).toBe(0);
    expect(summary.bpOnBpOverrideMonthly).toBe(0);
    expect(summary.totalMonthlyIncome).toBe(1_937_500);
  });

  // 8 & 9. Exact Mandatory Scenario
  describe("Mandatory Acceptance Test Scenario (Section 9)", () => {
    it("Step 1: Main qualifies via Scheme 3 -> Personal: Rp1,937,500, OR: Rp0, Total: Rp1,937,500", () => {
      const data = createInitialSchemeData("SCHEME_3", "Main Person");
      const summary = calculateScenarioIncome(
        data.mainPerson.id,
        data.people,
        data.alpEvents,
        data.promotionEvents
      );

      expect(summary.personalCommissionMonthly).toBe(1_937_500);
      expect(summary.directBpOverrideMonthly).toBe(0);
      expect(summary.bpOnBpOverrideMonthly).toBe(0);
      expect(summary.totalMonthlyIncome).toBe(1_937_500);
    });

    it("Step 2: A grows from 100m -> 300m (+200m). Main total monthly = exactly Rp4,068,750", () => {
      const data = createInitialSchemeData("SCHEME_3", "Main Person");
      const personA = data.people.find((p) => p.name.includes("A"))!;
      expect(personA).toBeDefined();

      // Current ALP of A before this transaction is 100m.
      const currentAlpA = getPersonPersonalAlp(personA.id, data.alpEvents);
      expect(currentAlpA).toBe(100_000_000);

      // Now Main is already BP!
      // A produces +200m (reaching 300m).
      // A is BE during this 200m increment.
      const tranches = splitAndClassifyAlpTransaction(
        currentAlpA,
        200_000_000,
        "BP", // Main's status at event
        DEFAULT_BUSINESS_RULES
      );

      expect(tranches.length).toBe(1);
      expect(tranches[0].amount).toBe(200_000_000);
      expect(tranches[0].classification).toBe("DIRECT_BP_OVERRIDE");
      expect(tranches[0].rateAppliedToParent).toBe(0.127875);
      expect(tranches[0].monthlyIncomeToParent).toBe(2_131_250);
      expect(tranches[0].triggersPromotion).toBe(true); // Reaches 300m

      // Append event to simulation
      const newEvent: AlpEvent = {
        id: "alp-a-increment-200m",
        personId: personA.id,
        amount: 200_000_000,
        date: "2026-03-01",
        description: "A bertumbuh dari 100jt ke 300jt",
        producerStatusAtEvent: "BE",
        parentStatusAtEvent: "BP",
        classification: "DIRECT_BP_OVERRIDE",
        rateApplied: 0.127875,
        monthlyIncomeToProducer: (200_000_000 * 0.2325) / 12,
        monthlyIncomeToParent: 2_131_250,
      };

      const updatedEvents = [...data.alpEvents, newEvent];

      // A is promoted to BP at 300m
      const promoA: PromotionEvent = {
        id: "promo-a-bp",
        personId: personA.id,
        from: "BE",
        to: "BP",
        date: "2026-03-01",
        triggerAlpTotal: 300_000_000,
        notes: "A mencapai kualifikasi BP Rp300jt",
      };
      const updatedPromotions = [...data.promotionEvents, promoA];

      const summary = calculateScenarioIncome(
        data.mainPerson.id,
        data.people,
        updatedEvents,
        updatedPromotions
      );

      expect(summary.personalCommissionMonthly).toBe(1_937_500);
      expect(summary.directBpOverrideMonthly).toBe(2_131_250);
      expect(summary.bpOnBpOverrideMonthly).toBe(0); // ZERO BP-on-BP from historical 300m!
      // Total monthly income: 1,937,500 + 2,131,250 = 4,068,750
      expect(summary.totalMonthlyIncome).toBe(4_068_750);
    });

    it("Step 3: A later grows from 300m -> 400m (+100m). Main total monthly = exactly Rp4,456,250", () => {
      const data = createInitialSchemeData("SCHEME_3", "Main Person");
      const personA = data.people.find((p) => p.name.includes("A"))!;

      // Step 2 events
      const event2: AlpEvent = {
        id: "alp-a-increment-200m",
        personId: personA.id,
        amount: 200_000_000,
        date: "2026-03-01",
        description: "A bertumbuh dari 100jt ke 300jt",
        producerStatusAtEvent: "BE",
        parentStatusAtEvent: "BP",
        classification: "DIRECT_BP_OVERRIDE",
        rateApplied: 0.127875,
        monthlyIncomeToProducer: (200_000_000 * 0.2325) / 12,
        monthlyIncomeToParent: 2_131_250,
      };

      const promoA: PromotionEvent = {
        id: "promo-a-bp",
        personId: personA.id,
        from: "BE",
        to: "BP",
        date: "2026-03-01",
        triggerAlpTotal: 300_000_000,
      };

      // Step 3: A is now BP, Main is BP. A generates additional +100m (from 300m to 400m).
      const tranches3 = splitAndClassifyAlpTransaction(
        300_000_000,
        100_000_000,
        "BP",
        DEFAULT_BUSINESS_RULES
      );

      expect(tranches3.length).toBe(1);
      expect(tranches3[0].amount).toBe(100_000_000);
      expect(tranches3[0].classification).toBe("BP_ON_BP");
      expect(tranches3[0].rateAppliedToParent).toBe(0.0465);
      expect(tranches3[0].monthlyIncomeToParent).toBe(387_500);

      const event3: AlpEvent = {
        id: "alp-a-increment-100m-post-bp",
        personId: personA.id,
        amount: 100_000_000,
        date: "2026-06-01",
        description: "A bertumbuh dari 300jt ke 400jt setelah resmi BP",
        producerStatusAtEvent: "BP",
        parentStatusAtEvent: "BP",
        classification: "BP_ON_BP",
        rateApplied: 0.0465,
        monthlyIncomeToProducer: (100_000_000 * 0.2325) / 12,
        monthlyIncomeToParent: 387_500,
      };

      const finalEvents = [...data.alpEvents, event2, event3];
      const finalPromotions = [...data.promotionEvents, promoA];

      const summary = calculateScenarioIncome(
        data.mainPerson.id,
        data.people,
        finalEvents,
        finalPromotions
      );

      expect(summary.personalCommissionMonthly).toBe(1_937_500);
      expect(summary.directBpOverrideMonthly).toBe(2_131_250);
      expect(summary.bpOnBpOverrideMonthly).toBe(387_500);

      // Main total monthly income: 1,937,500 + 2,131,250 + 387,500 = 4,456,250
      expect(summary.totalMonthlyIncome).toBe(4_456_250);
    });

    it("Step 4: Cross-boundary transaction (e.g., A at 250m produces 100m -> 350m) correctly splits into Direct BP OR and BP-on-BP OR", () => {
      // 50m produced while BE -> Direct BP OR
      // 50m produced while BP -> BP-on-BP OR
      const tranches = splitAndClassifyAlpTransaction(250_000_000, 100_000_000, "BP");
      expect(tranches.length).toBe(2);

      expect(tranches[0].amount).toBe(50_000_000);
      expect(tranches[0].classification).toBe("DIRECT_BP_OVERRIDE");
      expect(tranches[0].monthlyIncomeToParent).toBe(Math.round((50_000_000 * 0.127875) / 12));
      expect(tranches[0].triggersPromotion).toBe(true);

      expect(tranches[1].amount).toBe(50_000_000);
      expect(tranches[1].classification).toBe("BP_ON_BP");
      expect(tranches[1].monthlyIncomeToParent).toBe(Math.round((50_000_000 * 0.0465) / 12));
      expect(tranches[1].triggersPromotion).toBe(false);
    });
  });
});
