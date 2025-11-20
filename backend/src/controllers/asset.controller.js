import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

export const getAllAssets = async (req, res) => {
  try {
    const assets = await db('assets')
      .select('*')
      .orderBy('created_at', 'desc');
    
    res.json({
      success: true,
      data: assets,
      count: assets.length
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error.message
    });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const asset = await db('assets')
      .select('*')
      .where('id', id)
      .first();
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset',
      error: error.message
    });
  }
};

export const createAsset = async (req, res) => {
  try {
    const assetData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'location', 'status'];
    for (const field of requiredFields) {
      if (!assetData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    const [newAsset] = await db('assets')
      .insert(assetData)
      .returning('*');
    
    res.status(201).json({
      success: true,
      data: newAsset,
      message: 'Asset created successfully'
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset',
      error: error.message
    });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if asset exists
    const existingAsset = await db('assets')
      .where('id', id)
      .first();
    
    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    const [updatedAsset] = await db('assets')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    res.json({
      success: true,
      data: updatedAsset,
      message: 'Asset updated successfully'
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset',
      error: error.message
    });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const existingAsset = await db('assets')
      .where('id', id)
      .first();
    
    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    await db('assets')
      .where('id', id)
      .del();
    
    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset',
      error: error.message
    });
  }
};
