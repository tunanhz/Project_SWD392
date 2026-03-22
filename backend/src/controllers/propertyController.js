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

const getMyProperties = async (req, res) => {
  try {
    const { Auction, PropertyImage } = require('../models');
    const properties = await Property.findAll({
      where: { ownerId: req.user.userId },
      include: [
        { model: Auction, as: 'auction' },
        { model: PropertyImage, as: 'images' }
      ],
      order: [['createdAt', 'DESC']]
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

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    if (property.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own properties' });
    }
    if (property.status !== 'PENDING') {
      return res.status(400).json({ message: 'Can only update properties with PENDING status' });
    }

    const { title, description, address, startingPrice, area, beds, baths, propertyType } = req.body;
    if (title) property.title = title;
    if (description) property.description = description;
    if (address) property.address = address;
    if (startingPrice) property.startingPrice = startingPrice;
    if (area !== undefined) property.area = area;
    if (beds !== undefined) property.beds = beds;
    if (baths !== undefined) property.baths = baths;
    if (propertyType) property.propertyType = propertyType;

    await property.save();
    res.json({ message: 'Property updated successfully', property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { postProperty, getProperties, getMyProperties, approveProperty, getPropertyById, updateProperty };

