const { Property, User, LegalDocument } = require('../models');

const postProperty = async (req, res) => {
  try {
    const { title, description, address, startingPrice, area, beds, baths, propertyType } = req.body;

    // Validate starting price > 0
    if (!startingPrice || startingPrice <= 0) {
      return res.status(400).json({ error: 'Starting price must be greater than 0 VND' });
    }

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
        { model: PropertyImage, as: 'images' },
        { model: LegalDocument, as: 'legalDocuments' }
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
        { model: PropertyImage, as: 'images' },
        { model: LegalDocument, as: 'legalDocuments' }
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

    // Notify the property owner
    const { createNotification } = require('./notificationController');
    const notifType = status === 'APPROVED' ? 'PROPERTY_APPROVED' : 'PROPERTY_REJECTED';
    await createNotification(
      property.ownerId,
      notifType,
      `Tài sản "${property.title}" đã được ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'}`,
      `Tài sản tại ${property.address} đã ${status === 'APPROVED' ? 'được phê duyệt và sẵn sàng đấu giá' : 'bị từ chối. Vui lòng kiểm tra lại thông tin'}.`,
      { propertyId: property.id }
    );

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
        { model: PropertyImage, as: 'images' },
        { model: LegalDocument, as: 'legalDocuments' }
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

// Withdraw a property (Owner can withdraw before auction starts)
const withdrawProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id, {
      include: [{ model: require('../models').Auction, as: 'auction' }]
    });

    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'You can only withdraw your own properties' });
    }
    
    // Cannot withdraw if auction is ACTIVE
    if (property.auction && property.auction.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot withdraw a property with an active auction' });
    }

    if (property.status === 'SOLD') {
      return res.status(400).json({ message: 'Cannot withdraw a sold property' });
    }

    property.status = 'WITHDRAWN';
    await property.save();

    // Cancel associated auction if exists and is UPCOMING
    if (property.auction && property.auction.status === 'UPCOMING') {
      property.auction.status = 'CANCELLED';
      await property.auction.save();
    }

    res.json({ message: 'Property withdrawn successfully', property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload legal documents
const uploadLegalDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'You can only upload documents for your own properties' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const legalDoc = await LegalDocument.create({
      propertyId: id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype
    });

    res.status(201).json({ message: 'Legal document uploaded successfully', document: legalDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { postProperty, getProperties, getMyProperties, approveProperty, getPropertyById, updateProperty, withdrawProperty, uploadLegalDocument };
