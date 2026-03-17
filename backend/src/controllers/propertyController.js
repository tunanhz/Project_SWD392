const { Property, User } = require('../models');

const postProperty = async (req, res) => {
  try {
    const { title, description, address, startingPrice, area, beds, baths, propertyType } = req.body;
    const property = await Property.create({
      title,
      description,
      address,
      startingPrice,
      area,
      beds,
      baths,
      propertyType,
      ownerId: req.user.userId,
      status: 'PENDING'
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const { Auction, User, PropertyImage } = require('../models');
    const properties = await Property.findAll({ 
      include: [
        { model: User, as: 'owner', attributes: ['username'] },
        { model: Auction, as: 'auction' },
        { model: PropertyImage, as: 'images' }
      ] 
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED
    const property = await Property.findByPk(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    property.status = status;
    await property.save();
    res.json({ message: `Property ${status.toLowerCase()} successfully`, property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Auction, User, PropertyImage } = require('../models');
    const property = await Property.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['username'] },
        { model: Auction, as: 'auction' },
        { model: PropertyImage, as: 'images' }
      ]
    });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { postProperty, getProperties, approveProperty, getPropertyById };
