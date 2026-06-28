/**
 * db.js - Database Utility Functions
 * 
 * All database operations use these utility functions.
 * Data is stored in JSON files in the /database directory.
 * 
 * Functions:
 *   readData(filename)              - Read all records from a JSON file
 *   writeData(filename, data)       - Write all records to a JSON file
 *   findById(filename, id)          - Find a single record by its id
 *   createRecord(filename, data)    - Create a new record with auto ID + timestamps
 *   updateRecord(filename, id, updates) - Update a record by id
 *   deleteRecord(filename, id)      - Delete a record by id
 *   paginateData(data, page, limit) - Return a paginated slice of data
 *   searchData(data, query, fields) - Filter records by search term
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the database directory
const DB_DIR = path.join(__dirname, '../database');

/**
 * Read all records from a JSON file
 * @param {string} filename - e.g. 'users', 'products' (without .json extension)
 * @returns {Array} - Array of records
 */
const readData = (filename) => {
  try {
    const filePath = path.join(DB_DIR, `${filename}.json`);
    
    // If file doesn't exist, return empty array
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading ${filename}.json:`, error.message);
    return [];
  }
};

/**
 * Write all records to a JSON file (replaces entire file)
 * @param {string} filename - e.g. 'users', 'products'
 * @param {Array} data - Array of records to write
 */
const writeData = (filename, data) => {
  try {
    const filePath = path.join(DB_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}.json:`, error.message);
    return false;
  }
};

/**
 * Find a single record by its id field
 * @param {string} filename - Database file name
 * @param {string} id - Record id to find
 * @returns {Object|null} - Found record or null
 */
const findById = (filename, id) => {
  const data = readData(filename);
  return data.find(record => record.id === id) || null;
};

/**
 * Create a new record with auto-generated UUID and timestamps
 * @param {string} filename - Database file name
 * @param {Object} recordData - Record data (without id, createdAt, updatedAt)
 * @returns {Object} - The newly created record
 */
const createRecord = (filename, recordData) => {
  const data = readData(filename);
  
  const newRecord = {
    id: uuidv4(),
    ...recordData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.push(newRecord);
  writeData(filename, data);
  
  return newRecord;
};

/**
 * Update an existing record by id (partial update / patch)
 * @param {string} filename - Database file name
 * @param {string} id - Record id to update
 * @param {Object} updates - Fields to update
 * @returns {Object|null} - Updated record or null if not found
 */
const updateRecord = (filename, id, updates) => {
  const data = readData(filename);
  const index = data.findIndex(record => record.id === id);
  
  if (index === -1) {
    return null; // Record not found
  }
  
  // Merge existing record with updates
  data[index] = {
    ...data[index],
    ...updates,
    id: data[index].id, // Prevent id from being overwritten
    createdAt: data[index].createdAt, // Preserve original creation date
    updatedAt: new Date().toISOString(),
  };
  
  writeData(filename, data);
  return data[index];
};

/**
 * Delete a record by id
 * @param {string} filename - Database file name
 * @param {string} id - Record id to delete
 * @returns {boolean} - true if deleted, false if not found
 */
const deleteRecord = (filename, id) => {
  const data = readData(filename);
  const index = data.findIndex(record => record.id === id);
  
  if (index === -1) {
    return false; // Record not found
  }
  
  data.splice(index, 1);
  writeData(filename, data);
  return true;
};

/**
 * Paginate an array of data
 * @param {Array} data - Full data array
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} - { data, total, page, totalPages }
 */
const paginateData = (data, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  return {
    data: data.slice(startIndex, endIndex),
    total: data.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(data.length / limitNum),
    hasNextPage: endIndex < data.length,
    hasPrevPage: startIndex > 0,
  };
};

/**
 * Search/filter records by a search query across specified fields
 * @param {Array} data - Array of records to search
 * @param {string} query - Search term
 * @param {Array} fields - Fields to search in (e.g. ['name', 'email'])
 * @returns {Array} - Filtered records matching the query
 */
const searchData = (data, query, fields) => {
  if (!query || !query.trim()) {
    return data; // Return all if no query
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return data.filter(record => {
    return fields.some(field => {
      const value = record[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
};

module.exports = {
  readData,
  writeData,
  findById,
  createRecord,
  updateRecord,
  deleteRecord,
  paginateData,
  searchData,
};
