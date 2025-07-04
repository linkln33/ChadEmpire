#!/bin/bash

# Script to clean up Prisma-related files after migration to Supabase
# Created: July 4, 2025

echo "Starting Prisma cleanup process..."

# Remove Prisma schema and migration files
echo "Removing Prisma schema and migration files..."
rm -rf prisma/

# Remove Prisma client from node_modules
echo "Removing Prisma client from node_modules..."
rm -rf node_modules/@prisma

# Remove Prisma utility file
echo "Removing Prisma utility file..."
rm -f src/lib/prisma.ts

# Update package.json to remove Prisma scripts
echo "Updating package.json to remove Prisma scripts..."
# This was already done manually

echo "Cleanup complete!"
echo "Note: Remember to run 'npm install' to update your node_modules after this cleanup."
