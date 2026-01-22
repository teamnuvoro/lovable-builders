#!/usr/bin/env ts-node
/**
 * VOICE CALL VALIDATION SCRIPT
 * 
 * Run this before deploying or making changes to ensure voice calls are not broken.
 * 
 * Usage: npm run validate-voice-calls
 * or: npx ts-node scripts/validate-voice-calls.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = join(__dirname, '..');

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function validateVoiceCallFiles(): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  // 1. Check RiyaVoiceCall.tsx uses protected config
  try {
    const riyaVoiceCall = readFileSync(
      join(PROJECT_ROOT, 'client/src/components/voice/RiyaVoiceCall.tsx'),
      'utf-8'
    );
    
    if (!riyaVoiceCall.includes('getProtectedCallConfig')) {
      result.errors.push('❌ RiyaVoiceCall.tsx does NOT use getProtectedCallConfig()');
      result.passed = false;
    } else {
      console.log('✅ RiyaVoiceCall.tsx uses protected config');
    }
    
    if (!riyaVoiceCall.includes('validateCallConfig')) {
      result.errors.push('❌ RiyaVoiceCall.tsx does NOT validate config');
      result.passed = false;
    } else {
      console.log('✅ RiyaVoiceCall.tsx validates config');
    }
    
    // Check for dangerous patterns
    if (riyaVoiceCall.includes('assistant:')) {
      result.errors.push('❌ RiyaVoiceCall.tsx contains "assistant:" wrapper (causes 400 errors)');
      result.passed = false;
    }
    
    if (riyaVoiceCall.includes('systemMessage:')) {
      result.errors.push('❌ RiyaVoiceCall.tsx contains "systemMessage:" (causes 400 errors)');
      result.passed = false;
    }
    
    if (riyaVoiceCall.includes('model.messages')) {
      result.errors.push('❌ RiyaVoiceCall.tsx contains "model.messages" (causes 400 errors)');
      result.passed = false;
    }
    
    if (riyaVoiceCall.includes('voiceId: "') && !riyaVoiceCall.includes('voiceId: "Neha"')) {
      const match = riyaVoiceCall.match(/voiceId:\s*"([^"]+)"/);
      if (match && match[1] !== 'Neha') {
        result.warnings.push(`⚠️  Voice ID is "${match[1]}" instead of "Neha"`);
      }
    }
    
    if (riyaVoiceCall.includes('provider: "sarvam"')) {
      result.errors.push('❌ RiyaVoiceCall.tsx uses "sarvam" provider (not supported in Vapi web calls)');
      result.passed = false;
    }
    
    if (riyaVoiceCall.includes('custom-voice')) {
      result.errors.push('❌ RiyaVoiceCall.tsx uses "custom-voice" (causes 400 errors)');
      result.passed = false;
    }
    
  } catch (error: any) {
    result.errors.push(`❌ Could not read RiyaVoiceCall.tsx: ${error.message}`);
    result.passed = false;
  }

  // 2. Check protection layer exists
  try {
    const protection = readFileSync(
      join(PROJECT_ROOT, 'client/src/lib/voiceCallProtection.ts'),
      'utf-8'
    );
    
    if (!protection.includes('LOCKED_VOICE_CONFIG')) {
      result.errors.push('❌ voiceCallProtection.ts missing LOCKED_VOICE_CONFIG');
      result.passed = false;
    } else {
      console.log('✅ Protection layer exists');
    }
    
    if (!protection.includes('validateCallConfig')) {
      result.errors.push('❌ voiceCallProtection.ts missing validateCallConfig()');
      result.passed = false;
    }
    
  } catch (error: any) {
    result.errors.push(`❌ Protection layer missing: ${error.message}`);
    result.passed = false;
  }

  // 3. Check vapiCallManager uses singleton pattern
  try {
    const manager = readFileSync(
      join(PROJECT_ROOT, 'client/src/lib/vapiCallManager.ts'),
      'utf-8'
    );
    
    if (!manager.includes('let vapi: Vapi | null = null')) {
      result.warnings.push('⚠️  vapiCallManager.ts may not use singleton pattern');
    } else {
      console.log('✅ vapiCallManager.ts uses singleton pattern');
    }
    
  } catch (error: any) {
    result.warnings.push(`⚠️  Could not verify vapiCallManager.ts: ${error.message}`);
  }

  // 4. Check .env has Vapi public key
  try {
    const env = readFileSync(join(PROJECT_ROOT, '.env'), 'utf-8');
    
    if (!env.includes('VITE_VAPI_PUBLIC_KEY=')) {
      result.warnings.push('⚠️  .env missing VITE_VAPI_PUBLIC_KEY');
    } else {
      const match = env.match(/VITE_VAPI_PUBLIC_KEY=([^\s]+)/);
      if (match && match[1]) {
        console.log(`✅ Vapi public key configured: ${match[1].substring(0, 8)}...`);
      }
    }
    
  } catch (error: any) {
    result.warnings.push(`⚠️  Could not check .env: ${error.message}`);
  }

  return result;
}

// Run validation
console.log('🔒 Validating Voice Call Protection...\n');
const result = validateVoiceCallFiles();

console.log('\n📊 Validation Results:');
if (result.errors.length > 0) {
  console.log('\n❌ ERRORS:');
  result.errors.forEach(err => console.log(`  ${err}`));
}

if (result.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  result.warnings.forEach(warn => console.log(`  ${warn}`));
}

if (result.passed && result.errors.length === 0) {
  console.log('\n✅ Voice call protection is intact!');
  process.exit(0);
} else {
  console.log('\n❌ Voice call protection has issues. Fix errors before deploying.');
  process.exit(1);
}
