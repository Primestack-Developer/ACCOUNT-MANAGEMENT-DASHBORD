/**
 * COBBLER — Demo Data Seeder
 * Run: node seed-demo.js
 * Seeds 10 demo records in every table.
 */

const path = require('path');
const fs   = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt  = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'cobbler.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) { console.error('DB error:', err.message); process.exit(1); }
});

const run = (sql, p = []) => new Promise((res, rej) =>
  db.run(sql, p, function(err) { err ? rej(err) : res({ lastID: this.lastID }); })
);
const get = (sql, p = []) => new Promise((res, rej) =>
  db.get(sql, p, (err, row) => err ? rej(err) : res(row))
);
const all = (sql, p = []) => new Promise((res, rej) =>
  db.all(sql, p, (err, rows) => err ? rej(err) : res(rows))
);


// ── Demo Data ────────────────────────────────────────────────────────────────

const CLIENTS = [
  { client_name: 'Ravi Kumar',     company_name: 'RK Retail Pvt Ltd',     contact_number: '9876543210', email: 'ravi@rkretail.com',    meeting_date: '2026-06-01' },
  { client_name: 'Priya Sharma',   company_name: 'PS Fashion House',       contact_number: '9845123678', email: 'priya@psfashion.in',   meeting_date: '2026-06-05' },
  { client_name: 'Arjun Mehta',    company_name: 'Mehta Enterprises',      contact_number: '9712345678', email: 'arjun@mehta.biz',      meeting_date: '2026-06-08' },
  { client_name: 'Sneha Patel',    company_name: 'Patel Brothers',         contact_number: '9632587410', email: 'sneha@patelbrothers.in', meeting_date: '2026-06-10' },
  { client_name: 'Vikram Singh',   company_name: 'VS Sports World',        contact_number: '9514785236', email: 'vikram@vssports.co.in', meeting_date: '2026-06-12' },
  { client_name: 'Anita Joshi',    company_name: 'Joshi Footwear',         contact_number: '9638527410', email: 'anita@joshifootwear.com', meeting_date: '2026-06-15' },
  { client_name: 'Rohit Verma',    company_name: 'Verma Trading Co.',      contact_number: '9752468013', email: 'rohit@vermatrading.in', meeting_date: '2026-06-18' },
  { client_name: 'Deepa Nair',     company_name: 'Nair Lifestyle',         contact_number: '9874563210', email: 'deepa@nairlife.com',   meeting_date: '2026-06-20' },
  { client_name: 'Suresh Iyer',    company_name: 'Iyer Shoe Gallery',      contact_number: '9123456780', email: 'suresh@iyergallery.com', meeting_date: '2026-06-22' },
  { client_name: 'Kavita Reddy',   company_name: 'Reddy Luxury Brands',    contact_number: '9234567801', email: 'kavita@reddyluxury.in', meeting_date: '2026-06-25' },
];

const BUSINESSES = [
  { business_name: 'Cobbler Main Branch',    business_type: 'Shoe Laundry', number_of_branches: '3', business_hours: '9AM - 9PM', services_offered: 'Deep Clean, Premium Care, Lather Care', pickup_and_delivery: 'Yes', online_booking: 'Yes' },
  { business_name: 'Cobbler South Zone',     business_type: 'Shoe Laundry', number_of_branches: '1', business_hours: '10AM - 8PM', services_offered: 'Deep Clean, Sneaker Whitening, Repair', pickup_and_delivery: 'Yes', online_booking: 'No' },
  { business_name: 'Cobbler Express',        business_type: 'Shoe Repair',  number_of_branches: '2', business_hours: '8AM - 10PM', services_offered: 'Sole Replacement, Shoe Painting, Waterproof Coating', pickup_and_delivery: 'No', online_booking: 'Yes' },
  { business_name: 'Cobbler Premium Studio', business_type: 'Shoe Care',    number_of_branches: '1', business_hours: '11AM - 7PM', services_offered: 'Leather Care, Premium Lather Care, Custom Service', pickup_and_delivery: 'Yes', online_booking: 'Yes' },
  { business_name: 'Cobbler City Mall',      business_type: 'Shoe Laundry', number_of_branches: '1', business_hours: '10AM - 10PM', services_offered: 'All Services', pickup_and_delivery: 'No', online_booking: 'Yes' },
  { business_name: 'Cobbler Airport Kiosk',  business_type: 'Shoe Cleaning', number_of_branches: '1', business_hours: '6AM - 11PM', services_offered: 'Quick Clean, Express Polish', pickup_and_delivery: 'No', online_booking: 'No' },
  { business_name: 'Cobbler North Hub',      business_type: 'Shoe Laundry', number_of_branches: '2', business_hours: '9AM - 8PM', services_offered: 'Deep Clean, Sneaker Whitening', pickup_and_delivery: 'Yes', online_booking: 'No' },
  { business_name: 'Cobbler IT Park',        business_type: 'Shoe Care',    number_of_branches: '1', business_hours: '8AM - 8PM', services_offered: 'Premium Care, Leather Care', pickup_and_delivery: 'Yes', online_booking: 'Yes' },
  { business_name: 'Cobbler Franchise A',    business_type: 'Shoe Laundry', number_of_branches: '4', business_hours: '9AM - 9PM', services_offered: 'Full Service Range', pickup_and_delivery: 'Yes', online_booking: 'Yes' },
  { business_name: 'Cobbler Home Service',   business_type: 'Mobile Service', number_of_branches: '1', business_hours: '7AM - 7PM', services_offered: 'Home Pickup, Delivery, All Cleaning', pickup_and_delivery: 'Yes', online_booking: 'Yes' },
];

