#!/usr/bin/env ts-node

import { DatabaseService } from './services/database/database.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🤖 Agent Charlie Backend Setup');
  console.log('================================');
  
  try {
    const dbService = new DatabaseService();
    
    console.log('📊 Initializing database...');
    await dbService.initialize();
    
    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3001/health');
    console.log('3. Test authentication endpoints');
    console.log('4. Configure OAuth providers');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    if (error.message.includes('SUPABASE_URL')) {
      console.log('');
      console.log('🔧 Missing Supabase configuration:');
      console.log('1. Create a Supabase project at https://supabase.com');
      console.log('2. Copy your project URL and service role key');
      console.log('3. Add them to your .env file');
    }
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('');
      console.log('🔧 Missing OpenAI configuration:');
      console.log('1. Get your API key from https://openai.com');
      console.log('2. Add OPENAI_API_KEY to your .env file');
    }
    
    process.exit(1);
  }
}

async function runSchemaSetup() {
  console.log('🗄️ Setting up database schema...');
  
  try {
    const schemaPath = join(__dirname, 'services/database/schemas.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Schema loaded from:', schemaPath);
    console.log('');
    console.log('📋 Manual setup required:');
    console.log('1. Connect to your PostgreSQL database');
    console.log('2. Run the following SQL commands:');
    console.log('');
    console.log('--- Copy everything below this line ---');
    console.log(schema);
    console.log('--- Copy everything above this line ---');
    console.log('');
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error);
  }
}

// Main setup function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--schema-only')) {
    await runSchemaSetup();
  } else {
    await setupDatabase();
  }
}

// Run setup
main().catch(console.error);
