const TAG_LABELS: Record<string, string> = {
  funeral: "Funeral",
  cremacao: "Cremação",
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
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(now.getDate() + 2);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(now.getDate() - 2);

  // Check for upcoming masses first (event_date within -2 days to future)
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

  // Check for funeral/cremação/velório with filled fields
  const primaryTypes = ["funeral", "cremacao", "velorio"];
  const primaryEvent = events.find(
    (e) => primaryTypes.includes(e.event_type) && (e.event_date || e.location)
  );

  if (primaryEvent) {
    return getEventTagLabel(primaryEvent.event_type);
  }

  return null;
}

/**
 * Checks if an obituary has an upcoming mass (within 2 days) that should
 * boost it to the top of recent listings.
 */
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
