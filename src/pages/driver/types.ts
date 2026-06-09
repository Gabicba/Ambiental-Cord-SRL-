export type DriverScreen =
  | 'login'
  | 'home'
  | 'route'
  | 'history'
  | 'profile'
  | 'detail'
  | 'startVisit'
  | 'delayed'
  | 'collect'
  | 'photos'
  | 'summary'
  | 'receipt'
  | 'endDay';

export type VisitStatusOption = 'Open' | 'Closed' | 'NoOil' | 'Rejected' | 'Delayed';

export interface ActiveVisitState {
  visitId: string;
  status: VisitStatusOption;
  liters: string;
  receiverName: string;
  receiverDni: string;
  oilPaid: boolean;
  oilAmount: string;
  oilPriceAtCollection: number;
  totalOilPayment: number;
  products: string;
  observations: string;
  photos: string[];
  arrivedAt: string;
  gpsLat: number;
  gpsLng: number;
  delayReason: string;
  delayReturnTime: string;
  // Detergente - solo control de bidones entregados
  detergentDelivered: boolean;
  detergentQuantity: string;
  totalDetergentPayment: number;
}

export const photoPlaceholders = [
  'https://readdy.ai/api/search-image?query=used%20cooking%20oil%20collection%20container%20at%20a%20restaurant%20back%20door%20with%20green%20environmental%20signage%20and%20a%20delivery%20truck%20visible&width=400&height=300&seq=101',
  'https://readdy.ai/api/search-image?query=large%20hotel%20commercial%20kitchen%20used%20cooking%20oil%20collection%20with%20multiple%20containers%20and%20professional%20logistics%20setup&width=400&height=300&seq=103',
  'https://readdy.ai/api/search-image?query=small%20bar%20restaurant%20back%20alley%20used%20cooking%20oil%20drum%20collection%20with%20vintage%20architecture%20in%20background&width=400&height=300&seq=104',
  'https://readdy.ai/api/search-image?query=industrial%20food%20production%20facility%20used%20cooking%20oil%20collection%20point%20with%20large%20volume%20containers%20and%20safety%20signage&width=400&height=300&seq=105',
  'https://readdy.ai/api/search-image?query=upscale%20restaurant%20exterior%20with%20used%20cooking%20oil%20collection%20logistics%20worker%20in%20professional%20uniform%20at%20loading%20area&width=400&height=300&seq=106',
  'https://readdy.ai/api/search-image?query=closed%20restaurant%20front%20door%20with%20closed%20sign%20and%20used%20cooking%20oil%20collection%20notice%20posted%20on%20window&width=400&height=300&seq=107',
  'https://readdy.ai/api/search-image?query=small%20pizzeria%20kitchen%20with%20empty%20used%20cooking%20oil%20container%20showing%20no%20oil%20to%20collect&width=400&height=300&seq=108',
];