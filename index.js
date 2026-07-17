const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cobbler-shoe-laundry-secret-key-2024';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'cobbler.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), 'backup');
const LOGO_PATH = path.join(__dirname, 'Cobbler Logo_page-0001.jpg');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function isFilled(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function validateRequiredFields(fields, data) {
  return fields.filter((field) => !isFilled(data[field]));
}

async function ensureColumn(tableName, columnName, columnDefinition) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
}

async function logActivity(userId, username, action, tableName, recordId, oldData, newData, ip, userAgent) {
  try {
    await run(
      `INSERT INTO activity_logs (
        user_id, username, action, table_name, record_id,
        old_data, new_data, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        username || 'System',
        action,
        tableName || null,
        recordId || null,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ip || null,
        userAgent || null,
      ]
    );
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
}

// Calculate invoice total paid and update status
async function updateInvoicePaymentStatus(invoiceId) {
  // Sum all receipts for this invoice
  const receipts = await all('SELECT SUM(amount_received) as total_paid FROM receipts WHERE invoice_id = ?', [invoiceId]);
  const totalPaid = Number(receipts[0]?.total_paid || 0);
  
  // Get invoice total
  const invoice = await get('SELECT total FROM invoices WHERE id = ?', [invoiceId]);
  if (!invoice) return;
  
  const balance = Number(invoice.total) - totalPaid;
  let status = 'pending';
  if (totalPaid >= Number(invoice.total)) {
    status = 'paid';
  } else if (totalPaid > 0) {
    status = 'partial';
  }
  
  await run('UPDATE invoices SET total_paid = ?, balance = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
    [totalPaid, balance, status, invoiceId]);
}

async function initializeDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    pin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS client_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    company_name TEXT,
    contact_number TEXT,
    email TEXT,
    meeting_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS business_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT,
    business_type TEXT,
    number_of_branches TEXT,
    business_hours TEXT,
    services_offered TEXT,
    pickup_and_delivery TEXT,
    online_booking TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT,
    address TEXT,
    email TEXT,
    notes TEXT,
    preferences TEXT,
    category TEXT DEFAULT 'Regular',
    profile_photo TEXT,
    company_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    price REAL NOT NULL,
    add_ons TEXT,
    packages TEXT,
    is_custom INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL,
    order_date TEXT,
    delivery_date TEXT,
    customer_id INTEGER,
    customer_name TEXT,
    item_details TEXT,
    category TEXT,
    condition_before TEXT,
    customer_remarks TEXT,
    before_service_photos TEXT,
    after_service_photos TEXT,
    order_status TEXT DEFAULT 'Received',
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    additional_charges REAL DEFAULT 0,
    advance_payment REAL DEFAULT 0,
    subtotal REAL NOT NULL,
    total REAL NOT NULL,
    total_paid REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    rate REAL NOT NULL,
    amount REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_number TEXT NOT NULL UNIQUE,
    invoice_id INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    amount_received REAL NOT NULL,
    balance_amount REAL NOT NULL,
    notes TEXT,
    receipt_photos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_data TEXT,
    new_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  const adminUser = await get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminUser) {
    const passwordHash = await bcrypt.hash('111606', 10);
    await run(
      'INSERT INTO users (username, password, role, pin) VALUES (?, ?, ?, ?)',
      ['admin', passwordHash, 'admin', '111606']
    );
  }

  const defaultServices = [
    ['Deep Clean', 249],
    ['Premium Care', 349],
    ['Lather Care', 349],
    ['Premium Lather Care', 499],
  ];

  for (const [name, price] of defaultServices) {
    await run('INSERT OR IGNORE INTO services (name, price) VALUES (?, ?)', [name, price]);
  }
}

function asyncHandler(handler) {
  return (req, res) => {
    Promise.resolve(handler(req, res)).catch((error) => {
      console.error('Unhandled route error:', error);
      const statusCode = error && error.code === 'SQLITE_CONSTRAINT' ? 409 : 500;
      res.status(statusCode).json({ message: error.message || 'Server error' });
    });
  };
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/assets/logo', (_req, res) => {
  res.sendFile(LOGO_PATH);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { username, password, pin } = req.body;
  const missingFields = validateRequiredFields(['username', 'password'], req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
  }

  const user = await get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) {
    await logActivity(null, username, 'LOGIN_FAILED', 'users', null, null, null, req.ip, req.headers['user-agent']);
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await logActivity(null, username, 'LOGIN_FAILED', 'users', user.id, null, null, req.ip, req.headers['user-agent']);
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  if (isFilled(user.pin) && isFilled(pin) && pin !== user.pin) {
    await logActivity(user.id, username, 'PIN_FAILED', 'users', user.id, null, null, req.ip, req.headers['user-agent']);
    return res.status(400).json({ message: 'Invalid PIN' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  await logActivity(user.id, username, 'LOGIN', 'users', user.id, null, null, req.ip, req.headers['user-agent']);

  const { password: _password, pin: _pin, ...safeUser } = user;
  res.json({ token, user: safeUser });
}));

app.post('/api/auth/reset-password', asyncHandler(async (req, res) => {
  // For this demo, we'll let any authenticated user reset password, but in real app, you should check auth token
  const { currentPassword, newPassword } = req.body;
  const missingFields = validateRequiredFields(['currentPassword', 'newPassword'], req.body);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
  }

  // Get admin user (for demo)
  const user = await get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPasswordHash, user.id]);
  await logActivity(user.id, 'admin', 'PASSWORD_RESET', 'users', user.id, null, null, req.ip, req.headers['user-agent']);
  res.json({ message: 'Password reset successfully' });
}));

app.get('/api/customers', asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM customers';
  let params = [];
  
  if (search || category) {
    query += ' WHERE';
    const conditions = [];
    if (search) {
      conditions.push(' (name LIKE ? OR mobile LIKE ? OR customer_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push(' category = ?');
      params.push(category);
    }
    query += conditions.join(' AND');
  }
  
  query += ' ORDER BY id DESC';
  const customers = await all(query, params);
  
  // For each customer, calculate total spent and pending balance
  const customersWithStats = await Promise.all(
    customers.map(async (c) => {
      const invoices = await all('SELECT total, total_paid FROM invoices WHERE customer_id = ?', [c.id]);
      const totalSpent = invoices.reduce((sum, i) => sum + Number(i.total_paid || 0), 0);
      const totalPending = invoices.reduce((sum, i) => sum + Number(i.balance || 0), 0);
      return { ...c, totalSpent, totalPending };
    })
  );
  
  res.json(customersWithStats);
}));

app.get('/api/customers/:id', asyncHandler(async (req, res) => {
  const customer = await get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const invoices = await all(
    `SELECT i.*, 
      (SELECT COUNT(*) FROM receipts r WHERE r.invoice_id = i.id) as receipt_count 
     FROM invoices i 
     WHERE i.customer_id = ? 
     ORDER BY i.id DESC`, 
    [req.params.id]
  );
  
  const totalSpent = invoices
    .reduce((sum, invoice) => sum + Number(invoice.total_paid || 0), 0);
  const totalPending = invoices
    .reduce((sum, invoice) => sum + Number(invoice.balance || 0), 0);

  res.json({ ...customer, invoices, totalSpent, totalPending });
}));

app.post('/api/customers', asyncHandler(async (req, res) => {
  const { name, mobile, whatsapp, address, email, notes, preferences, category, profilePhoto, companyName } = req.body;
  const missingFields = validateRequiredFields(['name', 'mobile'], req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
  }

  const seq = await get('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM customers');
  const customerId = `CUST${String(seq.nextId).padStart(4, '0')}`;

  const result = await run(
    `INSERT INTO customers (
      customer_id, name, mobile, whatsapp, address, email, notes, preferences, category, profile_photo, company_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customerId,
      name,
      mobile,
      whatsapp || null,
      address || null,
      email || null,
      notes || null,
      preferences || null,
      category || 'Regular',
      profilePhoto || null,
      companyName || null,
    ]
  );

  const newCustomer = await get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
  await logActivity(null, 'System', 'CREATE', 'customers', result.lastID, null, newCustomer, req.ip, req.headers['user-agent']);
  res.status(201).json(newCustomer);
}));

