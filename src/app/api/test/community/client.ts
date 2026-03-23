/**
 * Client-side test script for testing the community API error scenarios
 * 
 * This script tests the following error scenarios:
 * 1. Invalid transaction - simulate a failed transaction
 * 2. Insufficient balance - simulate insufficient balance error
 * 3. Wrong destination - simulate incorrect destination address
 * 4. Non-USDT token - simulate using a non-USDT token
 * 5. Invalid amount - simulate incorrect amount for the membership type
 * 
 * Usage:
 * - Run this script from the browser console or a Node.js environment
 * - It will test all error scenarios and log the results
 */

import { COMMUNITY_TYPE, GROUP_TYPE, NORMAL_TYPE } from '@/constants';

// Define the scenarios to test
const scenarios = [
  'invalid_transaction',
  'insufficient_balance',
  'wrong_destination',
  'non_usdt',
  'invalid_amount'
];

// Define the membership types to test
const membershipTypes = [
  COMMUNITY_TYPE,
  GROUP_TYPE,
  NORMAL_TYPE
];

// 定义测试结果接口
interface TestResult {
  scenario: string;
  type: string;
  testStatus?: number;
  testResponse?: any;
  apiStatus?: number;
  apiResponse?: any;
  error?: string;
}

/**
 * Test a specific scenario with a specific membership type
 */
async function testScenario(scenario: string, type: string): Promise<TestResult> {
  try {
    console.log(`Testing scenario: ${scenario} with type: ${type}`);
    
    // Call the test endpoint
    const response = await fetch('/api/test/community', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario, type }),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Log the results
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    // Now try to call the actual community API with this scenario
    const communityResponse = await fetch('/api/points/community', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txHash: `mock_tx_${scenario}`,
        dev_address: '8btmH7kk4wNxQ4hweRE5MooSVTxhPjgcmzV9iFVou2uB',
        dev_referralCode: 'REF123',
        dev_type: type
      }),
    });
    
    // Get the community API response
    const communityData = await communityResponse.json();
    
    // Log the community API results
    console.log(`Community API Status: ${communityResponse.status}`);
    console.log('Community API Response:', communityData);
    
    console.log('-----------------------------------');
    
    return {
      scenario,
      type,
      testStatus: response.status,
      testResponse: data,
      apiStatus: communityResponse.status,
      apiResponse: communityData
    };
  } catch (error: unknown) {
    console.error(`Error testing scenario ${scenario} with type ${type}:`, error);
    return {
      scenario,
      type,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run all tests for all scenarios and membership types
 */
async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Test each scenario with each membership type
  for (const scenario of scenarios) {
    for (const type of membershipTypes) {
      const result = await testScenario(scenario, type);
      results.push(result);
    }
  }
  
  // Test the success scenario with each membership type
  for (const type of membershipTypes) {
    const result = await testScenario('success', type);
    results.push(result);
  }
  
  // Log the final results
  console.log('All test results:', results);
  
  // Count successes and failures
  const failures = results.filter(r => (r.apiStatus && r.apiStatus >= 400) || r.error).length;
  const successes = results.length - failures;
  
  console.log(`Test summary: ${successes} successes, ${failures} failures`);
  
  return results;
}

// Export the test functions
export {
  testScenario,
  runAllTests
};

// Auto-run the tests if this script is executed directly
if (typeof window !== 'undefined') {
  console.log('Running community API error tests...');
  runAllTests().then(() => {
    console.log('All tests completed!');
  });
}
