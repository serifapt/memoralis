const TAG_LABELS: Record<string, string> = {
  velorio: "Velório",
  cortejo: "Cortejo Fúnebre",
  funeral: "Funeral",
  cremacao: "Cremação",
  cemiterio: "Cemitério",
  missa7: "Missa 7º Dia",
  missa30: "Missa 30º Dia",
  missa1ano: "Missa 1 Ano",
};

export function getEventTagLabel(type: string): string {
  return TAG_LABELS[type] || type;
}

export interface CeremonyEvent {
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
}

/**
 * Determines the active tag for an obituary based on its ceremony events.
 * Priority: upcoming mass (within 2 days before or in the future) > funeral/cremação/velório with filled fields.
 */
export function getActiveTag(events: CeremonyEvent[]): string | null {
  if (!events || events.length === 0) return null;

  const now = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(now.getDate() - 2);

  // 1. Check for primary events (funeral, cremação) with future dates first
  const primaryTypes = ["funeral", "cremacao"];
  const primaryEvent = events.find(
    (e) => primaryTypes.includes(e.event_type) && (e.event_date || e.location)
  );

  if (primaryEvent) {
    if (primaryEvent.event_date) {
      const eventDate = new Date(primaryEvent.event_date + "T23:59:59");
      if (eventDate >= now) {
        // Primary event hasn't passed yet — show its tag
        return getEventTagLabel(primaryEvent.event_type);
      }
    } else {
      // Has location but no date — show tag
      return getEventTagLabel(primaryEvent.event_type);
    }
  }

  // 2. Primary events have passed (or don't exist) — check for upcoming masses
  const massTypes = ["missa7", "missa30", "missa1ano"];
  const upcomingMasses = events
    .filter((e) => {
      if (!massTypes.includes(e.event_type) || !e.event_date || !e.location) return false;
      const eventDate = new Date(e.event_date + "T23:59:59");
      return eventDate >= twoDaysAgo;
    })
    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime());

  if (upcomingMasses.length > 0) {
    return getEventTagLabel(upcomingMasses[0].event_type);
  }

  return null;
}

/**
 * Checks if an obituary has an upcoming mass (within 2 days) that should
 * boost it to the top of recent listings.
 */
/**
 * Checks if flower orders are still open for an obituary.
 * Returns true only if there is a funeral/cremation event in the future
 * AND the current time is before (eventDatetime - limiteHoras).
 * If no funeral/cremation event exists, returns false.
 */
export function isFlowerOrderOpen(events: CeremonyEvent[], limiteHoras: number): boolean {
  if (!events || events.length === 0) return false;

  const primaryTypes = ["funeral", "cremacao"];
  const primaryEvent = events.find((e) => primaryTypes.includes(e.event_type) && e.event_date);

  if (!primaryEvent || !primaryEvent.event_date) return false;

  const timePart = primaryEvent.event_time || "00:00:00";
  const eventDatetime = new Date(`${primaryEvent.event_date}T${timePart}`);
  const deadline = new Date(eventDatetime.getTime() - limiteHoras * 60 * 60 * 1000);

  return new Date() < deadline;
}

export function hasUpcomingMass(events: CeremonyEvent[]): boolean {
  if (!events || events.length === 0) return false;
  const now = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(now.getDate() - 2);
  const massTypes = ["missa7", "missa30", "missa1ano"];

  return events.some((e) => {
    if (!massTypes.includes(e.event_type) || !e.event_date || !e.location) return false;
    const eventDate = new Date(e.event_date + "T23:59:59");
    return eventDate >= twoDaysAgo;
  });
}
