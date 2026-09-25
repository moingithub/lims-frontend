import { CheckedInSample } from "../services/sampleCheckInService";

export type WorkOrderReportContact = {
  name: string;
  email: string;
  phone: string;
};

const EMPTY_CONTACT: WorkOrderReportContact = {
  name: "",
  email: "",
  phone: "",
};

type ContactRecord = {
  name: string;
  email: string;
  phone: string;
};

type ContactLookup = (id: number) => ContactRecord | undefined;

export const pickValidContactId = (
  ...candidates: unknown[]
): number | undefined => {
  for (const candidate of candidates) {
    if (candidate == null || candidate === "") continue;
    const id = typeof candidate === "number" ? candidate : Number(candidate);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return undefined;
};

const nestedContactFromRecord = (
  record: Record<string, unknown> | null | undefined,
): WorkOrderReportContact | null => {
  if (!record) return null;

  const nested = record.company_contact ?? record.Company_contact;
  if (!nested || typeof nested !== "object") return null;

  const obj = nested as Record<string, unknown>;
  const name = String(obj.name ?? "").trim();
  const email = String(obj.email ?? "").trim();
  const phone = String(obj.phone ?? "").trim();
  if (!name && !email && !phone) return null;

  return { name, email, phone };
};

export const contactFromSample = (
  sample: CheckedInSample,
): WorkOrderReportContact | null => {
  const name = sample.contact_name?.trim() ?? "";
  const email = sample.contact_email?.trim() ?? "";
  const phone = sample.contact_phone?.trim() ?? "";
  if (!name && !email && !phone) return null;

  return { name, email, phone };
};

export const sampleHasContactReference = (sample: CheckedInSample): boolean =>
  Boolean(contactFromSample(sample)) ||
  pickValidContactId(sample.company_contact_id, sample.contact_id) != null;

export const resolveWorkOrderReportContact = (
  samples: CheckedInSample[],
  header: Record<string, unknown> | null | undefined,
  lookup: ContactLookup,
): WorkOrderReportContact => {
  for (const sample of samples) {
    const embedded = contactFromSample(sample);
    if (embedded) return embedded;
  }

  const headerNested = nestedContactFromRecord(header ?? undefined);
  if (headerNested) return headerNested;

  for (const sample of samples) {
    const contactId = pickValidContactId(
      sample.company_contact_id,
      sample.contact_id,
    );
    if (!contactId) continue;

    const contact = lookup(contactId);
    if (contact) return contact;
  }

  const headerContactId = pickValidContactId(
    header?.company_contact_id,
    header?.contact_id,
  );
  if (headerContactId) {
    const contact = lookup(headerContactId);
    if (contact) return contact;
  }

  return EMPTY_CONTACT;
};
