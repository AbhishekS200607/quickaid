const express = require('express');
const supabase = require('./supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

router.get('/numbers', async (req, res) => {
  try {
    const { city } = req.query;
    let query = supabase
      .from('emergency_contacts')
      .select('*')
      .eq('is_verified', true);
    
    if (city && city !== 'all') {
      query = query.or(`city.eq.All,city.eq.${city}`);
    }
    
    query = query.order('upvotes', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('city')
      .eq('is_verified', true)
      .neq('city', 'All');
    
    if (error) throw error;
    const cities = [...new Set(data.map(d => d.city))].sort();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { name, phone, category, city, description } = req.body;
    
    if (!name || !phone || !category || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      phone: phone.trim().substring(0, 20),
      category: category.trim(),
      city: city.trim().substring(0, 50),
      description: description ? description.trim().substring(0, 500) : null,
      is_verified: false,
      upvotes: 0
    };
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([sanitizedData])
      .select();
    
    if (error) throw error;
    res.json({ success: true, message: 'Submission received. Pending verification.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    const isValid = bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/pending', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('is_verified', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/logout', async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/admin/approve/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update({ is_verified: true })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/delete/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
