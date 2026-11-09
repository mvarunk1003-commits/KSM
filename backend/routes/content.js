const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const fileUpload = require('express-fileupload');

// Activities routes
router.get('/activities', async (req, res) => {
  try {
    const activitiesPath = path.join(__dirname, '../data/activities.json');
    const activitiesData = await fs.readFile(activitiesPath, 'utf8');
    res.json(JSON.parse(activitiesData));
  } catch (error) {
    console.error('Error reading activities:', error);
    res.json([]);
  }
});

router.post('/activities', async (req, res) => {
  try {
    const activitiesPath = path.join(__dirname, '../data/activities.json');
    let activities = [];
    
    try {
      const activitiesData = await fs.readFile(activitiesPath, 'utf8');
      activities = JSON.parse(activitiesData);
    } catch (error) {
      activities = [];
    }

    const newActivity = {
      id: Date.now(),
      ...req.body,
      images: req.files ? Object.keys(req.files).map(key => req.files[key].name) : []
    };

    activities.push(newActivity);
    await fs.writeFile(activitiesPath, JSON.stringify(activities, null, 2));
    res.json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

router.put('/activities/:id', async (req, res) => {
  try {
    const activitiesPath = path.join(__dirname, '../data/activities.json');
    let activities = JSON.parse(await fs.readFile(activitiesPath, 'utf8'));
    
    const index = activities.findIndex(a => a.id == req.params.id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...req.body };
      await fs.writeFile(activitiesPath, JSON.stringify(activities, null, 2));
      res.json(activities[index]);
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

router.delete('/activities/:id', async (req, res) => {
  try {
    const activitiesPath = path.join(__dirname, '../data/activities.json');
    let activities = JSON.parse(await fs.readFile(activitiesPath, 'utf8'));
    
    activities = activities.filter(a => a.id != req.params.id);
    await fs.writeFile(activitiesPath, JSON.stringify(activities, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Announcements routes
router.get('/announcements', async (req, res) => {
  try {
    const announcementsPath = path.join(__dirname, '../data/announcements.json');
    const announcementsData = await fs.readFile(announcementsPath, 'utf8');
    res.json(JSON.parse(announcementsData));
  } catch (error) {
    console.error('Error reading announcements:', error);
    res.json([]);
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const announcementsPath = path.join(__dirname, '../data/announcements.json');
    let announcements = [];
    
    try {
      const announcementsData = await fs.readFile(announcementsPath, 'utf8');
      announcements = JSON.parse(announcementsData);
    } catch (error) {
      announcements = [];
    }

    const newAnnouncement = {
      id: Date.now(),
      ...req.body,
      images: req.files ? Object.keys(req.files).map(key => req.files[key].name) : []
    };

    announcements.push(newAnnouncement);
    await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2));
    res.json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

router.put('/announcements/:id', async (req, res) => {
  try {
    const announcementsPath = path.join(__dirname, '../data/announcements.json');
    let announcements = JSON.parse(await fs.readFile(announcementsPath, 'utf8'));
    
    const index = announcements.findIndex(a => a.id == req.params.id);
    if (index !== -1) {
      announcements[index] = { ...announcements[index], ...req.body };
      await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2));
      res.json(announcements[index]);
    } else {
      res.status(404).json({ error: 'Announcement not found' });
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    const announcementsPath = path.join(__dirname, '../data/announcements.json');
    let announcements = JSON.parse(await fs.readFile(announcementsPath, 'utf8'));
    
    announcements = announcements.filter(a => a.id != req.params.id);
    await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// Banner images routes
router.get('/banner-images', async (req, res) => {
  try {
    const bannersPath = path.join(__dirname, '../data/banner-images.json');
    const bannersData = await fs.readFile(bannersPath, 'utf8');
    res.json(JSON.parse(bannersData));
  } catch (error) {
    console.error('Error reading banner images:', error);
    res.json([]);
  }
});

router.post('/banner-images', async (req, res) => {
  try {
    const bannersPath = path.join(__dirname, '../data/banner-images.json');
    let banners = [];
    
    try {
      const bannersData = await fs.readFile(bannersPath, 'utf8');
      banners = JSON.parse(bannersData);
    } catch (error) {
      banners = [];
    }

    const newBanner = {
      id: Date.now(),
      ...req.body,
      images: req.files ? Object.keys(req.files).map(key => req.files[key].name) : []
    };

    banners.push(newBanner);
    await fs.writeFile(bannersPath, JSON.stringify(banners, null, 2));
    res.json(newBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.put('/banner-images/:id', async (req, res) => {
  try {
    const bannersPath = path.join(__dirname, '../data/banner-images.json');
    let banners = JSON.parse(await fs.readFile(bannersPath, 'utf8'));
    
    const index = banners.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
      banners[index] = { ...banners[index], ...req.body };
      await fs.writeFile(bannersPath, JSON.stringify(banners, null, 2));
      res.json(banners[index]);
    } else {
      res.status(404).json({ error: 'Banner not found' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

router.delete('/banner-images/:id', async (req, res) => {
  try {
    const bannersPath = path.join(__dirname, '../data/banner-images.json');
    let banners = JSON.parse(await fs.readFile(bannersPath, 'utf8'));
    
    banners = banners.filter(b => b.id != req.params.id);
    await fs.writeFile(bannersPath, JSON.stringify(banners, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;
