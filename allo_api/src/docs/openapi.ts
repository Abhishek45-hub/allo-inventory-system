export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Allo Inventory Reservation API',
    version: '1.0.0',
  },
  paths: {
    '/api/products': { get: { summary: 'List products with inventory' } },
    '/api/warehouses': { get: { summary: 'List warehouses' } },
    '/api/reservations': { post: { summary: 'Create reservation' } },
    '/api/reservations/{id}/confirm': { post: { summary: 'Confirm reservation' } },
    '/api/reservations/{id}/release': { post: { summary: 'Release reservation' } },
  },
};