const CUSTOMERS = [
  { name: 'Aarav Sharma',    mobile: '9876001001', whatsapp: '9876001001', email: 'aarav@gmail.com',     address: '12 MG Road, Bangalore', category: 'VIP',     notes: 'Prefers same-day delivery' },
  { name: 'Bhavna Patel',    mobile: '9876001002', whatsapp: '9876001002', email: 'bhavna@hotmail.com',  address: '45 Park Street, Mumbai', category: 'Regular', notes: 'Collects on Saturdays' },
  { name: 'Chetan Reddy',    mobile: '9876001003', whatsapp: '9876001003', email: 'chetan@yahoo.com',    address: '7 Anna Salai, Chennai', category: 'VIP',     notes: 'Has Nike & Adidas collection' },
  { name: 'Divya Nair',      mobile: '9876001004', whatsapp: '9876001004', email: 'divya@gmail.com',     address: '3 Jubilee Hills, Hyd', category: 'Regular', notes: '' },
  { name: 'Eshan Mehta',     mobile: '9876001005', whatsapp: '9876001005', email: 'eshan@outlook.com',   address: '99 Connaught Place, Delhi', category: 'Regular', notes: 'Allergic to strong chemicals' },
  { name: 'Falguni Joshi',   mobile: '9876001006', whatsapp: '9876001006', email: 'falguni@gmail.com',   address: '56 FC Road, Pune',    category: 'VIP',     notes: 'Monthly subscription customer' },
  { name: 'Gaurav Singh',    mobile: '9876001007', whatsapp: '',            email: 'gaurav@icloud.com',   address: '11 Salt Lake, Kolkata', category: 'Regular', notes: '' },
  { name: 'Heena Khan',      mobile: '9876001008', whatsapp: '9876001008', email: 'heena@gmail.com',     address: '22 Linking Road, Mumbai', category: 'VIP', notes: 'VIP — premium only' },
  { name: 'Ishaan Verma',    mobile: '9876001009', whatsapp: '9876001009', email: 'ishaan@gmail.com',    address: '8 Indiranagar, Bangalore', category: 'Regular', notes: 'Student discount applied' },
  { name: 'Jyoti Iyer',      mobile: '9876001010', whatsapp: '9876001010', email: 'jyoti@rediffmail.com', address: '33 T-Nagar, Chennai', category: 'Regular', notes: '' },
];


const SERVICES = [
  { name: 'Deep Clean',           price: 249 },
  { name: 'Premium Care',         price: 349 },
  { name: 'Lather Care',          price: 349 },
  { name: 'Premium Lather Care',  price: 499 },
  { name: 'Leather Care',         price: 599 },
  { name: 'Sneaker Whitening',    price: 299 },
  { name: 'Shoe Repair',          price: 199 },
  { name: 'Sole Replacement',     price: 449 },
  { name: 'Shoe Painting',        price: 699 },
  { name: 'Waterproof Coating',   price: 399 },
];