app.put('/api/customers/:id', asyncHandler(async (req, res) => {
  const { name, mobile, whatsapp, address, email, notes, preferences, category, profilePhoto, companyName } = req.body;
  const oldCustomer = await get('SELECT * FROM customers WHERE id = ?', [req.params.id]);

  if (!oldCustomer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const updated = {
    name: isFilled(name) ? name : oldCustomer.name,
    mobile: isFilled(mobile) ? mobile : oldCustomer.mobile,
    whatsapp: whatsapp !== undefined ? whatsapp : oldCustomer.whatsapp,
    address: address !== undefined ? address : oldCustomer.address,
    email: email !== undefined ? email : oldCustomer.email,
    notes: notes !== undefined ? notes : oldCustomer.notes,
    preferences: preferences !== undefined ? preferences : oldCustomer.preferences,
    category: isFilled(category) ? category : oldCustomer.category,
    profile_photo: profilePhoto !== undefined ? profilePhoto : oldCustomer.profile_photo,
    company_name: companyName !== undefined ? companyName : oldCustomer.company_name,
  };

  await run(
    `UPDATE customers
     SET name = ?, mobile = ?, whatsapp = ?, address = ?, email = ?, notes = ?,
         preferences = ?, category = ?, profile_photo = ?, company_name = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      updated.name,
      updated.mobile,
      updated.whatsapp,
      updated.address,
      updated.email,
      updated.notes,
      updated.preferences,
      updated.category,
      updated.profile_photo,
      updated.company_name,
      req.params.id,
    ]
  );

  const newCustomer = await get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'UPDATE', 'customers', Number(req.params.id), oldCustomer, newCustomer, req.ip, req.headers['user-agent']);
  res.json({ message: 'Customer updated', customer: newCustomer });
}));

app.delete('/api/customers/:id', asyncHandler(async (req, res) => {
  const oldCustomer = await get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (!oldCustomer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  await run('DELETE FROM customers WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'DELETE', 'customers', Number(req.params.id), oldCustomer, null, req.ip, req.headers['user-agent']);
  res.json({ message: 'Customer deleted' });
}));

app.get('/api/services', asyncHandler(async (_req, res) => {
  const services = await all('SELECT * FROM services ORDER BY id');
  res.json(services);
}));

app.post('/api/services', asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  const missingFields = validateRequiredFields(['name', 'price'], req.body);
  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
  }
  
  const result = await run('INSERT INTO services (name, price) VALUES (?, ?)', [name, price]);
  const newService = await get('SELECT * FROM services WHERE id = ?', [result.lastID]);
  res.status(201).json(newService);
}));

app.get('/api/invoices', asyncHandler(async (req, res) => {
  const { 
    search, 
    status, 
    paymentStatus, 
    customerId, 
    startDate, 
    endDate 
  } = req.query;
  
  let query = `
    SELECT i.*, c.name AS customer_name 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    WHERE 1=1
  `;
  let params = [];
  
  if (search) {
    query += ' AND (i.invoice_number LIKE ? OR c.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    query += ' AND i.status = ?';
    params.push(status);
  }
  if (paymentStatus) {
    query += ' AND i.payment_status = ?';
    params.push(paymentStatus);
  }
  if (customerId) {
    query += ' AND i.customer_id = ?';
    params.push(customerId);
  }
  if (startDate) {
    query += ' AND i.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND i.date <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY i.id DESC';
  const invoices = await all(query, params);
  res.json(invoices);
}));

app.get('/api/invoices/:id', asyncHandler(async (req, res) => {
  const invoice = await get(
    `SELECT i.*, c.name AS customer_name
     FROM invoices i
     LEFT JOIN customers c ON i.customer_id = c.id
     WHERE i.id = ?`,
    [req.params.id]
  );

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const items = await all(
    `SELECT ii.*, s.name AS service_name
     FROM invoice_items ii
     JOIN services s ON ii.service_id = s.id
     WHERE ii.invoice_id = ?`,
    [req.params.id]
  );
  
  const receipts = await all('SELECT * FROM receipts WHERE invoice_id = ? ORDER BY id DESC', [req.params.id]);

  res.json({ ...invoice, items, receipts });
}));

app.post('/api/invoices', asyncHandler(async (req, res) => {
  const { customer_id, date, items, discount, tax, notes, beforeServicePhotos, afterServicePhotos } = req.body;
  const missingFields = validateRequiredFields(['date', 'items'], req.body);

  if (missingFields.length > 0 || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Missing required fields',
      fields: !Array.isArray(items) || items.length === 0 ? [...missingFields, 'items'] : missingFields,
    });
  }

  const seq = await get('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM invoices');
  const invoiceNumber = `INV${String(seq.nextId).padStart(6, '0')}`;

  const normalizedDiscount = Number(discount || 0);
  const normalizedTax = Number(tax || 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0);
  const discountAmount = (subtotal * normalizedDiscount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * normalizedTax) / 100;
  const total = taxableAmount + taxAmount;

  const result = await run(
    `INSERT INTO invoices (
      invoice_number, date, customer_id, discount, tax, subtotal, total, total_paid, balance, 
      status, payment_status, notes, before_service_photos, after_service_photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
    [
      invoiceNumber,
      date,
      customer_id || null,
      normalizedDiscount,
      normalizedTax,
      subtotal,
      total,
      total,
      'pending',
      'pending',
      notes || null,
      JSON.stringify(beforeServicePhotos || []),
      JSON.stringify(afterServicePhotos || []),
    ]
  );

  for (const item of items) {
    const amount = Number(item.rate) * Number(item.quantity);
    await run(
      'INSERT INTO invoice_items (invoice_id, service_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
      [result.lastID, item.service_id, Number(item.quantity || 0), Number(item.rate || 0), amount]
    );
  }

  const newInvoice = await get('SELECT * FROM invoices WHERE id = ?', [result.lastID]);
  await logActivity(null, 'System', 'CREATE', 'invoices', result.lastID, null, newInvoice, req.ip, req.headers['user-agent']);
  res.status(201).json(newInvoice);
}));

app.put('/api/invoices/:id/status', asyncHandler(async (req, res) => {
  const { status, beforeServicePhotos, afterServicePhotos } = req.body;
  const oldInvoice = await get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);

  if (!oldInvoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const nextStatus = isFilled(status) ? status : oldInvoice.status;
  const nextBeforePhotos = beforeServicePhotos !== undefined
    ? JSON.stringify(beforeServicePhotos || [])
    : oldInvoice.before_service_photos;
  const nextAfterPhotos = afterServicePhotos !== undefined
    ? JSON.stringify(afterServicePhotos || [])
    : oldInvoice.after_service_photos;

  await run(
    `UPDATE invoices
     SET status = ?, before_service_photos = ?, after_service_photos = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nextStatus, nextBeforePhotos, nextAfterPhotos, req.params.id]
  );

  const newInvoice = await get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'UPDATE_STATUS', 'invoices', Number(req.params.id), oldInvoice, newInvoice, req.ip, req.headers['user-agent']);
  res.json({ message: 'Invoice updated', invoice: newInvoice });
}));

app.get('/api/receipts', asyncHandler(async (req, res) => {
  const { invoiceId, startDate, endDate } = req.query;
  let query = `
    SELECT r.*, i.invoice_number, c.name AS customer_name
    FROM receipts r
    JOIN invoices i ON r.invoice_id = i.id
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE 1=1
  `;
  let params = [];
  
  if (invoiceId) {
    query += ' AND r.invoice_id = ?';
    params.push(invoiceId);
  }
  if (startDate) {
    query += ' AND date(r.created_at) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date(r.created_at) <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY r.id DESC';
  const receipts = await all(query, params);
  res.json(receipts);
}));

app.post('/api/receipts', asyncHandler(async (req, res) => {
  const { invoice_id, payment_method, amount_received, notes, receiptPhotos } = req.body;
  const missingFields = validateRequiredFields(['invoice_id', 'payment_method', 'amount_received'], req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
  }

  // Get invoice to calculate new balance
  const invoice = await get('SELECT total, total_paid FROM invoices WHERE id = ?', [invoice_id]);
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const newTotalPaid = Number(invoice.total_paid) + Number(amount_received);
  const newBalance = Number(invoice.total) - newTotalPaid;

  const seq = await get('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM receipts');
  const receiptNumber = `RCP${String(seq.nextId).padStart(6, '0')}`;

  const result = await run(
    `INSERT INTO receipts (
      receipt_number, invoice_id, payment_method, amount_received, balance_amount, notes, receipt_photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      receiptNumber,
      invoice_id,
      payment_method,
      Number(amount_received),
      newBalance,
      notes || null,
      JSON.stringify(receiptPhotos || []),
    ]
  );

  // Update invoice payment status
  await updateInvoicePaymentStatus(invoice_id);

  const newReceipt = await get('SELECT * FROM receipts WHERE id = ?', [result.lastID]);
  await logActivity(null, 'System', 'CREATE', 'receipts', result.lastID, null, newReceipt, req.ip, req.headers['user-agent']);
  res.status(201).json(newReceipt);
}));

app.get('/api/expenses', asyncHandler(async (req, res) => {
  const { category, startDate, endDate } = req.query;
  let query = 'SELECT * FROM expenses WHERE 1=1';
  let params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY date DESC, id DESC';
  const expenses = await all(query, params);
  res.json(expenses);
}));

app.post('/api/expenses', asyncHandler(async (req, res) => {
  const { category, description, amount, date } = req.body;
  const missingFields = validateRequiredFields(['category', 'amount', 'date'], req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
  }

  const result = await run(
    'INSERT INTO expenses (category, description, amount, date) VALUES (?, ?, ?, ?)',
    [category, description || null, Number(amount), date]
  );

  const newExpense = await get('SELECT * FROM expenses WHERE id = ?', [result.lastID]);
  await logActivity(null, 'System', 'CREATE', 'expenses', result.lastID, null, newExpense, req.ip, req.headers['user-agent']);
  res.status(201).json(newExpense);
}));

app.put('/api/expenses/:id', asyncHandler(async (req, res) => {
  const { category, description, amount, date } = req.body;
  const oldExpense = await get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

  if (!oldExpense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const updated = {
    category: isFilled(category) ? category : oldExpense.category,
    description: description !== undefined ? description : oldExpense.description,
    amount: amount !== undefined ? Number(amount) : oldExpense.amount,
    date: isFilled(date) ? date : oldExpense.date,
  };

  await run(
    `UPDATE expenses
     SET category = ?, description = ?, amount = ?, date = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [updated.category, updated.description, updated.amount, updated.date, req.params.id]
  );

  const newExpense = await get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'UPDATE', 'expenses', Number(req.params.id), oldExpense, newExpense, req.ip, req.headers['user-agent']);
  res.json({ message: 'Expense updated', expense: newExpense });
}));

app.delete('/api/expenses/:id', asyncHandler(async (req, res) => {
  const oldExpense = await get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
  if (!oldExpense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  await run('DELETE FROM expenses WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'DELETE', 'expenses', Number(req.params.id), oldExpense, null, req.ip, req.headers['user-agent']);
  res.json({ message: 'Expense deleted' });
}));

app.get('/api/dashboard', asyncHandler(async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

  const [
    todaySalesRow,
    monthlySalesRow,
    yearlySalesRow,
    totalCustomersRow,
    vipCustomersRow,
    newCustomersRow,
    pendingInvoicesRow,
    partialInvoicesRow,
    paidInvoicesRow,
    pendingAmountRow,
    totalExpensesRow,
    monthlyExpensesRow,
    recentBills,
    serviceRevenue,
    topCustomers,
    monthlyStats,
  ] = await Promise.all([
    get("SELECT COALESCE(SUM(total_paid), 0) AS total FROM invoices WHERE date = ? AND payment_status IN ('partial', 'paid')", [today]),
    get("SELECT COALESCE(SUM(total_paid), 0) AS total FROM invoices WHERE date >= ? AND payment_status IN ('partial', 'paid')", [firstDayOfMonth]),
    get("SELECT COALESCE(SUM(total_paid), 0) AS total FROM invoices WHERE date >= ? AND payment_status IN ('partial', 'paid')", [firstDayOfYear]),
    get('SELECT COUNT(*) AS count FROM customers'),
    get("SELECT COUNT(*) AS count FROM customers WHERE category = 'VIP'"),
    get('SELECT COUNT(*) AS count FROM customers WHERE date(created_at) = ?', [today]),
    get("SELECT COUNT(*) AS count FROM invoices WHERE payment_status = 'pending'"),
    get("SELECT COUNT(*) AS count FROM invoices WHERE payment_status = 'partial'"),
    get("SELECT COUNT(*) AS count FROM invoices WHERE payment_status = 'paid'"),
    get("SELECT COALESCE(SUM(balance), 0) AS total FROM invoices WHERE payment_status IN ('pending', 'partial')"),
    get("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses"),
    get("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date >= ?", [firstDayOfMonth]),
    all(
      `SELECT i.*, c.name AS customer_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       ORDER BY i.id DESC
       LIMIT 10`
    ),
    all(
      `SELECT s.name, COALESCE(SUM(ii.amount), 0) AS revenue
       FROM services s
       LEFT JOIN invoice_items ii ON s.id = ii.service_id
       LEFT JOIN invoices i ON ii.invoice_id = i.id
       WHERE i.id IS NULL OR (i.date >= ? AND i.payment_status IN ('partial', 'paid'))
       GROUP BY s.id, s.name
       ORDER BY revenue DESC`,
      [firstDayOfMonth]
    ),
    all(`
      SELECT c.*, SUM(i.total_paid) as total_spent
      FROM customers c
      JOIN invoices i ON c.id = i.customer_id
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 5
    `),
    all(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(total_paid) as revenue,
        COUNT(*) as invoices_count
      FROM invoices
      WHERE date >= ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month
    `, [firstDayOfYear])
  ]);

  res.json({
    todaySales: Number(todaySalesRow.total || 0),
    monthlySales: Number(monthlySalesRow.total || 0),
    yearlySales: Number(yearlySalesRow.total || 0),
    totalCustomers: Number(totalCustomersRow.count || 0),
    vipCustomers: Number(vipCustomersRow.count || 0),
    newCustomersToday: Number(newCustomersRow.count || 0),
    pendingInvoices: Number(pendingInvoicesRow.count || 0),
    partialInvoices: Number(partialInvoicesRow.count || 0),
    paidInvoices: Number(paidInvoicesRow.count || 0),
    pendingAmount: Number(pendingAmountRow.total || 0),
    totalExpenses: Number(totalExpensesRow.total || 0),
    monthlyExpenses: Number(monthlyExpensesRow.total || 0),
    recentBills,
    serviceRevenue,
    topCustomers,
    monthlyStats,
  });
}));

app.get('/api/activity-logs', asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 200;
  const logs = await all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?', [limit]);
  res.json(logs);
}));

