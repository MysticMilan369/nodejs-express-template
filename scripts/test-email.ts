import 'dotenv/config';
import { emailService } from '../src/lib/email/email.service';
import { config } from '../src/config';

console.log('Testing email service connection...');

async function testEmailService() {
  console.log('Check configuration...');
  console.log('Email service config:', config.email);

  const result = await emailService.testConnection();
  if (result) {
    console.log('Email service is working correctly.');
  } else {
    console.log('Email service is not working.');
  }
}

testEmailService().catch((error) => {
  console.error('❌ Email service test failed:', error);
  process.exit(1);
});