// 10 invoices spread over last 30 days
const INVOICE_TEMPLATES = [
  { daysAgo: 1,  status: 'pending',   payStatus: 'pending',  discount: 0,  tax: 5,  items: [[0,2],[5,1]] },  // Deep Clean x2, Sneaker Whitening x1
  { daysAgo: 3,  status: 'pending',   payStatus: 'partial',  discount: 10, tax: 5,  items: [[1,1],[4,1]] },  // Premium Care, Leather Care
  { daysAgo: 5,  status: 'completed', payStatus: 'paid',     discount: 0,  tax: 0,  items: [[0,3]] },        // Deep Clean x3
  { daysAgo: 7,  status: 'completed', payStatus: 'paid',     discount: 5,  tax: 5,  items: [[3,1],[9,1]] },  // Premium Lather, Waterproof
  { daysAgo: 10, status: 'completed', payStatus: 'paid',     discount: 0,  tax: 5,  items: [[2,2],[6,1]] },  // Lather Care x2, Repair
  { daysAgo: 12, status: 'pending',   payStatus: 'pending',  discount: 0,  tax: 0,  items: [[7,1]] },        // Sole Replacement
  { daysAgo: 14, status: 'completed', payStatus: 'paid',     discount: 15, tax: 5,  items: [[1,2],[5,2]] },  // Premium Care x2, Whitening x2
  { daysAgo: 17, status: 'completed', payStatus: 'paid',     discount: 0,  tax: 5,  items: [[8,1]] },        // Shoe Painting
  { daysAgo: 20, status: 'pending',   payStatus: 'pending',  discount: 0,  tax: 0,  items: [[4,1],[9,1]] },  // Leather Care, Waterproof
  { daysAgo: 25, status: 'completed', payStatus: 'paid',     discount: 10, tax: 5,  items: [[0,1],[1,1],[2,1]] }, // Deep, Premium, Lather
];

const EXPENSE_DATA = [
  { category: 'Rent',               description: 'Monthly shop rent — June 2026',        amount: 25000, daysAgo: 1  },
  { category: 'Electricity',        description: 'EB bill June 2026',                    amount: 3800,  daysAgo: 2  },
  { category: 'Salary',             description: 'Staff salary — Ramesh',                amount: 15000, daysAgo: 3  },
  { category: 'Salary',             description: 'Staff salary — Anbu',                  amount: 14000, daysAgo: 3  },
  { category: 'Cleaning Materials', description: 'Detergent, brushes, polish stock',     amount: 4500,  daysAgo: 5  },
  { category: 'Cleaning Materials', description: 'Sneaker whitening solution restock',   amount: 2200,  daysAgo: 8  },
  { category: 'Maintenance',        description: 'Washing machine servicing',             amount: 1800,  daysAgo: 10 },
  { category: 'Water',              description: 'Monthly water bill',                   amount: 900,   daysAgo: 12 },
  { category: 'Miscellaneous',      description: 'Packaging bags & receipt rolls',       amount: 650,   daysAgo: 15 },
  { category: 'Rent',               description: 'Monthly shop rent — May 2026',         amount: 25000, daysAgo: 32 },
];


// ── Helpers ─────────────────────────────────────────────────────────────────

function daysAgoDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function pad(n, len = 6) { return String(n).padStart(len, '0'); }

// ── Seed Function ────────────────────────────────────────────────────────────

async function ensureColumn(table, col, def) {
  const cols = await all(`PRAGMA table_info(${table})`);
  if (!cols.find(c => c.name === col)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    console.log(`     + Added column ${table}.${col}`);
  }
}

