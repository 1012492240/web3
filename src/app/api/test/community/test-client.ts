/**
 * Client-side utility for testing the community API error scenarios
 * 
 * This utility tests the following error scenarios:
 * 1. invalid_transaction - Missing transaction hash
 * 2. no_from_address - Missing sender address
 * 3. no_type - Missing community type
 * 4. insufficient_balance - Insufficient balance for transaction
 * 5. wrong_destination - Incorrect destination address
 * 6. non_usdt - Using a non-USDT token
 * 7. invalid_amount - Amount doesn't match the membership type
 */

import { COMMUNITY_TYPE, GROUP_TYPE, NORMAL_TYPE } from '@/constants';
import type { MembershipType } from '@/constants';

// Define the scenarios to test
const scenarios = [
  'invalid_transaction',
  'no_from_address',
  'no_type',
  'insufficient_balance',
  'wrong_destination',
  'non_usdt',
  'invalid_amount',
  'success' // Test the success case too
];

// Define the membership types to test
const membershipTypes = [
  COMMUNITY_TYPE,
  GROUP_TYPE,
  NORMAL_TYPE
];

interface TestResult {
  scenario: string;
  type: string;
  status: number;
  response: any;
  error?: string;
}

/**
 * Test a specific scenario with a specific membership type
 */
async function testScenario(
  scenario: string, 
  type: MembershipType = COMMUNITY_TYPE,
  address: string = '8btmH7kk4wNxQ4hweRE5MooSVTxhPjgcmzV9iFVou2uB',
  referralCode: string = 'REF123'
): Promise<TestResult> {
  try {
    console.log(`Testing scenario: ${scenario} with type: ${type}`);
    
    // Call the test endpoint
    const response = await fetch('/api/test/community', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        scenario, 
        type, 
        address, 
        referralCode 
      }),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Log the results
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    return {
      scenario,
      type,
      status: response.status,
      response: data
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error testing scenario ${scenario} with type ${type}:`, error);
    return {
      scenario,
      type,
      status: 500,
      response: null,
      error: errorMessage
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
      const result = await testScenario(scenario, type as MembershipType);
      results.push(result);
    }
  }
  
  // Log the final results
  console.log('All test results:', results);
  
  // Count successes and failures
  const failures = results.filter(r => r.status >= 400 || r.error).length;
  const successes = results.length - failures;
  
  console.log(`Test summary: ${successes} successes, ${failures} failures`);
  
  return results;
}

/**
 * Format test results as a table for easier reading
 */
function formatResultsTable(results: TestResult[]): string {
  let table = '| Scenario | Type | Status | Response |\n';
  table += '|----------|------|--------|----------|\n';
  
  for (const result of results) {
    const responseText = result.error || 
      (result.response ? 
        JSON.stringify(result.response).substring(0, 50) + '...' : 
        'No response');
    
    table += `| ${result.scenario} | ${result.type} | ${result.status} | ${responseText} |\n`;
  }
  
  return table;
}

// Export the test functions
export {
  testScenario,
  runAllTests,
  formatResultsTable
};

// Auto-run the tests if this script is executed directly in a browser environment
if (typeof window !== 'undefined') {
  console.log('Running community API error tests...');
  runAllTests().then((results) => {
    console.log('All tests completed!');
    console.log(formatResultsTable(results));
  });
}
