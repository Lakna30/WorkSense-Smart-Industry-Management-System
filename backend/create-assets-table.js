import knex from 'knex';
import knexConfig from './knexfile.js';

const db = knex(knexConfig.development);

async function createAssetsTable() {
  try {
    // Check if table exists
    const exists = await db.schema.hasTable('assets');
    if (exists) {
      console.log('Assets table already exists');
      return;
    }

    // Create the table
    await db.schema.createTable('assets', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.string('location').notNullable();
      table.string('status').notNullable().defaultTo('available');
      table.text('description');
      table.decimal('purchase_price', 10, 2);
      table.date('purchase_date');
      table.string('serial_number');
      table.string('model');
      table.string('manufacturer');
      table.string('rented_to');
      table.date('rented_until');
      table.date('next_maintenance');
      table.text('maintenance_notes');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });

    console.log('Assets table created successfully');

    // Insert sample data
    await db('assets').insert([
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

    console.log('Sample assets data inserted successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

createAssetsTable();
