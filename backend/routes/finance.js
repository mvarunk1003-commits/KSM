const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');

// Income routes
router.get('/income', async (req, res) => {
  try {
    const incomePath = path.join(__dirname, '../data/income.json');
    const incomeData = await fs.readFile(incomePath, 'utf8');
    res.json(JSON.parse(incomeData));
  } catch (error) {
    console.error('Error reading income:', error);
    res.json([]);
  }
});

router.post('/income', async (req, res) => {
  try {
    const incomePath = path.join(__dirname, '../data/income.json');
    let income = [];
    
    try {
      const incomeData = await fs.readFile(incomePath, 'utf8');
      income = JSON.parse(incomeData);
    } catch (error) {
      income = [];
    }

    const newIncome = {
      id: Date.now(),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    income.push(newIncome);
    await fs.writeFile(incomePath, JSON.stringify(income, null, 2));
    res.json(newIncome);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Failed to create income' });
  }
});

router.put('/income/:id', async (req, res) => {
  try {
    const incomePath = path.join(__dirname, '../data/income.json');
    let income = JSON.parse(await fs.readFile(incomePath, 'utf8'));
    
    const index = income.findIndex(i => i.id == req.params.id);
    if (index !== -1) {
      income[index] = { ...income[index], ...req.body };
      await fs.writeFile(incomePath, JSON.stringify(income, null, 2));
      res.json(income[index]);
    } else {
      res.status(404).json({ error: 'Income not found' });
    }
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
});

router.delete('/income/:id', async (req, res) => {
  try {
    const incomePath = path.join(__dirname, '../data/income.json');
    let income = JSON.parse(await fs.readFile(incomePath, 'utf8'));
    
    income = income.filter(i => i.id != req.params.id);
    await fs.writeFile(incomePath, JSON.stringify(income, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// Expenses routes
router.get('/expenses', async (req, res) => {
  try {
    const expensesPath = path.join(__dirname, '../data/expenses.json');
    const expensesData = await fs.readFile(expensesPath, 'utf8');
    res.json(JSON.parse(expensesData));
  } catch (error) {
    console.error('Error reading expenses:', error);
    res.json([]);
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const expensesPath = path.join(__dirname, '../data/expenses.json');
    let expenses = [];
    
    try {
      const expensesData = await fs.readFile(expensesPath, 'utf8');
      expenses = JSON.parse(expensesData);
    } catch (error) {
      expenses = [];
    }

    const newExpense = {
      id: Date.now(),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    expenses.push(newExpense);
    await fs.writeFile(expensesPath, JSON.stringify(expenses, null, 2));
    res.json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.put('/expenses/:id', async (req, res) => {
  try {
    const expensesPath = path.join(__dirname, '../data/expenses.json');
    let expenses = JSON.parse(await fs.readFile(expensesPath, 'utf8'));
    
    const index = expenses.findIndex(e => e.id == req.params.id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...req.body };
      await fs.writeFile(expensesPath, JSON.stringify(expenses, null, 2));
      res.json(expenses[index]);
    } else {
      res.status(404).json({ error: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    const expensesPath = path.join(__dirname, '../data/expenses.json');
    let expenses = JSON.parse(await fs.readFile(expensesPath, 'utf8'));
    
    expenses = expenses.filter(e => e.id != req.params.id);
    await fs.writeFile(expensesPath, JSON.stringify(expenses, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Donations routes
router.get('/donations', async (req, res) => {
  try {
    const donationsPath = path.join(__dirname, '../data/donations.json');
    const donationsData = await fs.readFile(donationsPath, 'utf8');
    res.json(JSON.parse(donationsData));
  } catch (error) {
    console.error('Error reading donations:', error);
    res.json([]);
  }
});

router.post('/donations', async (req, res) => {
  try {
    const donationsPath = path.join(__dirname, '../data/donations.json');
    let donations = [];
    
    try {
      const donationsData = await fs.readFile(donationsPath, 'utf8');
      donations = JSON.parse(donationsData);
    } catch (error) {
      donations = [];
    }

    const newDonation = {
      id: Date.now(),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    donations.push(newDonation);
    await fs.writeFile(donationsPath, JSON.stringify(donations, null, 2));
    res.json(newDonation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

router.put('/donations/:id', async (req, res) => {
  try {
    const donationsPath = path.join(__dirname, '../data/donations.json');
    let donations = JSON.parse(await fs.readFile(donationsPath, 'utf8'));
    
    const index = donations.findIndex(d => d.id == req.params.id);
    if (index !== -1) {
      donations[index] = { ...donations[index], ...req.body };
      await fs.writeFile(donationsPath, JSON.stringify(donations, null, 2));
      res.json(donations[index]);
    } else {
      res.status(404).json({ error: 'Donation not found' });
    }
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ error: 'Failed to update donation' });
  }
});

router.delete('/donations/:id', async (req, res) => {
  try {
    const donationsPath = path.join(__dirname, '../data/donations.json');
    let donations = JSON.parse(await fs.readFile(donationsPath, 'utf8'));
    
    donations = donations.filter(d => d.id != req.params.id);
    await fs.writeFile(donationsPath, JSON.stringify(donations, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ error: 'Failed to delete donation' });
  }
});

// Excel upload route
router.post('/upload-excel', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const type = req.body.type; // 'income' or 'expense'
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return res.status(400).json({ error: 'Please upload an Excel file (.xlsx or .xls)' });
    }

    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      return res.status(400).json({ error: 'Excel file must have at least a header row and one data row' });
    }

    const headers = data[0];
    const records = data.slice(1);
    const processedRecords = [];

    for (const record of records) {
      if (record.length >= 4) {
        const recordObj = {};
        headers.forEach((header, index) => {
          recordObj[header] = record[index];
        });

        // Improved date parsing - handle DD/MM/YYYY format
        let parsedDate = new Date().toISOString().split('T')[0];
        if (recordObj.date) {
          try {
            let dateValue;
            const dateStr = recordObj.date.toString().trim();
            
            // Check if it's in DD/MM/YYYY format
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                const year = parseInt(parts[2]);
                dateValue = new Date(year, month, day);
              } else {
                dateValue = new Date(dateStr);
              }
            } else {
              dateValue = new Date(dateStr);
            }
            
            if (!isNaN(dateValue.getTime())) {
              parsedDate = dateValue.toISOString().split('T')[0];
            }
          } catch (error) {
            console.log('Date parsing error:', error);
          }
        }

        const processedRecord = {
          id: Date.now() + Math.random(),
          title: recordObj.title || recordObj.Title || '',
          amount: recordObj.amount || recordObj.Amount || 0,
          category: recordObj.category || recordObj.Category || (type === 'income' ? 'Donation' : 'Maintenance'),
          date: parsedDate,
          description: recordObj.description || recordObj.Description || ''
        };

        processedRecords.push(processedRecord);
      }
    }

    // Save to appropriate file
    const filePath = path.join(__dirname, `../data/${type}.json`);
    let existingData = [];
    
    try {
      const existingDataStr = await fs.readFile(filePath, 'utf8');
      existingData = JSON.parse(existingDataStr);
    } catch (error) {
      existingData = [];
    }

    existingData.push(...processedRecords);
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    res.json({ 
      success: true, 
      count: processedRecords.length, 
      totalRecords: existingData.length,
      message: `Successfully imported ${processedRecords.length} ${type} records`
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

// Template download routes
router.get('/download-template/:type', (req, res) => {
  try {
    const type = req.params.type;
    const getCurrentDate = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    };

    let data = [];
    if (type === 'income') {
      data = [
        ['title', 'amount', 'category', 'date', 'description'],
        ['Temple Donation', 50000, 'Donation', getCurrentDate(), 'Monthly donation from devotees'],
        ['Event Income', 25000, 'Event Income', getCurrentDate(), 'Income from special events'],
        ['Rental Income', 15000, 'Rental Income', getCurrentDate(), 'Property rental income']
      ];
    } else if (type === 'expense') {
      data = [
        ['title', 'amount', 'category', 'date', 'description'],
        ['Temple Maintenance', 15000, 'Maintenance', getCurrentDate(), 'Regular cleaning and repairs'],
        ['Electricity Bill', 5000, 'Utilities', getCurrentDate(), 'Monthly electricity payment'],
        ['Event Supplies', 8000, 'Supplies', getCurrentDate(), 'Materials for temple events']
      ];
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'income' ? 'Income' : 'Expenses');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-template.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

module.exports = router;
