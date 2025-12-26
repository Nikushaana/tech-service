export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKUP_STARTED = 'pickup_started',
  PICKED_UP = 'picked_up',
  TO_TECHNICIAN = 'to_technician',
  DELIVERED_TO_TECHNICIAN = 'delivered_to_technician',
  INSPECTION = 'inspection',
  WAITING_APPROVAL = 'waiting_approval',

  //if customer pay for fix
  REPAIRING = 'repairing',
  FIXED_READY = 'fixed_ready',
  RETURNING_FIXED = 'returning_fixed',
  RETURNED_FIXED = 'returned_fixed',
  COMPLETED = 'completed',

  //if customer want to cancel and don't pay for fix
  REPAIR_CANCELLED = 'repair_cancelled',
  BROKEN_READY = 'broken_ready',
  RETURNING_BROKEN = 'returning_broken',
  RETURNED_BROKEN = 'returned_broken',
  CANCELLED = 'cancelled',
}