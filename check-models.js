// Script to test available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Models to test based on what's in your dropdown
const modelsToTest = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash', 
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  // Additional common models to test
  'gemini-pro',
  'gemini-1.5-flash-8b',
  'gemini-1.0-pro'
];

async function testModel(modelId) {
  try {
    const model = genAI.getGenerativeModel({ model: modelId });
    
    // Try to send a simple message
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      response: text.slice(0, 50) + (text.length > 50 ? '...' : '')
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkAllModels() {
  console.log('🔍 Testing Gemini models from your dropdown...');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const modelId of modelsToTest) {
    console.log(`\n🧪 Testing: ${modelId}`);
    const result = await testModel(modelId);
    
    if (result.success) {
      console.log(`✅ WORKS - Response: ${result.response}`);
      results.push({ model: modelId, status: 'WORKING' });
    } else {
      console.log(`❌ FAILED - ${result.error}`);
      
      if (result.error.includes('404')) {
        results.push({ model: modelId, status: 'NOT_FOUND' });
      } else if (result.error.includes('429')) {
        results.push({ model: modelId, status: 'RATE_LIMITED' });
      } else {
        results.push({ model: modelId, status: 'ERROR', error: result.error });
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(60));
  
  const working = results.filter(r => r.status === 'WORKING');
  const notFound = results.filter(r => r.status === 'NOT_FOUND');
  const rateLimited = results.filter(r => r.status === 'RATE_LIMITED');
  const errors = results.filter(r => r.status === 'ERROR');
  
  console.log(`\n✅ WORKING MODELS (${working.length}):`);
  working.forEach(r => console.log(`   • ${r.model}`));
  
  console.log(`\n❌ NOT FOUND (${notFound.length}):`);
  notFound.forEach(r => console.log(`   • ${r.model}`));
  
  console.log(`\n⏰ RATE LIMITED (${rateLimited.length}):`);
  rateLimited.forEach(r => console.log(`   • ${r.model}`));
  
  if (errors.length > 0) {
    console.log(`\n🚨 OTHER ERRORS (${errors.length}):`);
    errors.forEach(r => console.log(`   • ${r.model}: ${r.error}`));
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (working.length > 0) {
    console.log(`   Use these working models: ${working.map(r => r.model).join(', ')}`);
  }
  if (notFound.length > 0) {
    console.log(`   Remove these from dropdown: ${notFound.map(r => r.model).join(', ')}`);
  }
}

checkAllModels().catch(console.error);

