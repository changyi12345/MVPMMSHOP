import { OrderStatus } from './mock-data';

export function getStatusClass(status: OrderStatus | string): string {
  switch (status) {
    case 'COMPLETED':
      return 'badge badge-gold';
    case 'PENDING':
      return 'badge badge-blue';
    case 'PROCESSING':
      return 'badge badge-yellow status-pulse';
    case 'CANCELLED':
      return 'badge badge-red';
    case 'REFUNDED':
      return 'badge badge-gray';
    default:
      return 'badge badge-gray';
  }
}