// Client Details Endpoints
app.get('/api/client-details', asyncHandler(async (_req, res) => {
  const details = await all('SELECT * FROM client_details ORDER BY id DESC');
  res.json(details);
}));

app.post('/api/client-details', asyncHandler(async (req, res) => {
  const { client_name, company_name, contact_number, email, meeting_date } = req.body;
  
  const result = await run(
    `INSERT INTO client_details (client_name, company_name, contact_number, email, meeting_date) VALUES (?, ?, ?, ?, ?)`,
    [client_name, company_name, contact_number, email, meeting_date]
  );
  
  const newDetails = await get('SELECT * FROM client_details WHERE id = ?', [result.lastID]);
  await logActivity(null, 'System', 'CREATE', 'client_details', result.lastID, null, newDetails, req.ip, req.headers['user-agent']);
  res.status(201).json(newDetails);
}));

app.put('/api/client-details/:id', asyncHandler(async (req, res) => {
  const { client_name, company_name, contact_number, email, meeting_date } = req.body;
  const oldDetails = await get('SELECT * FROM client_details WHERE id = ?', [req.params.id]);
  if (!oldDetails) {
    return res.status(404).json({ message: 'Client details not found' });
  }
  
  await run(
    `UPDATE client_details SET client_name = ?, company_name = ?, contact_number = ?, email = ?, meeting_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [client_name, company_name, contact_number, email, meeting_date, req.params.id]
  );
  
  const newDetails = await get('SELECT * FROM client_details WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'UPDATE', 'client_details', Number(req.params.id), oldDetails, newDetails, req.ip, req.headers['user-agent']);
  res.json({ message: 'Client details updated', details: newDetails });
}));

app.delete('/api/client-details/:id', asyncHandler(async (req, res) => {
  const oldDetails = await get('SELECT * FROM client_details WHERE id = ?', [req.params.id]);
  if (!oldDetails) {
    return res.status(404).json({ message: 'Client details not found' });
  }
  
  await run('DELETE FROM client_details WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'DELETE', 'client_details', Number(req.params.id), oldDetails, null, req.ip, req.headers['user-agent']);
  res.json({ message: 'Client details deleted' });
}));

// Business Details Endpoints
app.get('/api/business-details', asyncHandler(async (_req, res) => {
  const details = await all('SELECT * FROM business_details ORDER BY id DESC');
  res.json(details);
}));

app.post('/api/business-details', asyncHandler(async (req, res) => {
  const { business_name, business_type, number_of_branches, business_hours, services_offered, pickup_and_delivery, online_booking } = req.body;
  
  const result = await run(
    `INSERT INTO business_details (business_name, business_type, number_of_branches, business_hours, services_offered, pickup_and_delivery, online_booking) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [business_name, business_type, number_of_branches, business_hours, services_offered, pickup_and_delivery, online_booking]
  );
  
  const newDetails = await get('SELECT * FROM business_details WHERE id = ?', [result.lastID]);
  await logActivity(null, 'System', 'CREATE', 'business_details', result.lastID, null, newDetails, req.ip, req.headers['user-agent']);
  res.status(201).json(newDetails);
}));

