// Скрипт для проверки доступности API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

console.log('🔍 Проверка API:', API_URL);

async function checkAPI() {
  try {
    // Проверка health endpoint
    const health = await fetch(`${API_URL}/health`);
    console.log('✅ Health check:', health.ok ? 'OK' : 'FAILED');
    if (health.ok) {
      const data = await health.json();
      console.log('   Response:', data);
    }
    
    // Проверка currencies endpoint
    const currencies = await fetch(`${API_URL}/api/currencies`);
    console.log('✅ Currencies:', currencies.ok ? 'OK' : 'FAILED');
    if (currencies.ok) {
      const data = await currencies.json();
      console.log('   Found currencies:', data.currencies?.length || 0);
    } else {
      console.log('   Error:', await currencies.text());
    }
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.log('\n💡 Возможные причины:');
    console.log('   1. Backend не задеплоен');
    console.log('   2. NEXT_PUBLIC_API_URL неправильный');
    console.log('   3. Backend не запущен');
  }
}

checkAPI();
