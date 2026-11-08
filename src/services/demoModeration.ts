export type DemoRole = 'viewer' | 'seller' | 'moderator'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export type ModerationRecord = {
  productId: number
  status: ModerationStatus
  updatedAt: string
  updatedBy: DemoRole
}

export function updateModerationRecord(
  records: ModerationRecord[],
  productId: number,
  status: ModerationStatus,
  updatedBy: DemoRole,
  updatedAt: string,
): ModerationRecord[] {
  if (updatedBy !== 'moderator') {
    throw new Error('Only the local demo moderator role can change moderation status.')
  }
  const nextRecord = { productId, status, updatedAt, updatedBy }
  return [nextRecord, ...records.filter((record) => record.productId !== productId)].slice(0, 100)
}

export function moderationStatusFor(records: ModerationRecord[], productId: number): ModerationStatus {
  return records.find((record) => record.productId === productId)?.status ?? 'pending'
}