app.put('/api/business-details/:id', asyncHandler(async (req, res) => {
  const { business_name, business_type, number_of_branches, business_hours, services_offered, pickup_and_delivery, online_booking } = req.body;
  const oldDetails = await get('SELECT * FROM business_details WHERE id = ?', [req.params.id]);
  if (!oldDetails) {
    return res.status(404).json({ message: 'Business details not found' });
  }
  
  await run(
    `UPDATE business_details SET business_name = ?, business_type = ?, number_of_branches = ?, business_hours = ?, services_offered = ?, pickup_and_delivery = ?, online_booking = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [business_name, business_type, number_of_branches, business_hours, services_offered, pickup_and_delivery, online_booking, req.params.id]
  );
  
  const newDetails = await get('SELECT * FROM business_details WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'UPDATE', 'business_details', Number(req.params.id), oldDetails, newDetails, req.ip, req.headers['user-agent']);
  res.json({ message: 'Business details updated', details: newDetails });
}));

app.delete('/api/business-details/:id', asyncHandler(async (req, res) => {
  const oldDetails = await get('SELECT * FROM business_details WHERE id = ?', [req.params.id]);
  if (!oldDetails) {
    return res.status(404).json({ message: 'Business details not found' });
  }
  
  await run('DELETE FROM business_details WHERE id = ?', [req.params.id]);
  await logActivity(null, 'System', 'DELETE', 'business_details', Number(req.params.id), oldDetails, null, req.ip, req.headers['user-agent']);
  res.json({ message: 'Business details deleted' });
}));

app.post('/api/backup', asyncHandler(async (_req, res) => {
  const backupPath = path.join(BACKUP_DIR, `cobbler_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
  fs.copyFileSync(DB_PATH, backupPath);
  res.json({ message: 'Backup created', path: backupPath });
}));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

(async () => {
  try {
    await initializeDatabase();
    console.log('Connected to SQLite database at:', DB_PATH);
    console.log('Database initialized successfully.');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
})();
