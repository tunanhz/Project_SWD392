const { Property, User } = require('../models');

const postProperty = async (req, res) => {
  try {
    const { title, description, address, startingPrice } = req.body;
    const property = await Property.create({
      title,
      description,
      address,
      startingPrice,
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
    const properties = await Property.findAll({ include: [{ model: User, as: 'owner', attributes: ['username'] }] });
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

module.exports = { postProperty, getProperties, approveProperty };
