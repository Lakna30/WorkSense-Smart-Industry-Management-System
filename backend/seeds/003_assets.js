export async function seed(knex) {
  // Delete existing entries
  await knex('assets').del();
  
  // Insert seed entries
  return knex('assets').insert([
    {
      name: 'Industrial Crane Model A',
      type: 'Heavy Machinery',
      location: 'Warehouse A',
      status: 'available',
      description: 'Heavy-duty industrial crane for lifting operations',
      purchase_price: 150000.00,
      purchase_date: '2023-01-15',
      serial_number: 'CRN-001-A',
      model: 'Model A',
      manufacturer: 'Industrial Corp',
      next_maintenance: '2024-02-15'
    },
    {
      name: 'Forklift Truck',
      type: 'Transport Equipment',
      location: 'Warehouse B',
      status: 'rented',
      description: 'Electric forklift for material handling',
      purchase_price: 45000.00,
      purchase_date: '2023-03-20',
      serial_number: 'FLT-002-B',
      model: 'Electric Pro',
      manufacturer: 'LiftMaster',
      rented_to: 'ABC Construction',
      rented_until: '2024-01-30',
      next_maintenance: '2024-03-20'
    },
    {
      name: 'Conveyor Belt System',
      type: 'Production Equipment',
      location: 'Production Line 1',
      status: 'maintenance',
      description: 'Automated conveyor system for production line',
      purchase_price: 75000.00,
      purchase_date: '2022-11-10',
      serial_number: 'CBS-003-C',
      model: 'AutoFlow 2000',
      manufacturer: 'ConveyTech',
      next_maintenance: '2024-01-10',
      maintenance_notes: 'Motor replacement scheduled'
    },
    {
      name: 'Safety Equipment Set',
      type: 'Safety Equipment',
      location: 'Safety Storage',
      status: 'available',
      description: 'Complete safety equipment set including helmets, vests, and tools',
      purchase_price: 2500.00,
      purchase_date: '2023-06-05',
      serial_number: 'SAF-004-D',
      model: 'Complete Set',
      manufacturer: 'SafeGuard Inc',
      next_maintenance: '2024-06-05'
    }
  ]);
}
