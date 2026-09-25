import { AlpEvent, OrganizationNode, Person, PersonStatus, PromotionEvent } from "./types";

/**
 * Returns the current status of a person based on their promotion history.
 */
export function getPersonCurrentStatus(
  personId: string,
  people: Person[],
  promotions: PromotionEvent[]
): PersonStatus {
  const isPromoted = promotions.some(
    (p) => p.personId === personId && p.to === "BP"
  );
  if (isPromoted) return "BP";
  const person = people.find((p) => p.id === personId);
  return person?.initialStatus ?? "BE";
}

/**
 * Calculates personal cumulative ALP for a person.
 */
export function getPersonPersonalAlp(personId: string, events: AlpEvent[]): number {
  return events
    .filter((e) => e.personId === personId)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Recursively builds the organization hierarchy tree.
 */
export function buildOrganizationTree(
  rootPersonId: string,
  people: Person[],
  alpEvents: AlpEvent[],
  promotions: PromotionEvent[]
): OrganizationNode | null {
  const rootPerson = people.find((p) => p.id === rootPersonId);
  if (!rootPerson) return null;

  const currentStatus = getPersonCurrentStatus(rootPersonId, people, promotions);
  const promo = promotions.find((p) => p.personId === rootPersonId && p.to === "BP");
  const personalAlp = getPersonPersonalAlp(rootPersonId, alpEvents);

  // Find direct children
  const directChildren = people.filter((p) => p.parentId === rootPersonId);
  const childNodes: OrganizationNode[] = directChildren
    .map((c) => buildOrganizationTree(c.id, people, alpEvents, promotions))
    .filter((n): n is OrganizationNode => n !== null);

  const teamAlp = childNodes.reduce(
    (sum, c) => sum + c.personalAlp + c.teamAlp,
    0
  );

  // Calculate income this node generated for its direct parent
  const parentEvents = alpEvents.filter((e) => e.personId === rootPersonId);
  let noOverrideAlp = 0;
  let directBpAlp = 0;
  let bpOnBpAlp = 0;
  let directBpMonthly = 0;
  let bpOnBpMonthly = 0;

  parentEvents.forEach((e) => {
    if (e.classification === "NO_OVERRIDE") {
      noOverrideAlp += e.amount;
    } else if (e.classification === "DIRECT_BP_OVERRIDE") {
      directBpAlp += e.amount;
      directBpMonthly += e.monthlyIncomeToParent;
    } else if (e.classification === "BP_ON_BP") {
      bpOnBpAlp += e.amount;
      bpOnBpMonthly += e.monthlyIncomeToParent;
    }
  });

  return {
    person: rootPerson,
    status: currentStatus,
    promotedAt: promo?.date,
    personalAlp,
    teamAlp,
    cumulativeAlp: personalAlp + teamAlp,
    children: childNodes,
    incomeGeneratedForParent: {
      noOverrideAlp,
      directBpAlp,
      bpOnBpAlp,
      directBpMonthly,
      bpOnBpMonthly,
    },
  };
}