async function seed() {
  console.log('\n🌱  COBBLER — Demo Data Seeder\n' + '─'.repeat(45));

  // ── 1. Migrate any missing columns ──────────────────────────────────────────
  console.log('  → Checking schema migrations ...');
  await ensureColumn('business_details', 'services_offered', 'TEXT');
  await ensureColumn('business_details', 'online_booking',   'TEXT');
  await ensureColumn('invoices', 'subtotal',       'REAL DEFAULT 0');
  await ensureColumn('invoices', 'total_paid',     'REAL DEFAULT 0');
  await ensureColumn('invoices', 'balance',        'REAL DEFAULT 0');
  await ensureColumn('invoices', 'payment_status', "TEXT DEFAULT 'pending'");
  await ensureColumn('invoices', 'before_service_photos', 'TEXT');
  await ensureColumn('invoices', 'after_service_photos',  'TEXT');
  await ensureColumn('invoice_items', 'amount',    'REAL DEFAULT 0');
  await ensureColumn('customers', 'whatsapp',      'TEXT');
  await ensureColumn('customers', 'category',      "TEXT DEFAULT 'Regular'");
  console.log('     ✓ Schema ready');

  // ── 2. Client Details ───────────────────────────────────────────────────────
  console.log('  → Seeding client_details ...');
  await run('DELETE FROM client_details');
  for (const c of CLIENTS) {
    await run(
      `INSERT INTO client_details (client_name, company_name, contact_number, email, meeting_date)
       VALUES (?, ?, ?, ?, ?)`,
      [c.client_name, c.company_name, c.contact_number, c.email, c.meeting_date]
    );
  }
  console.log(`     ✓ ${CLIENTS.length} client detail records`);

  // ── 3. Business Details ─────────────────────────────────────────────────────
  console.log('  → Seeding business_details ...');
  await run('DELETE FROM business_details');
  for (const b of BUSINESSES) {
    await run(
      `INSERT INTO business_details
         (business_name, business_type, number_of_branches, business_hours,
          services_offered, pickup_and_delivery, online_booking)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b.business_name, b.business_type, b.number_of_branches, b.business_hours,
       b.services_offered, b.pickup_and_delivery, b.online_booking]
    );
  }
  console.log(`     ✓ ${BUSINESSES.length} business detail records`);


  // ── 4. Services ─────────────────────────────────────────────────────────────
  console.log('  → Seeding services ...');
  await run('DELETE FROM services');
  const svcIds = [];
  for (const s of SERVICES) {
    const r = await run('INSERT INTO services (name, price) VALUES (?, ?)', [s.name, s.price]);
    svcIds.push(r.lastID);
  }
  console.log(`     ✓ ${SERVICES.length} services`);

  // ── 5. Customers ────────────────────────────────────────────────────────────
  console.log('  → Seeding customers ...');
  await run('DELETE FROM customers');
  const custIds = [];
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const c = CUSTOMERS[i];
    const custId = `CUST${pad(i + 1, 4)}`;
    const r = await run(
      `INSERT INTO customers
         (customer_id, name, mobile, whatsapp, address, email, notes, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [custId, c.name, c.mobile, c.whatsapp || null, c.address, c.email, c.notes || null, c.category]
    );
    custIds.push(r.lastID);
  }
  console.log(`     ✓ ${CUSTOMERS.length} customers (${CUSTOMERS.filter(c => c.category === 'VIP').length} VIP)`);

  // ── 6. Invoices + Invoice Items ─────────────────────────────────────────────
  console.log('  → Seeding invoices + items ...');
  await run('DELETE FROM invoice_items');
  await run('DELETE FROM invoices');
  const invoiceIds = [];

  for (let i = 0; i < INVOICE_TEMPLATES.length; i++) {
    const t   = INVOICE_TEMPLATES[i];
    const inv = `INV${pad(i + 1)}`;
    const dt  = daysAgoDate(t.daysAgo);
    const cid = custIds[i % custIds.length];

    // Calculate totals
    let subtotal = 0;
    const resolvedItems = t.items.map(([svcIdx, qty]) => {
      const price = SERVICES[svcIdx].price;
      subtotal += price * qty;
      return { service_id: svcIds[svcIdx], qty, rate: price, amount: price * qty };
    });

    const discountAmt = (subtotal * t.discount) / 100;
    const taxable     = subtotal - discountAmt;
    const taxAmt      = (taxable * t.tax) / 100;
    const total       = taxable + taxAmt;

    // total_paid for partial invoices = 50% of total
    const totalPaid = t.payStatus === 'paid' ? total : (t.payStatus === 'partial' ? Math.round(total * 0.5) : 0);
    const balance   = total - totalPaid;

    const r = await run(
      `INSERT INTO invoices
         (invoice_number, date, customer_id, discount, tax, subtotal, total,
          total_paid, balance, status, payment_status, notes,
          before_service_photos, after_service_photos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inv, dt, cid, t.discount, t.tax, subtotal, total,
       totalPaid, balance, t.status, t.payStatus,
       'Demo invoice', '[]', '[]']
    );
    invoiceIds.push(r.lastID);

    for (const item of resolvedItems) {
      await run(
        'INSERT INTO invoice_items (invoice_id, service_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
        [r.lastID, item.service_id, item.qty, item.rate, item.amount]
      );
    }
  }
  console.log(`     ✓ ${INVOICE_TEMPLATES.length} invoices with line items`);


  // ── 7. Receipts (for paid & partial invoices) ────────────────────────────────
  console.log('  → Seeding receipts ...');
  await run('DELETE FROM receipts');
  const payMethods = ['Cash', 'UPI', 'Card', 'Cash', 'UPI', 'Cash', 'Card', 'UPI', 'Cash', 'UPI'];
  let receiptCount = 0;

  for (let i = 0; i < INVOICE_TEMPLATES.length; i++) {
    const t   = INVOICE_TEMPLATES[i];
    if (t.payStatus === 'pending') continue;

    const invId   = invoiceIds[i];
    const invRow  = await get('SELECT total, total_paid, balance FROM invoices WHERE id = ?', [invId]);
    const rcpNum  = `RCP${pad(receiptCount + 1)}`;
    const method  = payMethods[i];

    await run(
      `INSERT INTO receipts
         (receipt_number, invoice_id, payment_method, amount_received, balance_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rcpNum, invId, method, invRow.total_paid, invRow.balance,
       t.payStatus === 'partial' ? 'Advance payment received' : 'Full payment received']
    );
    receiptCount++;
  }
  console.log(`     ✓ ${receiptCount} receipts`);

  // ── 8. Expenses ──────────────────────────────────────────────────────────────
  console.log('  → Seeding expenses ...');
  await run('DELETE FROM expenses');
  for (const e of EXPENSE_DATA) {
    await run(
      'INSERT INTO expenses (category, description, amount, date) VALUES (?, ?, ?, ?)',
      [e.category, e.description, e.amount, daysAgoDate(e.daysAgo)]
    );
  }
  console.log(`     ✓ ${EXPENSE_DATA.length} expenses`);

  // ── 9. Activity Logs (demo entries) ─────────────────────────────────────────
  console.log('  → Seeding activity_logs ...');
  await run('DELETE FROM activity_logs');
  const logActions = [
    ['LOGIN',   'users',    1, null, null],
    ['CREATE',  'customers',  1, null, '{"name":"Aarav Sharma"}'],
    ['CREATE',  'invoices',   1, null, '{"invoice_number":"INV000001"}'],
    ['CREATE',  'receipts',   1, null, '{"payment_method":"Cash"}'],
    ['UPDATE',  'customers',  2, '{"category":"Regular"}', '{"category":"VIP"}'],
    ['CREATE',  'expenses',   1, null, '{"category":"Rent","amount":25000}'],
    ['UPDATE_STATUS', 'invoices', 3, '{"status":"pending"}', '{"status":"completed"}'],
    ['DELETE',  'expenses',   2, '{"category":"Miscellaneous"}', null],
    ['LOGIN',   'users',    1, null, null],
    ['CREATE',  'customers',  1, null, '{"name":"Jyoti Iyer"}'],
  ];

  for (const [action, table, userId, oldData, newData] of logActions) {
    await run(
      `INSERT INTO activity_logs
         (user_id, username, action, table_name, record_id, old_data, new_data, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'admin', action, table, userId, oldData, newData, '127.0.0.1']
    );
  }
  console.log(`     ✓ ${logActions.length} activity log entries`);


  // ── 10. Admin user (reset to default) ────────────────────────────────────────
  console.log('  → Ensuring admin user ...');
  const existing = await get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!existing) {
    const hash = await bcrypt.hash('111606', 10);
    await run('INSERT INTO users (username, password, role, pin) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'admin', '111606']);
    console.log('     ✓ Admin user created');
  } else {
    console.log('     ✓ Admin user already exists');
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(45));
  console.log('✅  Seeding complete!\n');
  console.log('   Table                Records');
  console.log('   ─────────────────────────────');
  const tables = ['client_details','business_details','customers','services','invoices','invoice_items','receipts','expenses','activity_logs'];
  for (const t of tables) {
    const row = await get(`SELECT COUNT(*) as n FROM ${t}`);
    console.log(`   ${t.padEnd(22)} ${row.n}`);
  }
  console.log('\n   Login → admin / 111606\n');

  db.close();
}

// ── Run ───────────────────────────────────────────────────────────────────────
seed().catch(err => {
  console.error('\n✗ Seeder failed:', err.message);
  db.close();
  process.exit(1);
});
